import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from '@/lib/apiClient';
import { clearSession, getSession, setSession } from '@/lib/session';
import { deferred } from '@/test/deferred';
import type { SessionResponse } from '@/types/api';

const fakeUser = {
  id: 'usr_1',
  email: 'ana@creed.ai',
  role: 'admin',
  link_id: null,
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
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
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
        if (url.endsWith('/authentication/renew')) {
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

  it('clears the session when the refresh fails', async () => {
    setSession(oldSession);
    const fetchMock = vi.fn((url: string): Promise<Response> =>
      Promise.resolve(
        url.endsWith('/authentication/renew')
          ? jsonResponse('session expired', 401)
          : jsonResponse('token expired', 401),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/whatever')).rejects.toThrow(ApiError);

    expect(getSession()).toBeNull();
  });

  it('preserves a missing profile response after refreshing the session', async () => {
    setSession(oldSession);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse('token expired', 401))
      .mockResolvedValueOnce(jsonResponse(refreshedSession))
      .mockResolvedValueOnce(jsonResponse('profile not found', 404));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/demographics/me')).rejects.toMatchObject({
      status: 404,
    });
    expect(getSession()).toEqual(refreshedSession);
  });

  it('does not retry a PUT when an old session returns 401 after a new login', async () => {
    setSession(oldSession);
    const previous = deferred<Response>();
    const fetchMock = vi.fn().mockReturnValueOnce(previous.promise);
    vi.stubGlobal('fetch', fetchMock);

    const save = apiClient.put('/demographics/me', { perspective: 'Texto' });
    clearSession();
    const newLogin = { ...oldSession, access_token: 'access-new-login' };
    setSession(newLogin);
    previous.resolve(jsonResponse('token expired', 401));

    await expect(save).rejects.toThrow(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getSession()).toEqual(newLogin);
  });

  it('does not overwrite a new login when a previous refresh resolves', async () => {
    setSession(oldSession);
    const refreshStarted = deferred<true>();
    const refresh = deferred<Response>();
    const fetchMock = vi.fn((url: string): Promise<Response> => {
      if (url.endsWith('/authentication/renew')) {
        refreshStarted.resolve(true);
        return refresh.promise;
      }
      return Promise.resolve(jsonResponse('token expired', 401));
    });
    vi.stubGlobal('fetch', fetchMock);

    const save = apiClient.put('/demographics/me', { perspective: 'Texto' });
    await refreshStarted.promise;
    clearSession();
    const newLogin = { ...oldSession, access_token: 'access-new-login' };
    setSession(newLogin);
    refresh.resolve(jsonResponse(refreshedSession));

    await expect(save).rejects.toThrow(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getSession()).toEqual(newLogin);
  });

  it('without a session, a 401 just throws (nothing to refresh)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse('not authenticated', 401));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/protected')).rejects.toThrow(ApiError);

    expect(getSession()).toBeNull();
  });

  it('a 403 does not clear the session', async () => {
    setSession(oldSession);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse('forbidden', 403));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('/restricted')).rejects.toThrow(ApiError);

    expect(getSession()).not.toBeNull();
  });

  it('a 401 on /authentication/login surfaces the backend message, not a generic session-expired one', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse('Invalid email or password', 401));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiClient.post('/authentication/login', {
        email: 'a@a.com',
        password: 'x',
      }),
    ).rejects.toThrow('Invalid email or password');
  });
});
