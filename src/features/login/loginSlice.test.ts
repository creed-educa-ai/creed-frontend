import { describe, expect, it, beforeEach } from 'vitest';
import reducer, {
  entrar,
  sair,
  TOKEN_STORAGE_KEY,
} from '@/features/login/loginSlice';

describe('loginSlice', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('persiste o token no localStorage quando "lembrar de mim" está marcado', () => {
    const estado = reducer(
      undefined,
      entrar.fulfilled({ token: 'token-teste' }, 'request-id', {
        email: 'pessoa@empresa.com.br',
        senha: 'senha',
        lembrarDeMim: true,
      }),
    );

    expect(estado.token).toBe('token-teste');
    expect(estado.status).toBe('autenticado');
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('token-teste');
    expect(window.sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('persiste o token só no sessionStorage quando "lembrar de mim" não está marcado', () => {
    const estado = reducer(
      undefined,
      entrar.fulfilled({ token: 'token-teste' }, 'request-id', {
        email: 'pessoa@empresa.com.br',
        senha: 'senha',
        lembrarDeMim: false,
      }),
    );

    expect(estado.token).toBe('token-teste');
    expect(window.sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe(
      'token-teste',
    );
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('remove o token dos dois storages ao sair', () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, 'token-teste');
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, 'token-teste');

    const estado = reducer(
      { token: 'token-teste', status: 'autenticado', erro: null },
      sair(),
    );

    expect(estado.token).toBeNull();
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
