"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { getSession } from "@/lib/auth/session";
import { subscribeSession } from "@/lib/auth/session-events";

function hasAccessToken(): boolean {
  return Boolean(getSession()?.accessToken);
}

export function useRequireSession(): boolean {
  const router = useRouter();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const allowed = useSyncExternalStore(
    subscribeSession,
    hasAccessToken,
    () => false,
  );

  useEffect(() => {
    if (!mounted) return;
    if (!allowed) {
      router.replace("/sign-in");
    }
  }, [router, allowed, mounted]);

  if (!mounted) {
    return false;
  }

  return allowed;
}
