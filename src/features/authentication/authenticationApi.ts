// Chamadas ao backend para o domínio authentication.
import { apiClient } from '@/lib/apiClient';
import type {
  LoginRequest,
  SessionResponse,
  UserSessionResponse,
} from '@/types/api';

export const authenticationApi = {
  login: (credentials: LoginRequest) =>
    apiClient.post<SessionResponse>('/authentication/login', credentials),

  getCurrentUser: () =>
    apiClient.get<UserSessionResponse>('/authentication/session'),
};
