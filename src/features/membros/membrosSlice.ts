// Slice Redux da feature membros (RTK).
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { membrosApi } from '@/features/membros/membrosApi';
import type { Membro } from '@/types/api';

interface MembrosState {
  itens: Membro[];
  total: number;
  empresa: string;
  status: 'idle' | 'carregando' | 'pronto' | 'erro';
  erro: 'erroCarregamento' | null;
}

const initialState: MembrosState = {
  itens: [],
  total: 0,
  empresa: '',
  status: 'idle',
  erro: null,
};

export const carregarMembros = createAsyncThunk('membros/carregar', async () =>
  membrosApi.listar(),
);

export const excluirMembro = createAsyncThunk(
  'membros/excluir',
  async (id: string) => {
    await membrosApi.remover(id);
    return id;
  },
);

const membrosSlice = createSlice({
  name: 'membros',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(carregarMembros.pending, (state) => {
        state.status = 'carregando';
        state.erro = null;
      })
      .addCase(carregarMembros.fulfilled, (state, action) => {
        state.status = 'pronto';
        state.erro = null;
        state.itens = action.payload.itens;
        state.total = action.payload.total;
        state.empresa = action.payload.empresa;
      })
      .addCase(carregarMembros.rejected, (state) => {
        state.status = 'erro';
        state.erro = 'erroCarregamento';
      })
      .addCase(excluirMembro.fulfilled, (state, action) => {
        state.itens = state.itens.filter(
          (membro) => membro.id !== action.payload,
        );
        state.total = state.itens.length;
      });
  },
});

export default membrosSlice.reducer;
