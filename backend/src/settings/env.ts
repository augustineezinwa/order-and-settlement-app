import { existsSync } from "node:fs";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Load a local .env in dev; production (Render) injects real env vars.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    PORT: z.coerce.number().int().positive().default(8787),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
