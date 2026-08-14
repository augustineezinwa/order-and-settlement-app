import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { HttpError } from "../errors.js";
import { SESSION_COOKIE } from "../sessionCookie.js";
import type { AppEnv } from "../../types/appEnv.js";
import type { AuthService } from "../../features/auth/services/auth.service.js";

export function createRequireAuth(authService: AuthService) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE);
    if (!token) {
      throw new HttpError(401, "Sign in required", "UNAUTHORIZED");
    }

    const user = await authService.getUserFromToken(token);
    c.set("userId", user.id);
    c.set("userEmail", user.email);
    await next();
  });
}
