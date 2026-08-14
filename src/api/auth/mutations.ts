import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { signIn, signUp } from "@/api/auth/client";
import { orderKeys } from "@/api/query-keys";
import { saveSession } from "@/lib/auth/session";

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: (session) => {
      saveSession(session);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      router.push("/dashboard");
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signUp(email, password),
    onSuccess: (session) => {
      saveSession(session);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      router.push("/dashboard");
    },
  });
}
