import type { Context } from "hono";

import { throwValidationError } from "../../../global/validation.js";
import { authCredentialsSchema } from "../schemas/auth.schema.js";
import type { AuthService } from "../services/auth.service.js";

export function signInController(authService: AuthService) {
  return async (c: Context) => {
    const parsed = authCredentialsSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throwValidationError(parsed.error, "Invalid request body");
    }

    const session = await authService.signIn(parsed.data);
    return c.json(session);
  };
}
