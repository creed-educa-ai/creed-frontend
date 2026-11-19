import { vi } from 'vitest';

// Troca só o `fetch`: a chamada passa pelo apiClient de verdade, então o teste
// confere o endereço, o método e o corpo que de fato saem para o back.
export function stubFetch(status = 200, body: unknown = {}) {
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function lastCall(fetchMock: ReturnType<typeof stubFetch>) {
  const [url, init] = fetchMock.mock.lastCall as unknown as [
    string,
    RequestInit | undefined,
  ];
  const body = init?.body;
  return {
    url,
    method: init?.method ?? 'GET',
    body: typeof body === 'string' ? (JSON.parse(body) as unknown) : body,
  };
}
