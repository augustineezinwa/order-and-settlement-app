import { cors } from "hono/cors";

import { env } from "../../settings/env.js";

/** Allows the Next.js frontend (a separate origin/service) to call this API. */
export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
});
