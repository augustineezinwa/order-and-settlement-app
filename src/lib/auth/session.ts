import type { AuthSession } from "@shared/api/types/auth";

import { notifySessionChange } from "@/lib/auth/session-events";

const STORAGE_KEY = "oas_session";

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  notifySessionChange();
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifySessionChange();
}
