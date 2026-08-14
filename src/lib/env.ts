const DEFAULT_BACKEND_URL = "http://localhost:8787";

// Browser calls go through the Next.js dev proxy (/api → backend) to avoid CORS.
// SSR and explicit NEXT_PUBLIC_API_URL override that default.
function resolveApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return "/api";
  }
  return DEFAULT_BACKEND_URL;
}

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/$/, "");
