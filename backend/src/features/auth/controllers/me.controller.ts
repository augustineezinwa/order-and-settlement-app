import type { Context } from "hono";

import type { AppEnv } from "../../../types/appEnv.js";

export function meController() {
  return (c: Context<AppEnv>) => c.json({ userId: c.get("userId"), email: c.get("userEmail") });
}
