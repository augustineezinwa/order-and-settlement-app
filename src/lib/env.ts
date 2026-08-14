// No frontend .env file exists yet in this project — this falls back to the
// backend's documented local dev port (see backend/.env.example PORT).
// Set NEXT_PUBLIC_API_URL to override for staging/production.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787").replace(/\/$/, "");
