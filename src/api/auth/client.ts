import type { AuthSession, MeResponse } from "@shared/api/types/auth";
import { apiFetch } from "@/api/client";

export function signUp(email: string, password: string): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/sign-up", {
    method: "POST",
    body: { email, password },
  });
}

export function signIn(email: string, password: string): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/sign-in", {
    method: "POST",
    body: { email, password },
  });
}

export function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/auth/me", { auth: true });
}
