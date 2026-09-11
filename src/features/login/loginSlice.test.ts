import { describe, expect, it, beforeEach } from 'vitest';
import reducer, {
  entrar,
  sair,
  TOKEN_STORAGE_KEY,
} from '@/features/login/loginSlice';

describe('loginSlice', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persiste o token ao concluir o login mockado', () => {
    const estado = reducer(
      undefined,
      entrar.fulfilled({ token: 'token-teste' }, 'request-id', {
        email: 'pessoa@empresa.com.br',
        senha: 'senha',
      }),
    );

    expect(estado.token).toBe('token-teste');
    expect(estado.status).toBe('autenticado');
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('token-teste');
  });

  it('remove o token ao sair', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, 'token-teste');

    const estado = reducer(
      { token: 'token-teste', status: 'autenticado', erro: null },
      sair(),
    );

    expect(estado.token).toBeNull();
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
