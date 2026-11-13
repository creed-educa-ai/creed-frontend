// Chamadas ao backend para o domínio users (app/domains/users/router.py e
// router_members.py).
//
// A lista de membros, a exclusão e a troca de setor são do domínio links
// (`linksApi`): o membro é o vínculo da pessoa com a organização. Aqui fica o
// acesso da pessoa: criar, apagar e convidar.
import { apiClient } from '@/lib/apiClient';
import type { MemberInvite, UserCreate, UserResponse } from '@/types/api';

export const usersApi = {
  // Só admin. O papel vem do vínculo (`link_id`), não do corpo.
  createUser: (user: UserCreate) =>
    apiClient.post<UserResponse>('/users', user),

  // Só admin. 204 sem corpo.
  deleteUser: (userId: string) => apiClient.delete(`/users/${userId}`),

  // Uma chamada cria participante, vínculo e acesso, e manda o convite por
  // e-mail. Quem chama são os painéis da empresa e do admin.
  inviteMember: (organizationId: string, invite: MemberInvite) =>
    apiClient.post<UserResponse>(
      `/organizations/${organizationId}/members`,
      invite,
    ),

  // Reenvia o convite de quem ainda não definiu a senha. 204 sem corpo.
  resendInvitation: (userId: string) =>
    apiClient.post<undefined>(`/users/${userId}/invitation`, undefined),
};
