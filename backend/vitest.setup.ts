process.env.DATABASE_URL ??=
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:55432/testdb";
process.env.SUPABASE_URL ??= "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
