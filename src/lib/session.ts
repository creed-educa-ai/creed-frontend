import type { SessionResponse } from '@/types/api';

const STORAGE_KEY = 'creed.session';

// "Lembrar de mim" é a escolha entre os dois: `localStorage` sobrevive a fechar
// o navegador, `sessionStorage` morre com a aba.
function armazenamentos(): Storage[] {
  return [localStorage, sessionStorage];
}

function armazenamentoAtual(): Storage {
  return sessionStorage.getItem(STORAGE_KEY) !== null
    ? sessionStorage
    : localStorage;
}

export function getSession(): SessionResponse | null {
  for (const armazenamento of armazenamentos()) {
    const raw = armazenamento.getItem(STORAGE_KEY);
    if (!raw) continue;

    try {
      return JSON.parse(raw) as SessionResponse;
    } catch {
      // Conteúdo corrompido: segue para o outro armazenamento.
    }
  }
  return null;
}

/**
 * Grava a sessão. Sem `lembrar`, mantém onde ela já está — é o caso da
 * renovação automática, que não pode promover uma sessão de aba a sessão
 * persistente pelas costas de quem deixou "lembrar de mim" desmarcado.
 */
export function setSession(session: SessionResponse, lembrar?: boolean): void {
  const alvo =
    lembrar === undefined
      ? armazenamentoAtual()
      : lembrar
        ? localStorage
        : sessionStorage;

  alvo.setItem(STORAGE_KEY, JSON.stringify(session));

  for (const outro of armazenamentos()) {
    if (outro !== alvo) outro.removeItem(STORAGE_KEY);
  }
}

export function clearSession(): void {
  for (const armazenamento of armazenamentos()) {
    armazenamento.removeItem(STORAGE_KEY);
  }
}
