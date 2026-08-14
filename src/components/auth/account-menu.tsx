"use client";

import Link from "next/link";

import { useMe } from "@/api/auth/queries";
import { useSignOut } from "@/api/auth/mutations";

/** Sign-in link when signed out; email + sign-out when a session exists. */
export function AccountMenu() {
  const { data, isLoading } = useMe();
  const signOut = useSignOut();

  if (isLoading) {
    return <span className="h-7 w-16" aria-hidden="true" />;
  }

  if (!data) {
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
      <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{data.email}</span>
      <button
        type="button"
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
        className="inline-flex h-7 items-center justify-center rounded-full border border-border px-3 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
      >
        {signOut.isPending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
