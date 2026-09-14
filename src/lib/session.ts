import type { SessionResponse } from '@/types/api';

const STORAGE_KEY = 'creed.session';

export function getSession(): SessionResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionResponse;
  } catch {
    return null;
  }
}

export function setSession(session: SessionResponse): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
