import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authenticationApi } from '@/features/authentication/authenticationApi';
import { ApiError } from '@/lib/apiClient';
import { clearSession, getSession, setSession } from '@/lib/session';
import type {
  LoginRequest,
  PasswordResetRequest,
  UserSessionResponse,
} from '@/types/api';

interface AuthenticationState {
  user: UserSessionResponse | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: string | null;
  /**
   * O pedido de "esqueci minha senha" tem status próprio: quem pede o link
   * não está entrando, e o `status` acima é o do login.
   */
  passwordReset: {
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
  };
}

const savedSession = getSession();

const initialState: AuthenticationState = {
  user: savedSession?.user ?? null,
  status: savedSession ? 'authenticated' : 'idle',
  error: null,
  passwordReset: { status: 'idle', error: null },
};

/** 422 do reset: o back recusou o e-mail que o formulário aceitou. */
export const EMAIL_RECUSADO = 'autenticacao:erros.emailInvalido';

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

/**
 * O 422 é do campo e-mail. O resto (503, rede fora) é "tente de novo": não
 * há outro erro a mostrar, porque o back responde 204 para e-mail sem acesso.
 */
function chaveDeErroDoReset(erro: unknown): string {
  if (erro instanceof ApiError && erro.status === 422) {
    return EMAIL_RECUSADO;
  }
  return 'autenticacao:erros.envioIndisponivel';
}

// `undefined`: o 204 não tem corpo, e a tela só precisa saber que deu certo.
export const requestPasswordReset = createAsyncThunk<
  undefined,
  PasswordResetRequest,
  { rejectValue: string }
>(
  'authentication/requestPasswordReset',
  async (pedido, { rejectWithValue }) => {
    try {
      await authenticationApi.requestPasswordReset(pedido);
    } catch (erro) {
      return rejectWithValue(chaveDeErroDoReset(erro));
    }
  },
);

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
    // O store é um só para o app inteiro: sem isto, o resultado do último
    // pedido reaparece quando a pessoa volta à tela de "esqueci minha senha".
    clearPasswordReset(state) {
      state.passwordReset = { status: 'idle', error: null };
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
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordReset.status = 'loading';
        state.passwordReset.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.passwordReset.status = 'ready';
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordReset.status = 'error';
        state.passwordReset.error =
          action.payload ?? 'autenticacao:erros.envioIndisponivel';
      });
  },
});

export const { logout, clearPasswordReset } = authenticationSlice.actions;
export default authenticationSlice.reducer;
