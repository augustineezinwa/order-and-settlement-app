process.env.DATABASE_URL ??=
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:55432/testdb";
process.env.SUPABASE_URL ??= "https://example.supabase.co";
process.env.SUPABASE_PUBLISHABLE_KEY ??= "sb_publishable_test";
process.env.SUPABASE_SECRET_KEY ??= "sb_secret_test";
