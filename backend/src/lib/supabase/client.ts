import { createClient } from "@supabase/supabase-js";

import { env } from "../../settings/env.js";

/** User-facing auth (sign-up, sign-in, token validation) — publishable key, same privilege as legacy anon. */
export const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);

/** Server-only elevated access — secret key, same privilege as legacy service_role. */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
