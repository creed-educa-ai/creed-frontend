// Chamadas ao backend para a feature organizations.
// Enquanto o contrato REST da lista não estabiliza, ela vive em memória — o
// restante da feature já fala só com esta API (ADR-003, secao 2). O convite
// de membro já é chamada de verdade.
import { apiClient } from '@/lib/apiClient';
import type {
  Member,
  MemberInvite,
  MemberList,
  UserResponse,
} from '@/types/api';

const seed: Member[] = [
  {
    id: '1',
    name: 'Enner Valência',
    email: 'michael.mitc@example.com',
    status: 'ativo',
    tag: 'marketing',
    updated_at: '2026-10-18T14:12:00.000Z',
  },
  {
    id: '2',
    name: 'Wilson Mathias',
    email: 'felicia.reid@example.com',
    status: 'ativo',
    tag: 'vendas',
    updated_at: '2026-10-17T09:40:00.000Z',
  },
  {
    id: '3',
    name: 'Volante Ronaldo',
    email: 'georgia.young@example.com',
    status: 'pendente',
    tag: 'rh',
    updated_at: '2026-10-16T18:05:00.000Z',
  },
  {
    id: '4',
    name: 'Maurides Cambalhota',
    email: 'alma.lawson@example.com',
    status: 'ativo',
    tag: 'vendas',
    updated_at: '2026-10-15T11:22:00.000Z',
  },
  {
    id: '5',
    name: 'Clayton Sampaio',
    email: 'dolores.chambers@example.com',
    status: 'pendente',
    tag: 'vendas',
    updated_at: '2026-10-14T08:01:00.000Z',
  },
  {
    id: '6',
    name: 'Ana Souza',
    email: 'ana.souza@example.com',
    status: 'ativo',
    tag: 'marketing',
    updated_at: '2026-10-13T16:47:00.000Z',
  },
  {
    id: '7',
    name: 'Bruno Lima',
    email: 'bruno.lima@example.com',
    status: 'pendente',
    tag: 'rh',
    updated_at: '2026-10-12T10:18:00.000Z',
  },
  {
    id: '8',
    name: 'Carla Dias',
    email: 'carla.dias@example.com',
    status: 'ativo',
    tag: 'vendas',
    updated_at: '2026-10-11T13:33:00.000Z',
  },
];

let registry: Member[] = cloneMembers(seed);

function cloneMembers(members: Member[]): Member[] {
  return members.map((member) => ({ ...member }));
}

export function resetMembersMock() {
  registry = cloneMembers(seed);
}

export const organizationsApi = {
  listMembers: (): Promise<MemberList> =>
    Promise.resolve({
      itens: cloneMembers(registry),
      total: registry.length,
      pagina: 1,
      tamanho_pagina: registry.length,
      organization: 'Acme Inc.',
    }),

  removeMember: (id: string): Promise<void> => {
    registry = registry.filter((member) => member.id !== id);
    return Promise.resolve();
  },

  // Uma chamada cria participante, vínculo e acesso, e manda o convite por
  // e-mail. Quem liga esta função à tela é o painel da empresa (CREED-50).
  inviteMember: (organizationId: string, invite: MemberInvite) =>
    apiClient.post<UserResponse>(
      `/organizations/${organizationId}/members`,
      invite,
    ),
};
