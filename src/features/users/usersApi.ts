// Chamadas ao backend para o domínio users (app/domains/users/router.py e,
// fora da dev ainda, router_members.py).
//
// Duas partes:
// - rotas que existem no back, transcritas do contrato;
// - MOCK das listas de membros e de mentorandos, que o back ainda não tem.
//   Ficam aqui, e não na tela, para que integrar seja trocar o corpo da função
//   por um `apiClient.get` — a tela e o slice não mudam.
import { apiClient } from '@/lib/apiClient';
import type {
  Member,
  MemberInvite,
  MemberList,
  Mentee,
  UserCreate,
  UserResponse,
} from '@/types/api';

// ---------------------------------------------------------------------------
// MOCK — membros da organização (painel da empresa)
// Falta no back: `GET /organizations/{id}/members` e remover membro.
// ---------------------------------------------------------------------------

const memberSeed: Member[] = [
  {
    id: '1',
    name: 'Enner Valência',
    email: 'michael.mitc@example.com',
    status: 'ativo',
    tag: 'Marketing',
    updated_at: '2026-10-18T14:12:00.000Z',
  },
  {
    id: '2',
    name: 'Wilson Mathias',
    email: 'felicia.reid@example.com',
    status: 'ativo',
    tag: 'Financeiro',
    updated_at: '2026-10-17T09:40:00.000Z',
  },
  {
    id: '3',
    name: 'Volante Ronaldo',
    email: 'georgia.young@example.com',
    status: 'pendente',
    tag: 'RecursosHumanos',
    updated_at: '2026-10-16T18:05:00.000Z',
  },
  {
    id: '4',
    name: 'Maurides Cambalhota',
    email: 'alma.lawson@example.com',
    status: 'ativo',
    tag: 'TecnologiaInformacao',
    updated_at: '2026-10-15T11:22:00.000Z',
  },
  {
    id: '5',
    name: 'Clayton Sampaio',
    email: 'dolores.chambers@example.com',
    status: 'pendente',
    tag: 'Administrativo',
    updated_at: '2026-10-14T08:01:00.000Z',
  },
  {
    id: '6',
    name: 'Ana Souza',
    email: 'ana.souza@example.com',
    status: 'ativo',
    tag: 'Marketing',
    updated_at: '2026-10-13T16:47:00.000Z',
  },
  {
    id: '7',
    name: 'Bruno Lima',
    email: 'bruno.lima@example.com',
    status: 'pendente',
    tag: 'RecursosHumanos',
    updated_at: '2026-10-12T10:18:00.000Z',
  },
  {
    id: '8',
    name: 'Carla Dias',
    email: 'carla.dias@example.com',
    status: 'ativo',
    tag: 'Financeiro',
    updated_at: '2026-10-11T13:33:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// MOCK — mentorandos (painel do super adm)
// No back seria participante com vínculo `mentoria`; falta a rota que liste.
// ---------------------------------------------------------------------------

const menteeSeed: Mentee[] = [
  {
    id: '1',
    name: 'Enner Valência',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '2',
    name: 'Wilson Mathias',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '3',
    name: 'Volante Ronaldo',
    status: 'active',
    hasAnsweredCurrent: false,
  },
  {
    id: '4',
    name: 'Maurides Cambalhota',
    status: 'active',
    hasAnsweredCurrent: true,
  },
  {
    id: '5',
    name: 'Clayton Sampaio',
    status: 'inactive',
    hasAnsweredCurrent: false,
  },
];

let memberRegistry: Member[] = cloneAll(memberSeed);
let menteeRegistry: Mentee[] = cloneAll(menteeSeed);

function cloneAll<T extends object>(items: T[]): T[] {
  return items.map((item) => ({ ...item }));
}

// Os testes começam sempre da mesma lista.
export function resetMembersMock() {
  memberRegistry = cloneAll(memberSeed);
}

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

  // Uma chamada cria participante, vínculo e acesso, e manda o convite por
  // e-mail. Quem liga esta função à tela é o painel da empresa (CREED-50).
  inviteMember: (organizationId: string, invite: MemberInvite) =>
    apiClient.post<UserResponse>(
      `/organizations/${organizationId}/members`,
      invite,
    ),

  // Reenvia o convite de quem ainda não definiu a senha. 204 sem corpo.
  resendInvitation: (userId: string) =>
    apiClient.post<undefined>(`/users/${userId}/invitation`, undefined),

  // --- MOCK ----------------------------------------------------------------

  listMembers: (): Promise<MemberList> =>
    Promise.resolve({
      itens: cloneAll(memberRegistry),
      total: memberRegistry.length,
      pagina: 1,
      tamanho_pagina: memberRegistry.length,
      organization: 'Acme Inc.',
    }),

  removeMember: (id: string): Promise<void> => {
    memberRegistry = memberRegistry.filter((member) => member.id !== id);
    return Promise.resolve();
  },

  listMentees: (): Promise<Mentee[]> =>
    Promise.resolve(cloneAll(menteeRegistry)),

  removeMentee: (id: string): Promise<void> => {
    menteeRegistry = menteeRegistry.filter((mentee) => mentee.id !== id);
    return Promise.resolve();
  },
};
