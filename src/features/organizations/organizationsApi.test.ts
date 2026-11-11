import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { organizationsApi } from '@/features/organizations/organizationsApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const ORGANIZATION_ID = '5a1e9c3b-2f7d-4b8a-9e6c-0d4f1b2a3c5e';
const DOCUMENT_ID = '3b2f8c1a-6d4e-4f7a-9c5b-1e0d2a8f6b94';

describe('organizationsApi — rotas do back', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listOrganizations pede a primeira página por padrão', async () => {
    const fetchMock = stubFetch();

    await organizationsApi.listOrganizations();

    expect(lastCall(fetchMock).url).toBe(
      '/api/v1/organizacoes?pagina=1&tamanho_pagina=50',
    );
  });

  it('listOrganizations repassa página e tamanho', async () => {
    const fetchMock = stubFetch();

    await organizationsApi.listOrganizations({ pagina: 2, tamanho_pagina: 10 });

    expect(lastCall(fetchMock).url).toBe(
      '/api/v1/organizacoes?pagina=2&tamanho_pagina=10',
    );
  });

  it('getOrganization lê pelo id', async () => {
    const fetchMock = stubFetch();

    await organizationsApi.getOrganization(ORGANIZATION_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizacoes/${ORGANIZATION_ID}`,
      method: 'GET',
      body: undefined,
    });
  });

  it('createOrganization manda nome, endereço e documento', async () => {
    const fetchMock = stubFetch(201);
    const organization = {
      name: 'Organização Exemplo',
      address: 'Av. Ipiranga, 6681',
      document_id: DOCUMENT_ID,
    };

    await organizationsApi.createOrganization(organization);

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/organizacoes',
      method: 'POST',
      body: organization,
    });
  });

  it('updateOrganization manda só os campos alterados', async () => {
    const fetchMock = stubFetch();

    await organizationsApi.updateOrganization(ORGANIZATION_ID, {
      status: 'inactive',
    });

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizacoes/${ORGANIZATION_ID}`,
      method: 'PATCH',
      body: { status: 'inactive' },
    });
  });

  it('signUp manda o cadastro para a rota pública em inglês', async () => {
    const fetchMock = stubFetch(201);
    const cadastro = {
      name: 'Empresa Teste',
      document: '12.345.678/0001-90',
      email: 'gestora@empresa.com.br',
      contact_name: 'Gestora Teste',
      phone: '51 99999-0000',
    };

    await organizationsApi.signUp(cadastro);

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/organizations/sign-up',
      method: 'POST',
      body: cadastro,
    });
  });

  it('approveOrganization chama a aprovação em inglês, sem corpo', async () => {
    const fetchMock = stubFetch();

    await organizationsApi.approveOrganization(ORGANIZATION_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}/approval`,
      method: 'POST',
      body: undefined,
    });
  });

  it('deleteOrganization chama a exclusão em inglês, não em /organizacoes', async () => {
    const fetchMock = stubFetch(204);

    await organizationsApi.deleteOrganization(ORGANIZATION_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}`,
      method: 'DELETE',
      body: undefined,
    });
  });
});
