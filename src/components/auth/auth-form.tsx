"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { useSignIn, useSignUp } from "@/api/auth/mutations";
import { ApiError } from "@/api/client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "sign-up" | "sign-in";

const copy: Record<Mode, { heading: string; subhead: string; submit: string; submitting: string; switchPrompt: string; switchHref: string; switchLabel: string }> = {
  "sign-up": {
    heading: "Create your account",
    subhead: "Track orders and settle payments in one place.",
    submit: "Create account",
    submitting: "Creating account…",
    switchPrompt: "Already have an account?",
    switchHref: "/sign-in",
    switchLabel: "Sign in",
  },
  "sign-in": {
    heading: "Sign in",
    subhead: "Welcome back — pick up where you left off.",
    submit: "Sign in",
    submitting: "Signing in…",
    switchPrompt: "Need an account?",
    switchHref: "/sign-up",
    switchLabel: "Get started",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const text = copy[mode];
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const mutation = mode === "sign-up" ? signUpMutation : signInMutation;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!EMAIL_PATTERN.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({ email, password });
  }

  const formError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Something went wrong. Please try again."
        : null;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{text.heading}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{text.subhead}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        {formError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={cn("h-10", fieldErrors.email && "border-destructive")}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
            className={cn("h-10", fieldErrors.password && "border-destructive")}
          />
          {fieldErrors.password ? (
            <p id="password-error" className="text-xs text-destructive">
              {fieldErrors.password}
            </p>
          ) : (
            <p id="password-hint" className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-60"
        >
          {mutation.isPending ? text.submitting : text.submit}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {text.switchPrompt}{" "}
        <Link href={text.switchHref} className="font-medium text-foreground hover:underline">
          {text.switchLabel}
        </Link>
      </p>
    </div>
  );
}
