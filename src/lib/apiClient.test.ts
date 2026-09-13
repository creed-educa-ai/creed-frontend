import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from '@/lib/apiClient';
import { getSession, setSession } from '@/lib/session';
import type { SessionResponse } from '@/types/api';

const fakeUser = {
  id: 'usr_1',
  email: 'ana@creed.ai',
  role: 'admin',
  vinculo_id: null,
  organization_id: null,
  organization_name: null,
};

const oldSession: SessionResponse = {
  access_token: 'access-old',
  refresh_token: 'refresh-valid',
  expires_in: 300,
  user: fakeUser,
};

const refreshedSession: SessionResponse = {
  ...oldSession,
  access_token: 'access-new',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function headersOf(init?: RequestInit): Headers {
  return new Headers(init?.headers);
}

describe('apiClient', () => {
  const originalLocation = window.location;
  let assignMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    assignMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: originalLocation.pathname, assign: assignMock },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('injects Authorization: Bearer when there is a saved session', async () => {
    setSession(oldSession);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.get('/whatever');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(headersOf(init).get('Authorization')).toBe('Bearer access-old');
  });

  it('does not inject Authorization without a session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.get('/whatever');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(headersOf(init).has('Authorization')).toBe(false);
  });

  it('five simultaneous 401s trigger a single refresh, and each original call is retried', async () => {
    setSession(oldSession);
    let refreshCalls = 0;

    const fetchMock = vi.fn(
      (url: string, init?: RequestInit): Promise<Response> => {
        if (url.endsWith('/auth/renew')) {
          refreshCalls += 1;
          return Promise.resolve(jsonResponse(refreshedSession));
        }

        const authenticated =
          headersOf(init).get('Authorization') ===
          `Bearer ${refreshedSession.access_token}`;
        return Promise.resolve(
          authenticated
            ? jsonResponse({ ok: true })
            : jsonResponse('expired', 401),
        );
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    const results = await Promise.all([
      apiClient.get('/a'),
      apiClient.get('/b'),
      apiClient.get('/c'),
      apiClient.get('/d'),
      apiClient.get('/e'),
    ]);

    expect(refreshCalls).toBe(1);
    for (const result of results) {
      expect(result).toEqual({ ok: true });
    }
    expect(getSession()?.access_token).toBe(refreshedSession.access_token);
  });

  it('when the refresh fails, clears the session and sends to /login', async () => {
    setSession(oldSession);
    const fetchMock = vi.fn((url: string): Promise<Response> =>
      Promise.resolve(
        url.endsWith('/auth/renew')
          ? jsonResponse('session expired', 401)
          : jsonResponse('token expired', 401),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/whatever')).rejects.toThrow(ApiError);

    expect(getSession()).toBeNull();
    expect(assignMock).toHaveBeenCalledWith('/login');
  });

  it('without a session, a 401 also clears and sends to /login (session deleted via DevTools)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse('not authenticated', 401));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/protected')).rejects.toThrow(ApiError);

    expect(assignMock).toHaveBeenCalledWith('/login');
  });

  it('a 403 does not clear the session nor redirect', async () => {
    setSession(oldSession);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse('forbidden', 403));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/restricted')).rejects.toThrow(ApiError);

    expect(getSession()).not.toBeNull();
    expect(assignMock).not.toHaveBeenCalled();
  });

  it('a 401 on /auth/login does not redirect — it is an invalid credential, not an expired session', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse('Invalid email or password', 401));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiClient.post('/auth/login', { email: 'a@a.com', password: 'x' }),
    ).rejects.toThrow(ApiError);

    expect(assignMock).not.toHaveBeenCalled();
  });
});
