import { describe, expect, it } from 'vitest';
import reducer, {
  carregarMembros,
  excluirMembro,
} from '@/features/membros/membrosSlice';
import type { ListaMembros, Membro } from '@/types/api';

const estadoInicial = {
  itens: [],
  total: 0,
  empresa: '',
  status: 'idle' as const,
  erro: null,
};

const membro: Membro = {
  id: '1',
  nome: 'Enner Valência',
  email: 'michael.mitc@example.com',
  status: 'ativo',
  tag: 'marketing',
  atualizado_em: '2026-10-18T14:12:00.000Z',
};

describe('membrosSlice', () => {
  it('marca carregando ao iniciar a busca', () => {
    const estado = reducer(estadoInicial, carregarMembros.pending(''));
    expect(estado.status).toBe('carregando');
  });

  it('guarda os itens quando a busca conclui', () => {
    const payload: ListaMembros = {
      itens: [membro],
      total: 1,
      pagina: 1,
      tamanho_pagina: 5,
      empresa: 'Acme Inc.',
    };
    const estado = reducer(
      estadoInicial,
      carregarMembros.fulfilled(payload, ''),
    );
    expect(estado.status).toBe('pronto');
    expect(estado.total).toBe(1);
    expect(estado.empresa).toBe('Acme Inc.');
  });

  it('remove o membro após exclusão', () => {
    const cheio = {
      ...estadoInicial,
      status: 'pronto' as const,
      itens: [membro],
      total: 1,
      empresa: 'Acme Inc.',
    };
    const estado = reducer(cheio, excluirMembro.fulfilled('1', '', '1'));
    expect(estado.itens).toHaveLength(0);
    expect(estado.total).toBe(0);
  });

  it('registra uma chave traduzível em caso de falha de carregamento', () => {
    const estado = reducer(
      estadoInicial,
      carregarMembros.rejected(new Error('Falha técnica'), ''),
    );
    expect(estado.status).toBe('erro');
    expect(estado.erro).toBe('erroCarregamento');
  });

  it('mantém a lista quando a exclusão falha', () => {
    const cheio = {
      ...estadoInicial,
      status: 'pronto' as const,
      itens: [membro],
      total: 1,
      empresa: 'Acme Inc.',
    };
    const estado = reducer(
      cheio,
      excluirMembro.rejected(new Error('Falha técnica'), '', '1'),
    );
    expect(estado).toEqual(cheio);
  });
});
