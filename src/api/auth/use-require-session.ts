"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMe } from "@/api/auth/queries";

/**
 * Redirects to /sign-in once `/auth/me` confirms there's no session cookie.
 * Returns false (render nothing yet) until that first check resolves, so we
 * never flash protected content before the redirect fires.
 */
export function useRequireSession(): boolean {
  const router = useRouter();
  const { data, isLoading } = useMe();
  const allowed = !isLoading && Boolean(data);

  useEffect(() => {
    if (!isLoading && !data) {
      router.replace("/sign-in");
    }
  }, [isLoading, data, router]);

  return allowed;
}
