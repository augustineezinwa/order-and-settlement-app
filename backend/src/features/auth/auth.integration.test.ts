import { describe, expect, it, vi } from "vitest";

import { createApp } from "../../app.js";
import { HttpError } from "../../global/errors.js";
import { SESSION_COOKIE } from "../../global/sessionCookie.js";
import type { AuthService } from "./services/auth.service.js";

const mockUser = { id: "user-123", email: "test@example.com" };

function createMockAuthService(overrides: Partial<AuthService> = {}): AuthService {
  return {
    signUp: async () => ({ accessToken: "token-signup", user: mockUser }),
    signIn: async () => ({ accessToken: "token-signin", user: mockUser }),
    getUserFromToken: async (token: string) => {
      if (token === "valid-token") {
        return mockUser;
      }
      throw new HttpError(401, "Invalid or expired token", "UNAUTHORIZED");
    },
    signOut: async () => {},
    ...overrides,
  };
}

/** Pulls the session token back out of a Set-Cookie response header. */
function extractSessionCookie(res: Response): string | null {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

describe("auth integration", () => {
  it("signs up with valid credentials and sets an httpOnly session cookie", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ user: mockUser });

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain(`${SESSION_COOKIE}=token-signup`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).not.toContain("Secure"); // NODE_ENV=test in this suite
  });

  it("signs in with valid credentials and sets an httpOnly session cookie", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ user: mockUser });
    expect(extractSessionCookie(res)).toBe("token-signin");
  });

  it("rejects unauthenticated access to /auth/me", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/me");

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      error: { message: "Sign in required", code: "UNAUTHORIZED" },
    });
  });

  it("rejects an invalid session cookie on /auth/me", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/me", {
      headers: { Cookie: `${SESSION_COOKIE}=bad-token` },
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      error: { message: "Invalid or expired token", code: "UNAUTHORIZED" },
    });
  });

  it("returns the user for an authenticated /auth/me", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/me", {
      headers: { Cookie: `${SESSION_COOKIE}=valid-token` },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ userId: mockUser.id, email: mockUser.email });
  });

  it("clears the session cookie on sign-out and revokes the token", async () => {
    const signOut = vi.fn(async () => {});
    const app = createApp({ authService: createMockAuthService({ signOut }) });
    const res = await app.request("/auth/sign-out", {
      method: "POST",
      headers: { Cookie: `${SESSION_COOKIE}=valid-token` },
    });

    expect(res.status).toBe(204);
    expect(signOut).toHaveBeenCalledWith("valid-token");

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain(`${SESSION_COOKIE}=;`);
  });

  it("sign-out is a harmless no-op with no session cookie", async () => {
    const signOut = vi.fn(async () => {});
    const app = createApp({ authService: createMockAuthService({ signOut }) });
    const res = await app.request("/auth/sign-out", { method: "POST" });

    expect(res.status).toBe(204);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("returns actionable validation errors for invalid sign-up input", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "short" }),
    });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: {
        message: "Enter a valid email address.",
        code: "VALIDATION_ERROR",
        details: {
          fieldErrors: {
            email: ["Enter a valid email address."],
            password: ["Password must be at least 8 characters."],
          },
        },
      },
    });
  });
});
