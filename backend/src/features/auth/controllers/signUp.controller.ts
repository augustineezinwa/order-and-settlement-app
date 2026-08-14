import type { Context } from "hono";

import { HttpError } from "../../../global/errors.js";
import { authCredentialsSchema } from "../schemas/auth.schema.js";
import type { AuthService } from "../services/auth.service.js";

export function signUpController(authService: AuthService) {
  return async (c: Context) => {
    const parsed = authCredentialsSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid request body", "VALIDATION_ERROR");
    }

    const session = await authService.signUp(parsed.data);
    return c.json(session, 201);
  };
}
