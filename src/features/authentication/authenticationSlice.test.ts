import { beforeEach, describe, expect, it, vi } from 'vitest';
import reducer, {
  login,
  logout,
} from '@/features/authentication/authenticationSlice';

const fakeUser = {
  id: 'usr_1',
  email: 'ana@creed.ai',
  role: 'admin',
  vinculo_id: null,
  organization_id: null,
  organization_name: null,
};

const fakeSession = {
  access_token: 'access-fake',
  refresh_token: 'refresh-fake',
  expires_in: 300,
  user: fakeUser,
};

const initialState = {
  user: null,
  status: 'idle' as const,
  error: null,
};

describe('authenticationSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state (hydration from saved session)', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('starts logged out when there is no saved session', async () => {
      const { default: freshReducer } =
        await import('@/features/authentication/authenticationSlice');
      const state = freshReducer(undefined, { type: '@@INIT' });

      expect(state.user).toBeNull();
      expect(state.status).toBe('idle');
    });

    it('hydrates the user when a session already exists in localStorage', async () => {
      localStorage.setItem('creed.session', JSON.stringify(fakeSession));

      const { default: freshReducer } =
        await import('@/features/authentication/authenticationSlice');
      const state = freshReducer(undefined, { type: '@@INIT' });

      expect(state.user).toEqual(fakeUser);
      expect(state.status).toBe('authenticated');
    });
  });

  it('marks loading when login starts', () => {
    const credentials = { email: fakeUser.email, password: 'secret' };
    const state = reducer(initialState, login.pending('', credentials));

    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('stores the user when login succeeds', () => {
    const credentials = { email: fakeUser.email, password: 'secret' };
    const state = reducer(
      initialState,
      login.fulfilled(fakeUser, '', credentials),
    );

    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(fakeUser);
  });

  it('marks error when login fails, without storing a user', () => {
    // `error` guarda CHAVE de i18n, não texto: a mensagem do backend só existe
    // em português e nunca passaria pelo seletor de idioma.
    const credentials = { email: fakeUser.email, password: 'wrong' };
    const state = reducer(
      initialState,
      login.rejected(
        new Error('rejeitado'),
        '',
        credentials,
        'autenticacao:erros.loginInvalido',
      ),
    );

    expect(state.status).toBe('error');
    expect(state.error).toBe('autenticacao:erros.loginInvalido');
    expect(state.user).toBeNull();
  });

  describe('which error key each failure produces', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('401 becomes the invalid-credentials key', async () => {
      const { ApiError } = await import('@/lib/apiClient');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({ detail: 'E-mail ou senha inválidos' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),
      );

      const action = await login({
        email: fakeUser.email,
        password: 'wrong',
      })(vi.fn(), () => ({}), undefined);

      expect(ApiError).toBeDefined();
      expect(action.payload).toBe('autenticacao:erros.loginInvalido');
    });

    it('backend down becomes the unavailable key, not invalid credentials', async () => {
      // Contrato: indisponibilidade NUNCA pode aparecer como "senha inválida",
      // ou o usuário troca a senha que estava certa.
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(new Response('upstream down', { status: 503 })),
      );

      const action = await login({
        email: fakeUser.email,
        password: 'secret',
      })(vi.fn(), () => ({}), undefined);

      expect(action.payload).toBe('autenticacao:erros.servicoIndisponivel');
    });
  });

  it('logout clears the user and the saved session', () => {
    localStorage.setItem('creed.session', JSON.stringify(fakeSession));
    const loggedInState = {
      user: fakeUser,
      status: 'authenticated' as const,
      error: null,
    };

    const state = reducer(loggedInState, logout());

    expect(state.user).toBeNull();
    expect(state.status).toBe('idle');
    expect(localStorage.getItem('creed.session')).toBeNull();
  });
});
