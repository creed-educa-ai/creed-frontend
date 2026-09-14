export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

const TOKEN_MOCK = 'creed-mock-token';

export const loginApi = {
  async entrar(dados: LoginCredentials): Promise<LoginResponse> {
    await Promise.resolve();

    if (!dados.email || !dados.senha) {
      throw new Error('autenticacao:erros.loginInvalido');
    }

    return { token: TOKEN_MOCK };
  },
};
