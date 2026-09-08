// Cliente HTTP compartilhado. Centraliza base URL e tratamento de erro
// para as features não reimplementarem fetch cada uma à sua maneira.

// Relativa por padrão: o proxy do Vite encaminha `/api/v1` ao backend local.
// `VITE_API_BASE_URL` no `.env.local` troca por uma base absoluta — é assim que o
// front consome o mock do contrato enquanto o backend não existe, sem tocar em
// código. Apagar a variável devolve o comportamento padrão.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Montado pela API nativa: init.headers pode chegar como Headers, como array
  // de pares ou como objeto — espalhar às cegas descartaria as duas primeiras
  // formas. `headers` vai depois de ...init para não ser sobrescrito por ele.
  const headers = new Headers({ 'Content-Type': 'application/json' });
  new Headers(init?.headers).forEach((valor, chave) => {
    headers.set(chave, valor);
  });

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const detail = await response.text();
    throw new ApiError(detail || response.statusText, response.status);
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
