import type { AuthUserResponse, MeResponse } from "@shared/api/types/auth";
import { apiFetch } from "@/api/client";

export function signUp(email: string, password: string): Promise<AuthUserResponse> {
  return apiFetch<AuthUserResponse>("/auth/sign-up", {
    method: "POST",
    body: { email, password },
  });
}

export function signIn(email: string, password: string): Promise<AuthUserResponse> {
  return apiFetch<AuthUserResponse>("/auth/sign-in", {
    method: "POST",
    body: { email, password },
  });
}

export function signOut(): Promise<void> {
  return apiFetch<void>("/auth/sign-out", { method: "POST" });
}

export function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/auth/me");
}
