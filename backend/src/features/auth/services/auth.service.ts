import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../../../global/errors.js";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

function mapSignUpError(message: string): HttpError {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return new HttpError(409, "An account with this email already exists", "EMAIL_ALREADY_EXISTS");
  }
  return new HttpError(400, message, "SIGN_UP_FAILED");
}

function mapSignInError(): HttpError {
  return new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
}

export function createAuthService(supabase: SupabaseClient) {
  return {
    async signUp({ email, password }: { email: string; password: string }): Promise<AuthSession> {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        throw mapSignUpError(error.message);
      }

      const accessToken = data.session?.access_token;
      if (!accessToken || !data.user?.email) {
        throw new HttpError(
          400,
          "Email confirmation required before sign in",
          "EMAIL_CONFIRMATION_REQUIRED",
        );
      }

      return {
        accessToken,
        user: { id: data.user.id, email: data.user.email },
      };
    },

    async signIn({ email, password }: { email: string; password: string }): Promise<AuthSession> {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session?.access_token || !data.user?.email) {
        throw mapSignInError();
      }

      return {
        accessToken: data.session.access_token,
        user: { id: data.user.id, email: data.user.email },
      };
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
