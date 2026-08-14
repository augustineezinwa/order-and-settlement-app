import { Hono } from "hono";

import { createAuthRoutes } from "./features/auth/routes.js";
import { createAuthService } from "./features/auth/services/auth.service.js";
import { errorHandler } from "./global/middlewares/errorHandler.js";
import { requestLogger } from "./global/middlewares/requestLogger.js";
import { supabase } from "./lib/supabase/client.js";
import type { AppEnv } from "./types/appEnv.js";

export type { AppEnv } from "./types/appEnv.js";

export type CreateAppDeps = {
  authService?: ReturnType<typeof createAuthService>;
};

export function createApp(deps: CreateAppDeps = {}) {
  const authService = deps.authService ?? createAuthService(supabase);
  const app = new Hono<AppEnv>();

  app.use(requestLogger);
  app.onError(errorHandler);

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/auth", createAuthRoutes(authService));

  return app;
}

export const app = createApp();
