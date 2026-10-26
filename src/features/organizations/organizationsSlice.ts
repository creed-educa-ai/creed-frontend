// Slice Redux da feature organizations (RTK).
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { organizationsApi } from '@/features/organizations/organizationsApi';
import type { Member } from '@/types/api';

interface OrganizationsState {
  members: Member[];
  total: number;
  organization: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: 'organizations:members.loadError' | null;
}

const initialState: OrganizationsState = {
  members: [],
  total: 0,
  organization: '',
  status: 'idle',
  error: null,
};

export const loadMembers = createAsyncThunk(
  'organizations/loadMembers',
  async () => organizationsApi.listMembers(),
);

export const deleteMember = createAsyncThunk(
  'organizations/deleteMember',
  async (id: string) => {
    await organizationsApi.removeMember(id);
    return id;
  },
);

const organizationsSlice = createSlice({
  name: 'organizations',
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
      });
  },
});

export default organizationsSlice.reducer;
