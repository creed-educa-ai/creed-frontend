import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import reducer, {
  approveOrganization,
  deleteOrganization,
  loadOrganizations,
  NAO_APROVADA,
} from '@/features/organizations/organizationsSlice';
import { lastCall, stubFetch } from '@/test/stubFetch';
import type { ListaPaginada, OrganizationResponse } from '@/types/api';

function organizacao(
  id: string,
  mudancas: Partial<OrganizationResponse> = {},
): OrganizationResponse {
  return {
    id,
    name: `Empresa ${id}`,
    address: '[A informar]',
    document_id: `doc-${id}`,
    status: 'pending',
    email: `contato@empresa-${id}.com`,
    contact_name: 'Ana Silva',
    phone: '51 99999-0000',
    document: { type: 'cnpj', value: '12345678000190' },
    created_at: '2026-11-10T12:00:00Z',
    updated_at: null,
    ...mudancas,
  };
}

function pagina(
  itens: OrganizationResponse[],
  total: number,
  numero = 1,
): ListaPaginada<OrganizationResponse> {
  return { itens, total, pagina: numero, tamanho_pagina: 200 };
}

// Uma resposta por chamada: o stubFetch devolve sempre o mesmo corpo.
function responder(status: number, body?: unknown) {
  return Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function criarStore() {
  return configureStore({ reducer: { organizations: reducer } });
}

describe('organizationsSlice — tabela da administradora', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('pede as páginas até juntar o total', async () => {
    const primeira = Array.from({ length: 200 }, (_, i) =>
      organizacao(`a${String(i)}`),
    );
    const segunda = Array.from({ length: 50 }, (_, i) =>
      organizacao(`b${String(i)}`),
    );
    const fetchMock = stubFetch();
    fetchMock
      .mockImplementationOnce(() => responder(200, pagina(primeira, 250, 1)))
      .mockImplementationOnce(() => responder(200, pagina(segunda, 250, 2)));
    const store = criarStore();

    await store.dispatch(loadOrganizations());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/v1/organizacoes?pagina=1&tamanho_pagina=200',
      expect.anything(),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/organizacoes?pagina=2&tamanho_pagina=200',
      expect.anything(),
    );
    expect(store.getState().organizations.status).toBe('ready');
    expect(store.getState().organizations.organizations).toHaveLength(250);
  });

  it('para numa página vazia, mesmo sem chegar ao total', async () => {
    // Uma exclusão entre as duas chamadas: o total da primeira ficou velho.
    const fetchMock = stubFetch();
    fetchMock
      .mockImplementationOnce(() =>
        responder(200, pagina([organizacao('1')], 2, 1)),
      )
      .mockImplementationOnce(() => responder(200, pagina([], 1, 2)));
    const store = criarStore();

    await store.dispatch(loadOrganizations());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getState().organizations.organizations).toHaveLength(1);
  });

  it('guarda a chave de erro quando a lista não carrega', async () => {
    stubFetch(503, { detail: 'fora do ar' });
    const store = criarStore();

    await store.dispatch(loadOrganizations());

    expect(store.getState().organizations.status).toBe('error');
    expect(store.getState().organizations.error).toBe(
      'empresas:erroAoCarregar',
    );
  });

  it('aprovar troca a pendente pela organização que o back devolveu', async () => {
    const fetchMock = stubFetch();
    fetchMock.mockImplementationOnce(() =>
      responder(200, pagina([organizacao('1'), organizacao('2')], 2)),
    );
    const store = criarStore();
    await store.dispatch(loadOrganizations());
    fetchMock.mockImplementationOnce(() =>
      responder(200, organizacao('1', { status: 'active' })),
    );

    await store.dispatch(approveOrganization('1'));

    expect(lastCall(fetchMock)).toMatchObject({
      url: '/api/v1/organizations/1/approval',
      method: 'POST',
    });
    expect(
      store
        .getState()
        .organizations.organizations.map(({ id, status }) => ({ id, status })),
    ).toEqual([
      { id: '1', status: 'active' },
      { id: '2', status: 'pending' },
    ]);
  });

  it.each([
    { status: 409, chave: NAO_APROVADA },
    { status: 503, chave: 'comum:tenteNovamenteEmInstantes' },
  ])(
    'aprovar com $status devolve a chave $chave e não mexe na lista',
    async ({ status, chave }) => {
      const fetchMock = stubFetch();
      fetchMock.mockImplementationOnce(() =>
        responder(200, pagina([organizacao('1')], 1)),
      );
      const store = criarStore();
      await store.dispatch(loadOrganizations());
      fetchMock.mockImplementationOnce(() =>
        responder(status, { detail: 'recusado' }),
      );

      const acao = await store.dispatch(approveOrganization('1'));

      expect(acao.payload).toBe(chave);
      expect(store.getState().organizations.organizations[0]?.status).toBe(
        'pending',
      );
    },
  );

  it('excluir tira a organização da lista', async () => {
    const fetchMock = stubFetch();
    fetchMock.mockImplementationOnce(() =>
      responder(200, pagina([organizacao('1'), organizacao('2')], 2)),
    );
    const store = criarStore();
    await store.dispatch(loadOrganizations());
    fetchMock.mockImplementationOnce(() => responder(204));

    await store.dispatch(deleteOrganization('1'));

    expect(lastCall(fetchMock)).toMatchObject({
      url: '/api/v1/organizations/1',
      method: 'DELETE',
    });
    expect(
      store.getState().organizations.organizations.map(({ id }) => id),
    ).toEqual(['2']);
  });

  it('excluir com 503 mantém a organização na lista', async () => {
    const fetchMock = stubFetch();
    fetchMock.mockImplementationOnce(() =>
      responder(200, pagina([organizacao('1')], 1)),
    );
    const store = criarStore();
    await store.dispatch(loadOrganizations());
    fetchMock.mockImplementationOnce(() =>
      responder(503, { detail: 'keycloak fora' }),
    );

    const acao = await store.dispatch(deleteOrganization('1'));

    expect(acao.type).toBe(deleteOrganization.rejected.type);
    expect(
      store.getState().organizations.organizations.map(({ id }) => id),
    ).toEqual(['1']);
  });
});
