import { Hono } from "hono";

import { createAuthRoutes } from "./features/auth/routes.js";
import { createAuthService } from "./features/auth/services/auth.service.js";
import { createOrderRoutes } from "./features/orders/routes.js";
import { createOrderService } from "./features/orders/services/order.service.js";
import { errorHandler } from "./global/middlewares/errorHandler.js";
import { requestLogger } from "./global/middlewares/requestLogger.js";
import { db } from "./lib/db/index.js";
import { supabase } from "./lib/supabase/client.js";
import type { AppEnv } from "./types/appEnv.js";

export type { AppEnv } from "./types/appEnv.js";

export type CreateAppDeps = {
  authService?: ReturnType<typeof createAuthService>;
  orderService?: ReturnType<typeof createOrderService>;
};

export function createApp(deps: CreateAppDeps = {}) {
  const authService = deps.authService ?? createAuthService(supabase);
  const orderService = deps.orderService ?? createOrderService(db);
  const app = new Hono<AppEnv>();

  app.use(requestLogger);
  app.onError(errorHandler);

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/auth", createAuthRoutes(authService));
  app.route("/orders", createOrderRoutes({ authService, orderService }));

  return app;
}

export const app = createApp();
