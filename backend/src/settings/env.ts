import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { loadEnvFromFile } from "./load-env-file.js";

const settingsDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(settingsDir, "../..");
const repoRoot = path.resolve(backendDir, "..");

// Least specific first — never overwrite vars already set in the environment.
for (const envFile of [
  path.join(repoRoot, ".env"),
  path.join(repoRoot, ".env.local"),
  path.join(backendDir, ".env"),
  path.join(backendDir, ".env.local"),
]) {
  if (existsSync(envFile)) {
    loadEnvFromFile(envFile);
  }
}

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    SUPABASE_URL: z.url(),
    SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    SUPABASE_SECRET_KEY: z.string().min(1),
    PORT: z.coerce.number().int().positive().default(8787),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CORS_ORIGIN: z.url().default("http://localhost:3000"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
