import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";

import { env } from "../settings/env.js";

export const SESSION_COOKIE = "oas_session";

// Supabase access tokens default to a 1 hour lifetime; fall back to that when
// a session response doesn't carry `expiresIn` (e.g. the mock auth service
// used in tests).
const DEFAULT_MAX_AGE_SECONDS = 60 * 60;

export function setSessionCookie(c: Context, token: string, maxAgeSeconds?: number): void {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, SESSION_COOKIE, {
    path: "/",
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
  });
}
