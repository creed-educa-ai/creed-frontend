import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demographicsApi } from '@/features/demographics/demographicsApi';

// Troca só o `fetch`: a chamada passa pelo apiClient de verdade, então o teste
// confere o endereço, o método e o corpo que de fato saem para o back.
function stubFetch(status = 200) {
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

describe('demographicsApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getMyDemographics busca o perfil da pessoa logada', async () => {
    const fetchMock = stubFetch();

    await demographicsApi.getMyDemographics();

    const call = lastCall(fetchMock);
    expect(call.url).toMatch(/\/demographics\/me$/);
    expect(call.method).toBe('GET');
  });

  it('saveMyDemographics manda o perfil inteiro com PUT', async () => {
    const fetchMock = stubFetch();

    await demographicsApi.saveMyDemographics({
      gender: 'feminino',
      ethnicities: ['europeia'],
      perspective: null,
    });

    const call = lastCall(fetchMock);
    expect(call.url).toMatch(/\/demographics\/me$/);
    expect(call.method).toBe('PUT');
    expect(JSON.parse(call.body as string)).toEqual({
      gender: 'feminino',
      ethnicities: ['europeia'],
      perspective: null,
    });
  });
});
