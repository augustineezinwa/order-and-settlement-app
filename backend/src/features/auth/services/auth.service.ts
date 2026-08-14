import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../../../global/errors.js";

import type { AuthSession, AuthUser } from "@shared/api/types/auth.js";

export type { AuthSession, AuthUser };

function mapSignUpError(message: string): HttpError {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return new HttpError(409, "An account with this email already exists", "EMAIL_ALREADY_EXISTS");
  }
  return new HttpError(400, message, "SIGN_UP_FAILED");
}

function mapSignInError(message?: string): HttpError {
  return new HttpError(401, message ?? "Invalid email or password", "INVALID_CREDENTIALS");
}

function toSession(
  accessToken: string,
  user: { id: string; email: string },
): AuthSession {
  return {
    accessToken,
    user: { id: user.id, email: user.email },
  };
}

export function createAuthService(supabase: SupabaseClient, supabaseAdmin: SupabaseClient) {
  return {
    async signUp({ email, password }: { email: string; password: string }): Promise<AuthSession> {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        throw mapSignUpError(createError.message);
      }

      if (!created.user?.email) {
        throw new HttpError(400, "Failed to create account", "SIGN_UP_FAILED");
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session?.access_token) {
        throw new HttpError(
          400,
          error?.message ?? "Account created but sign-in failed. Try signing in.",
          "SIGN_UP_FAILED",
        );
      }

      return toSession(data.session.access_token, {
        id: created.user.id,
        email: created.user.email,
      });
    },

    async signIn({ email, password }: { email: string; password: string }): Promise<AuthSession> {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw mapSignInError(error.message);
      }
      if (!data.session?.access_token || !data.user?.email) {
        throw mapSignInError();
      }

      return toSession(data.session.access_token, {
        id: data.user.id,
        email: data.user.email,
      });
    },

    async getUserFromToken(token: string): Promise<AuthUser> {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user?.email) {
        throw new HttpError(401, "Invalid or expired token", "UNAUTHORIZED");
      }

      return { id: data.user.id, email: data.user.email };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
