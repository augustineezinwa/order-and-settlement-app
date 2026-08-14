import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { signIn, signOut, signUp } from "@/api/auth/client";
import { authKeys, orderKeys } from "@/api/query-keys";

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, { userId: user.id, email: user.email });
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
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, { userId: user.id, email: user.email });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      router.push("/dashboard");
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({ queryKey: orderKeys.all });
      // No explicit redirect here — the sign-out control only appears on
      // protected pages (DashboardShell), and useRequireSession there
      // reacts to authKeys.me going empty and sends the visitor to
      // /sign-in on its own. A second, racing push("/") isn't needed.
    },
  });
}
