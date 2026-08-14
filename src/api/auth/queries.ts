import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/api/auth/client";
import { authKeys } from "@/api/query-keys";

/**
 * The httpOnly session cookie isn't readable from JS, so "am I signed in?"
 * is answered by asking the API rather than reading local storage. A 401
 * here just means "signed out" — not worth retrying.
 */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
