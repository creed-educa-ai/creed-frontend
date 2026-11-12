// Chamadas ao backend para o domínio users (app/domains/users/router.py e,
// fora da dev ainda, router_members.py).
import { apiClient } from '@/lib/apiClient';
import type {
  DepartmentType,
  MemberInvite,
  MemberList,
  Mentee,
  UserCreate,
  UserResponse,
} from '@/types/api';

// ---------------------------------------------------------------------------
// MOCK — mentorandos (painel do super adm)
// No back seria participante com vínculo `mentoria`; falta a rota que liste.
// ---------------------------------------------------------------------------

const menteeSeed: Mentee[] = [
  {
    id: '1',
    name: 'Enner Valência',
    email: 'enner.valencia@example.com',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '2',
    name: 'Wilson Mathias',
    email: 'wilson.mathias@example.com',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '3',
    name: 'Volante Ronaldo',
    email: 'volante.ronaldo@example.com',
    status: 'active',
    hasAnsweredCurrent: false,
  },
  {
    id: '4',
    name: 'Maurides Cambalhota',
    email: 'maurides.cambalhota@example.com',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '5',
    name: 'Clayton Sampaio',
    email: 'clayton.sampaio@example.com',
    status: 'inactive',
    hasAnsweredCurrent: false,
  },
];

let menteeRegistry: Mentee[] = cloneAll(menteeSeed);

function cloneAll<T extends object>(items: T[]): T[] {
  return items.map((item) => ({ ...item }));
}

// Os testes começam sempre da mesma lista de mentorandos.
export function resetMenteesMock() {
  menteeRegistry = cloneAll(menteeSeed);
}

export const usersApi = {
  // --- rotas do back -------------------------------------------------------

  // Só admin. O papel vem do vínculo (`link_id`), não do corpo.
  createUser: (user: UserCreate) =>
    apiClient.post<UserResponse>('/users', user),

  // Só admin. 204 sem corpo.
  deleteUser: (userId: string) => apiClient.delete(`/users/${userId}`),

  // Uma chamada cria participante, vínculo e acesso, e manda o convite por e-mail.
  inviteMember: (organizationId: string, invite: MemberInvite) =>
    apiClient.post<UserResponse>(
      `/organizations/${organizationId}/members`,
      invite,
    ),

  // Reenvia o convite de quem ainda não definiu a senha. 204 sem corpo.
  resendInvitation: (userId: string) =>
    apiClient.post<undefined>(`/users/${userId}/invitation`, undefined),

  // --- Rotas reais de membros ---

  listMembers: (organizationId: string) =>
    apiClient.get<MemberList>(`/organizations/${organizationId}/members`),

  removeMember: (organizationId: string, linkId: string): Promise<void> =>
    apiClient.delete(`/organizations/${organizationId}/members/${linkId}`),

  setMemberTag: (
    organizationId: string,
    linkId: string,
    departmentId: DepartmentType | null,
  ): Promise<void> =>
    apiClient.patch(`/organizations/${organizationId}/members/${linkId}`, {
      department_id: departmentId,
    }),

  // --- MOCK — Mentorandos (mantidos pois estão fora da task atual) ---

  listMentees: (): Promise<Mentee[]> =>
    Promise.resolve(cloneAll(menteeRegistry)),

  removeMentee: (id: string): Promise<void> => {
    menteeRegistry = menteeRegistry.filter((mentee) => mentee.id !== id);
    return Promise.resolve();
  },
};
