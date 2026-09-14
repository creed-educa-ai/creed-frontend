// Cliente HTTP compartilhado. Centraliza base URL, injeção do token de
// sessão e renovação automática, as features não reimplementam fetch nem
// sabem como a sessão funciona.

// Relativa por padrão: o proxy do Vite encaminha `/api/v1` ao backend local.
// `VITE_API_BASE_URL` no `.env.local` troca por uma base absoluta — é assim que o
// front consome o mock do contrato enquanto o backend não existe, sem tocar em
// código. Apagar a variável devolve o comportamento padrão.
import { clearSession, getSession, setSession } from '@/lib/session';
import type { SessionResponse } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const ROUTES_WITHOUT_INTERCEPTOR = new Set(['/auth/login']);

// O backend responde erro como `{"detail": "..."}` (FastAPI). Sem desembrulhar,
// a mensagem que chega na tela é o JSON inteiro, com chaves e aspas.
async function mensagemDeErro(response: Response): Promise<string> {
  const texto = await response.text();
  if (!texto) return response.statusText;

  try {
    const corpo: unknown = JSON.parse(texto);
    if (corpo && typeof corpo === 'object' && 'detail' in corpo) {
      const { detail } = corpo;
      // 422 do FastAPI traz `detail` como lista de erros de campo; aí o texto
      // cru é mais útil do que "[object Object]".
      if (typeof detail === 'string') return detail;
    }
  } catch {
    // Não era JSON: o texto cru já é a melhor mensagem que existe.
  }

  return texto;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshInFlight: Promise<SessionResponse> | null = null;

async function refreshSession(): Promise<SessionResponse> {
  const currentSession = getSession();
  if (!currentSession) {
    throw new ApiError('Não há sessão para renovar', 401);
  }

  const response = await fetch(`${BASE_URL}/auth/renew`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: currentSession.refresh_token }),
  });

  if (!response.ok) {
    throw new ApiError(await mensagemDeErro(response), response.status);
  }

  const newSession = (await response.json()) as SessionResponse;
  setSession(newSession);
  return newSession;
}

function getOrStartRefresh(): Promise<SessionResponse> {
  refreshInFlight ??= refreshSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  alreadyRetried = false,
): Promise<T> {
  const session = getSession();

  // Montado pela API nativa: init.headers pode chegar como Headers, como array
  // de pares ou como objeto — espalhar às cegas descartaria as duas primeiras
  // formas. `headers` vai depois de ...init para não ser sobrescrito por ele.
  const headers = new Headers({ 'Content-Type': 'application/json' });
  new Headers(init?.headers).forEach((value, key) => {
    headers.set(key, value);
  });
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && !ROUTES_WITHOUT_INTERCEPTOR.has(path)) {
    if (session && !alreadyRetried) {
      try {
        await getOrStartRefresh();
        return await request<T>(path, init, true);
      } catch {
        // catch silencioso
      }
    }

    // Só limpa o storage aqui. Redirecionar para o "/login" é com a UI
    clearSession();
    throw new ApiError('Sessão expirada, por favor faça login novamente', 401);
  }

  if (!response.ok) {
    throw new ApiError(await mensagemDeErro(response), response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  // Sem genérico: o backend responde 204 sem corpo (`request` devolve undefined).
  delete: (path: string) => request<undefined>(path, { method: 'DELETE' }),
};
