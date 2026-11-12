import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usersApi } from '@/features/users/usersApi';

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

// Troca só o `fetch`: a chamada passa pelo apiClient de verdade, então o teste
// confere o endereço, o método e o corpo que de fato saem para o back.
function stubFetch(status = 201) {
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({}), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function lastCall(fetchMock: ReturnType<typeof stubFetch>) {
  const [url, init] = fetchMock.mock.lastCall as unknown as [
    string,
    RequestInit | undefined,
  ];
  return { url, method: init?.method ?? 'GET', body: init?.body };
}

describe('usersApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('inviteMember manda o convite para a rota de membros da organização', async () => {
    const fetchMock = stubFetch();

    await usersApi.inviteMember(ORGANIZATION_ID, {
      name: 'Pessoa Teste',
      email: 'pessoa@empresa.com.br',
      role: 'gestor',
    });

    const call = lastCall(fetchMock);
    expect(call.url).toBe(`/api/v1/organizations/${ORGANIZATION_ID}/members`);
    expect(call.method).toBe('POST');
    // Sem `type`: o back grava `emprego` (P-047).
    expect(JSON.parse(call.body as string)).toEqual({
      name: 'Pessoa Teste',
      email: 'pessoa@empresa.com.br',
      role: 'gestor',
    });
  });

  it('inviteMember repassa o tipo do vínculo quando quem convida informa', async () => {
    const fetchMock = stubFetch();

    await usersApi.inviteMember(ORGANIZATION_ID, {
      name: 'Pessoa Teste',
      email: 'pessoa@empresa.com.br',
      role: 'respondente',
      type: 'mentoria',
    });

    expect(JSON.parse(lastCall(fetchMock).body as string)).toEqual({
      name: 'Pessoa Teste',
      email: 'pessoa@empresa.com.br',
      role: 'respondente',
      type: 'mentoria',
    });
  });

  it('inviteMember deixa o 409 chegar a quem chamou, com o status', async () => {
    stubFetch(409);

    await expect(
      usersApi.inviteMember(ORGANIZATION_ID, {
        name: 'Pessoa Teste',
        email: 'pessoa@empresa.com.br',
        role: 'gestor',
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409 });
  });

  it('createUser manda o acesso com o vínculo, sem papel', async () => {
    const fetchMock = stubFetch();
    const user = {
      name: 'Pessoa Exemplo',
      email: 'pessoa@exemplo.com',
      keycloak_id: 'e5c0e7fa-3e57-427a-8d7b-a4ab5fb6c339',
      link_id: '3f9a2b1c-4d5e-4f6a-8b7c-9d0e1f2a3b4c',
    };

    await usersApi.createUser(user);

    const call = lastCall(fetchMock);
    expect(call.url).toBe('/api/v1/users');
    expect(call.method).toBe('POST');
    expect(JSON.parse(call.body as string)).toEqual(user);
  });

  it('deleteUser remove pelo id e aceita 204 sem corpo', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(usersApi.deleteUser('usuario-1')).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.lastCall as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('/api/v1/users/usuario-1');
    expect(init.method).toBe('DELETE');
  });

  it('resendInvitation pede o reenvio para a rota do usuário', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    vi.stubGlobal('fetch', fetchMock);

    await usersApi.resendInvitation('usuario-1');

    const [url, init] = fetchMock.mock.lastCall as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('/api/v1/users/usuario-1/invitation');
    expect(init.method).toBe('POST');
  });

  it('listMembers busca os membros da organização na rota correta', async () => {
    const fetchMock = stubFetch(200);

    await usersApi.listMembers(ORGANIZATION_ID);

    const call = lastCall(fetchMock);
    expect(call.url).toBe(`/api/v1/organizations/${ORGANIZATION_ID}/members`);
    expect(call.method).toBe('GET');
  });

  it('removeMember envia o delete para a rota correta com o linkId', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    vi.stubGlobal('fetch', fetchMock);

    const linkId = 'link-123';
    await expect(
      usersApi.removeMember(ORGANIZATION_ID, linkId),
    ).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.lastCall as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      `/api/v1/organizations/${ORGANIZATION_ID}/members/${linkId}`,
    );
    expect(init.method).toBe('DELETE');
  });

  it('setMemberTag envia o patch para atualizar a tag do membro', async () => {
    const fetchMock = stubFetch(200);
    const linkId = 'link-123';

    await usersApi.setMemberTag(ORGANIZATION_ID, linkId, 'Marketing');

    const call = lastCall(fetchMock);
    expect(call.url).toBe(
      `/api/v1/organizations/${ORGANIZATION_ID}/members/${linkId}`,
    );
    expect(call.method).toBe('PATCH');
    expect(JSON.parse(call.body as string)).toEqual({
      department_id: 'Marketing',
    });
  });
});
