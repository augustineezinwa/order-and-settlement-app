import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../../settings/env.js";
import * as schema from "./schema/index.js";

// `prepare: false` keeps us compatible with Supabase's transaction pooler (PgBouncer),
// which does not support prepared statements.
const client = postgres(env.DATABASE_URL, { prepare: false });

// Singleton Drizzle instance. Import and reuse this, or inject it into services
// (e.g. `createOrderService(db)`) so business logic stays decoupled from the client.
export const db = drizzle(client, { schema });

export type Database = typeof db;

// Exposed for graceful shutdown and raw queries where the query builder is a poor fit.
export const sql = client;
