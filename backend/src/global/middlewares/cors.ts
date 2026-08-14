import { cors } from "hono/cors";

import { env } from "../../settings/env.js";

/**
 * Allows direct calls to the API from the frontend's origin — used when
 * something other than the Next.js `/api/*` rewrite hits this service
 * directly (e.g. local dev against :8787). `credentials: true` plus a
 * specific (non-wildcard) origin lets the httpOnly session cookie ride
 * along on cross-origin requests too.
 */
export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Idempotency-Key"],
});
