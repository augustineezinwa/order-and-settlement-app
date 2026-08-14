import { Hono } from "hono";

import { createRequireAuth } from "../../global/middlewares/auth.js";
import { meController } from "./controllers/me.controller.js";
import { signInController } from "./controllers/signIn.controller.js";
import { signOutController } from "./controllers/signOut.controller.js";
import { signUpController } from "./controllers/signUp.controller.js";
import type { AuthService } from "./services/auth.service.js";
import type { AppEnv } from "../../types/appEnv.js";

export function createAuthRoutes(authService: AuthService) {
  const router = new Hono<AppEnv>();

  router.post("/sign-up", signUpController(authService));
  router.post("/sign-in", signInController(authService));
  router.post("/sign-out", signOutController(authService));
  router.get("/me", createRequireAuth(authService), meController());

  return router;
}
