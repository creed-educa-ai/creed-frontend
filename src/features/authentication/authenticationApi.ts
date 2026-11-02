// Chamadas ao backend para o domínio authentication.
import { apiClient } from '@/lib/apiClient';
import type {
  LoginRequest,
  PasswordResetRequest,
  SessionResponse,
  UserSessionResponse,
} from '@/types/api';

export const authenticationApi = {
  login: (credentials: LoginRequest) =>
    apiClient.post<SessionResponse>('/authentication/login', credentials),

  getCurrentUser: () =>
    apiClient.get<UserSessionResponse>('/authentication/session'),

  // 204 sem corpo, tenha o e-mail acesso ou não: o back não revela cadastro.
  requestPasswordReset: (request: PasswordResetRequest) =>
    apiClient.post<undefined>('/authentication/password-reset', request),
};
