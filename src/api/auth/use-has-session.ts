"use client";

import { useMe } from "@/api/auth/queries";

/** True once `/auth/me` has confirmed a session cookie is valid. */
export function useHasSession(): boolean {
  const { data, isLoading } = useMe();
  return !isLoading && Boolean(data);
}
