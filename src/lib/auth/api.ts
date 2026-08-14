import { API_BASE_URL } from "@/lib/env";

export type AuthUser = { id: string; email: string };
export type AuthSession = { accessToken: string; user: AuthUser };

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function postCredentials(path: string, email: string, password: string): Promise<AuthSession> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthApiError("Can't reach the server. Is the API running?", 0);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message ?? "Something went wrong. Please try again.";
    throw new AuthApiError(message, res.status, body?.error?.code);
  }
  return body as AuthSession;
}

export const signUp = (email: string, password: string) => postCredentials("/auth/sign-up", email, password);
export const signIn = (email: string, password: string) => postCredentials("/auth/sign-in", email, password);
