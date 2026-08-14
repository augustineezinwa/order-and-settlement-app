"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

import { clearSession, getSession } from "@/lib/auth/session";
import { subscribeSession } from "@/lib/auth/session-events";

function getSnapshot(): string | null {
  return getSession()?.user.email ?? null;
}

function getServerSnapshot(): string | null {
  return null;
}

/** Sign-in link when signed out; email + sign-out when a session exists. */
export function AccountMenu() {
  const router = useRouter();
  const email = useSyncExternalStore(subscribeSession, getSnapshot, getServerSnapshot);

  if (!email) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex h-7 items-center justify-center rounded-full border border-border px-3 text-sm font-medium hover:bg-muted"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{email}</span>
      <button
        type="button"
        onClick={() => {
          clearSession();
          router.push("/");
        }}
        className="inline-flex h-7 items-center justify-center rounded-full border border-border px-3 text-sm font-medium hover:bg-muted"
      >
        Sign out
      </button>
    </div>
  );
}
