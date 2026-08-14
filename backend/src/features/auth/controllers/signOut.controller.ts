import type { Context } from "hono";
import { getCookie } from "hono/cookie";

import { SESSION_COOKIE, clearSessionCookie } from "../../../global/sessionCookie.js";
import type { AuthService } from "../services/auth.service.js";

export function signOutController(authService: AuthService) {
  return async (c: Context) => {
    const token = getCookie(c, SESSION_COOKIE);
    if (token) {
      await authService.signOut(token);
    }
    clearSessionCookie(c);
    return c.body(null, 204);
  };
}
