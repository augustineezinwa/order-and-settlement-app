import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index.js";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy backend/.env.example to backend/.env and set your Supabase Postgres connection string.",
    );
  }
  return url;
}

// `prepare: false` keeps us compatible with Supabase's transaction pooler (PgBouncer),
// which does not support prepared statements.
const client = postgres(requireDatabaseUrl(), { prepare: false });

// Singleton Drizzle instance. Import and reuse this, or inject it into services
// (e.g. `createOrderService(db)`) so business logic stays decoupled from the client.
export const db = drizzle(client, { schema });

export type Database = typeof db;

// Exposed for graceful shutdown and raw queries where the query builder is a poor fit.
export const sql = client;
