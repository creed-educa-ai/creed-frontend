import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { organizationsApi } from '@/features/organizations/organizationsApi';

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

describe('organizationsApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('inviteMember manda o convite para a rota de membros da organização', async () => {
    const fetchMock = stubFetch();

    await organizationsApi.inviteMember(ORGANIZATION_ID, {
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

    await organizationsApi.inviteMember(ORGANIZATION_ID, {
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
      organizationsApi.inviteMember(ORGANIZATION_ID, {
        name: 'Pessoa Teste',
        email: 'pessoa@empresa.com.br',
        role: 'gestor',
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409 });
  });
});
