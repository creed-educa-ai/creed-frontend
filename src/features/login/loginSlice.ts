import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginApi, type LoginCredentials } from '@/features/login/loginApi';

export const TOKEN_STORAGE_KEY = 'creed.auth.token';

interface AuthState {
  token: string | null;
  status: 'idle' | 'carregando' | 'autenticado' | 'erro';
  erro: string | null;
}

const tokenInicial =
  typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(TOKEN_STORAGE_KEY);

const initialState: AuthState = {
  token: tokenInicial,
  status: tokenInicial ? 'autenticado' : 'idle',
  erro: null,
};

export const entrar = createAsyncThunk(
  'auth/entrar',
  async (dados: LoginCredentials) => loginApi.entrar(dados),
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sair(state) {
      state.token = null;
      state.status = 'idle';
      state.erro = null;
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(entrar.pending, (state) => {
        state.status = 'carregando';
        state.erro = null;
      })
      .addCase(entrar.fulfilled, (state, action) => {
        state.status = 'autenticado';
        state.token = action.payload.token;
        window.localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.token);
      })
      .addCase(entrar.rejected, (state, action) => {
        state.status = 'erro';
        state.erro = action.error.message ?? 'autenticacao:erros.loginInvalido';
      });
  },
});

export const { sair } = authSlice.actions;
export default authSlice.reducer;
