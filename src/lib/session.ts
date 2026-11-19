import type { SessionResponse } from '@/types/api';

const STORAGE_KEY = 'creed.session';
let sessionVersion = 0;

export function getSessionVersion(): number {
  return sessionVersion;
}

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

function writeSession(session: SessionResponse, lembrar?: boolean): void {
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

export function setSession(session: SessionResponse, lembrar?: boolean): void {
  sessionVersion += 1;
  writeSession(session, lembrar);
}

// Renovar os tokens mantém a sessão e a escolha de armazenamento do login.
export function renewSession(session: SessionResponse): void {
  writeSession(session);
}

// Muda só o usuário da sessão guardada (ex.: depois do aceite do termo), para
// que ele não volte desatualizado ao recarregar a página. Tokens e escolha de
// armazenamento ficam como estão.
export function updateSessionUser(user: SessionResponse['user']): void {
  const session = getSession();
  if (session) writeSession({ ...session, user });
}

export function clearSession(): void {
  sessionVersion += 1;
  for (const armazenamento of armazenamentos()) {
    armazenamento.removeItem(STORAGE_KEY);
  }
}
