"use client";

import { useSyncExternalStore } from "react";

import { getSession } from "@/lib/auth/session";
import { subscribeSession } from "@/lib/auth/session-events";

export function useHasSession(): boolean {
  return useSyncExternalStore(
    subscribeSession,
    () => Boolean(getSession()?.accessToken),
    () => false,
  );
}
