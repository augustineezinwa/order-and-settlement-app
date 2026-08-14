import type { Context } from "hono";

import { setSessionCookie } from "../../../global/sessionCookie.js";
import { throwValidationError } from "../../../global/validation.js";
import { authCredentialsSchema } from "../schemas/auth.schema.js";
import type { AuthService } from "../services/auth.service.js";

export function signUpController(authService: AuthService) {
  return async (c: Context) => {
    const parsed = authCredentialsSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throwValidationError(parsed.error, "Invalid request body");
    }

    const session = await authService.signUp(parsed.data);
    setSessionCookie(c, session.accessToken, session.expiresIn);
    return c.json({ user: session.user }, 201);
  };
}
