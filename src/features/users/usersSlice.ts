// Slice Redux da feature users (RTK): os membros da organização (painel da
// empresa) e os mentorandos (painel do super adm). As duas listas vêm do mock
// do usersApi até o back ter as rotas.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { usersApi } from '@/features/users/usersApi';
import type { DepartmentType, Member, Mentee } from '@/types/api';

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
    items: Mentee[];
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

export const loadMembers = createAsyncThunk(
  'users/loadMembers',
  async (organizationId: string) => usersApi.listMembers(organizationId),
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

export const loadMentees = createAsyncThunk('users/loadMentees', async () =>
  usersApi.listMentees(),
);

export const deleteMentee = createAsyncThunk(
  'users/deleteMentee',
  async (id: string) => {
    await usersApi.removeMentee(id);
    return id;
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
          (mentee) => mentee.id !== action.payload,
        );
      });
  },
});

export default usersSlice.reducer;
