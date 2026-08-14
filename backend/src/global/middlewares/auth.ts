import { createMiddleware } from "hono/factory";

import { HttpError } from "../errors.js";
import type { AppEnv } from "../../types/appEnv.js";
import type { AuthService } from "../../features/auth/services/auth.service.js";

export function createRequireAuth(authService: AuthService) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const header = c.req.header("Authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or invalid authorization header", "UNAUTHORIZED");
    }

    const token = header.slice("Bearer ".length);
    const user = await authService.getUserFromToken(token);
    c.set("userId", user.id);
    await next();
  });
}
