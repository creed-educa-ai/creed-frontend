// Slice Redux da feature users (RTK): os membros da organização (painel da
// empresa) e os mentorandos (painel do super adm). Os membros ainda vêm do
// mock do usersApi (C-2); os mentorandos já vêm do back, pelo linksApi (M-4).
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { linksApi } from '@/features/links/linksApi';
import {
  INVITE_EMAIL_TAKEN,
  INVITE_FAILED,
  type InviteError,
} from '@/features/users/addMemberSchema';
import { usersApi } from '@/features/users/usersApi';
import { ApiError } from '@/lib/apiClient';
import type { DepartmentType, Member, MemberListItem } from '@/types/api';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface UsersState {
  members: Member[];
  total: number;
  organization: string;
  status: Status;
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: 'organizations:members.loadError' | null;
  // Lista à parte: outra tela, outro momento de carga.
  mentees: {
    items: MemberListItem[];
    status: Status;
    error: 'mentees:loadError' | null;
  };
}

const initialState: UsersState = {
  members: [],
  total: 0,
  organization: '',
  status: 'idle',
  error: null,
  mentees: { items: [], status: 'idle', error: null },
};

export const loadMembers = createAsyncThunk('users/loadMembers', async () =>
  usersApi.listMembers(),
);

export const deleteMember = createAsyncThunk(
  'users/deleteMember',
  async (id: string) => {
    await usersApi.removeMember(id);
    return id;
  },
);

export const updateMemberTag = createAsyncThunk(
  'users/updateMemberTag',
  async ({ id, tag }: { id: string; tag: DepartmentType | null }) => {
    await usersApi.setMemberTag(id, tag);
    return { id, tag };
  },
);

// Mentorando é o vínculo `mentoria` na organização de quem pede (a da CREED,
// para a administradora). A ordem por nome já vem do back (P-070).
export const loadMentees = createAsyncThunk(
  'users/loadMentees',
  async (organizationId: string) =>
    linksApi.listMembers(organizationId, 'mentoria'),
);

/** O que a tela mostra, dentro do modal, quando a exclusão falha. */
export type DeleteMenteeError =
  'mentees:errors.deleteUnavailable' | 'comum:tabela.erroExcluir';

// > 🟡 Premissa P-083 — 404 é "já não existe": conta como excluído, e a linha
// > sai. 503 é o Keycloak fora do ar, com nada apagado no back (P-073): "tente
// > de novo". O resto (403, 409) é a mensagem genérica do modal.
export const deleteMentee = createAsyncThunk<
  string,
  { organizationId: string; linkId: string },
  { rejectValue: DeleteMenteeError }
>(
  'users/deleteMentee',
  async ({ organizationId, linkId }, { rejectWithValue }) => {
    try {
      await linksApi.deleteMember(organizationId, linkId);
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 404) return linkId;
      if (erro instanceof ApiError && erro.status === 503) {
        return rejectWithValue('mentees:errors.deleteUnavailable');
      }
      return rejectWithValue('comum:tabela.erroExcluir');
    }
    return linkId;
  },
);

// Convida o mentorando: vínculo `mentoria`, papel `respondente`, na
// organização de quem pede (a da CREED). Sem `type`, o back gravaria
// `emprego` (P-047). Recarregar a tabela não é daqui: é da tela, depois do
// convite (um thunk, uma responsabilidade).
export const inviteMentee = createAsyncThunk<
  undefined,
  { organizationId: string | null; name: string; email: string },
  { rejectValue: InviteError }
>(
  'users/inviteMentee',
  async ({ organizationId, name, email }, { rejectWithValue }) => {
    // Sem organização na sessão não há onde convidar.
    if (!organizationId) return rejectWithValue(INVITE_FAILED);
    try {
      await usersApi.inviteMember(organizationId, {
        name,
        email,
        role: 'respondente',
        type: 'mentoria',
      });
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 409) {
        return rejectWithValue(INVITE_EMAIL_TAKEN);
      }
      return rejectWithValue(INVITE_FAILED);
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadMembers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadMembers.fulfilled, (state, action) => {
        state.status = 'ready';
        state.error = null;
        state.members = action.payload.itens;
        state.total = action.payload.total;
        state.organization = action.payload.organization;
      })
      .addCase(loadMembers.rejected, (state) => {
        state.status = 'error';
        state.error = 'organizations:members.loadError';
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.members = state.members.filter(
          (member) => member.id !== action.payload,
        );
        state.total = state.members.length;
      })
      .addCase(updateMemberTag.fulfilled, (state, action) => {
        const member = state.members.find(
          (item) => item.id === action.payload.id,
        );
        if (member) member.tag = action.payload.tag;
      })
      .addCase(loadMentees.pending, (state) => {
        state.mentees.status = 'loading';
        state.mentees.error = null;
      })
      .addCase(loadMentees.fulfilled, (state, action) => {
        state.mentees.status = 'ready';
        state.mentees.items = action.payload;
      })
      .addCase(loadMentees.rejected, (state) => {
        state.mentees.status = 'error';
        state.mentees.error = 'mentees:loadError';
      })
      .addCase(deleteMentee.fulfilled, (state, action) => {
        state.mentees.items = state.mentees.items.filter(
          (mentee) => mentee.link_id !== action.payload,
        );
      });
  },
});

export default usersSlice.reducer;
