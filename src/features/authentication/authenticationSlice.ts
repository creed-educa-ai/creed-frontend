import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authenticationApi } from '@/features/authentication/authenticationApi';
import { ApiError } from '@/lib/apiClient';
import { clearSession, getSession, setSession } from '@/lib/session';
import type { LoginRequest, UserSessionResponse } from '@/types/api';

interface AuthenticationState {
  user: UserSessionResponse | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: string | null;
}

const savedSession = getSession();

const initialState: AuthenticationState = {
  user: savedSession?.user ?? null,
  status: savedSession ? 'authenticated' : 'idle',
  error: null,
};

/**
 * O que atravessa daqui para a tela é chave de tradução, nunca o texto do
 * backend — que vem só em português e não passa pelo i18n.
 *
 * Um 401 vira sempre a MESMA chave: o contrato exige que senha errada, e-mail
 * inexistente e acesso desativado sejam indistinguíveis para quem está na tela.
 */
function chaveDeErro(erro: unknown): string {
  if (erro instanceof ApiError && erro.status === 401) {
    return 'autenticacao:erros.loginInvalido';
  }
  return 'autenticacao:erros.servicoIndisponivel';
}

export const login = createAsyncThunk<
  UserSessionResponse,
  LoginRequest & { lembrarDeMim?: boolean },
  { rejectValue: string }
>('authentication/login', async (credenciais, { rejectWithValue }) => {
  const { lembrarDeMim, ...dados } = credenciais;

  try {
    const session = await authenticationApi.login(dados);
    setSession(session, lembrarDeMim);
    return session.user;
  } catch (erro) {
    return rejectWithValue(chaveDeErro(erro));
  }
});

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    logout(state) {
      clearSession();
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          action.payload ?? 'autenticacao:erros.servicoIndisponivel';
      });
  },
});

export const { logout } = authenticationSlice.actions;
export default authenticationSlice.reducer;
