// Chamadas ao backend para a feature membros.
// Enquanto o contrato REST não estabiliza, a lista vive em memória — o
// restante da feature já fala só com esta API (ADR-003, secao 2).
import type { ListaMembros, Membro } from '@/types/api';

const semente: Membro[] = [
  {
    id: '1',
    nome: 'Enner Valência',
    email: 'michael.mitc@example.com',
    status: 'ativo',
    tag: 'marketing',
    atualizado_em: '2026-10-18T14:12:00.000Z',
  },
  {
    id: '2',
    nome: 'Wilson Mathias',
    email: 'felicia.reid@example.com',
    status: 'ativo',
    tag: 'vendas',
    atualizado_em: '2026-10-17T09:40:00.000Z',
  },
  {
    id: '3',
    nome: 'Volante Ronaldo',
    email: 'georgia.young@example.com',
    status: 'pendente',
    tag: 'rh',
    atualizado_em: '2026-10-16T18:05:00.000Z',
  },
  {
    id: '4',
    nome: 'Maurides Cambalhota',
    email: 'alma.lawson@example.com',
    status: 'ativo',
    tag: 'vendas',
    atualizado_em: '2026-10-15T11:22:00.000Z',
  },
  {
    id: '5',
    nome: 'Clayton Sampaio',
    email: 'dolores.chambers@example.com',
    status: 'pendente',
    tag: 'vendas',
    atualizado_em: '2026-10-14T08:01:00.000Z',
  },
  {
    id: '6',
    nome: 'Ana Souza',
    email: 'ana.souza@example.com',
    status: 'ativo',
    tag: 'marketing',
    atualizado_em: '2026-10-13T16:47:00.000Z',
  },
  {
    id: '7',
    nome: 'Bruno Lima',
    email: 'bruno.lima@example.com',
    status: 'pendente',
    tag: 'rh',
    atualizado_em: '2026-10-12T10:18:00.000Z',
  },
  {
    id: '8',
    nome: 'Carla Dias',
    email: 'carla.dias@example.com',
    status: 'ativo',
    tag: 'vendas',
    atualizado_em: '2026-10-11T13:33:00.000Z',
  },
];

let registro: Membro[] = clonar(semente);

function clonar(itens: Membro[]): Membro[] {
  return itens.map((membro) => ({ ...membro }));
}

export function redefinirMembrosMock() {
  registro = clonar(semente);
}

export const membrosApi = {
  listar: (): Promise<ListaMembros> =>
    Promise.resolve({
      itens: clonar(registro),
      total: registro.length,
      pagina: 1,
      tamanho_pagina: registro.length,
      empresa: 'Acme Inc.',
    }),

  remover: (id: string): Promise<void> => {
    registro = registro.filter((membro) => membro.id !== id);
    return Promise.resolve();
  },
};
