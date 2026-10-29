import { describe, expect, it } from 'vitest';
import reducer, {
  loadMembers,
  deleteMember,
} from '@/features/organizations/organizationsSlice';
import type { MemberList, Member } from '@/types/api';

const estadoInicial = {
  members: [],
  total: 0,
  organization: '',
  status: 'idle' as const,
  error: null,
};

const membro: Member = {
  id: '1',
  name: 'Enner Valência',
  email: 'michael.mitc@example.com',
  status: 'ativo',
  tag: 'marketing',
  updated_at: '2026-10-18T14:12:00.000Z',
};

describe('organizationsSlice', () => {
  it('marca carregando ao iniciar a busca', () => {
    const estado = reducer(estadoInicial, loadMembers.pending(''));
    expect(estado.status).toBe('loading');
  });

  it('guarda os itens quando a busca conclui', () => {
    const payload: MemberList = {
      itens: [membro],
      total: 1,
      pagina: 1,
      tamanho_pagina: 5,
      organization: 'Acme Inc.',
    };
    const estado = reducer(estadoInicial, loadMembers.fulfilled(payload, ''));
    expect(estado.status).toBe('ready');
    expect(estado.total).toBe(1);
    expect(estado.organization).toBe('Acme Inc.');
  });

  it('remove o membro após exclusão', () => {
    const cheio = {
      ...estadoInicial,
      status: 'ready' as const,
      members: [membro],
      total: 1,
      organization: 'Acme Inc.',
    };
    const estado = reducer(cheio, deleteMember.fulfilled('1', '', '1'));
    expect(estado.members).toHaveLength(0);
    expect(estado.total).toBe(0);
  });

  it('registra uma chave traduzível em caso de falha de carregamento', () => {
    const estado = reducer(
      estadoInicial,
      loadMembers.rejected(new Error('Falha técnica'), ''),
    );
    expect(estado.status).toBe('error');
    expect(estado.error).toBe('organizations:members.loadError');
  });

  it('mantém a lista quando a exclusão falha', () => {
    const cheio = {
      ...estadoInicial,
      status: 'ready' as const,
      members: [membro],
      total: 1,
      organization: 'Acme Inc.',
    };
    const estado = reducer(
      cheio,
      deleteMember.rejected(new Error('Falha técnica'), '', '1'),
    );
    expect(estado).toEqual(cheio);
  });
});
