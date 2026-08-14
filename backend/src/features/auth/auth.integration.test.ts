import { describe, expect, it } from "vitest";

import { createApp } from "../../app.js";
import { HttpError } from "../../global/errors.js";
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
    ...overrides,
  };
}

describe("auth integration", () => {
  it("signs up with valid credentials", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({
      accessToken: "token-signup",
      user: mockUser,
    });
  });

  it("signs in with valid credentials", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      accessToken: "token-signin",
      user: mockUser,
    });
  });

  it("rejects unauthenticated access to /auth/me", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/me");

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      error: { message: "Missing or invalid authorization header", code: "UNAUTHORIZED" },
    });
  });

  it("rejects invalid token on /auth/me", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/me", {
      headers: { Authorization: "Bearer bad-token" },
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      error: { message: "Invalid or expired token", code: "UNAUTHORIZED" },
    });
  });

  it("returns userId for authenticated /auth/me", async () => {
    const app = createApp({ authService: createMockAuthService() });
    const res = await app.request("/auth/me", {
      headers: { Authorization: "Bearer valid-token" },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ userId: mockUser.id });
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
