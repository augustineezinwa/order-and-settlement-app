import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { getOrder, listOrders } from "@/api/orders/client";
import { orderKeys } from "@/api/query-keys";
import { getSession } from "@/lib/auth/session";
import { subscribeSession } from "@/lib/auth/session-events";
import type { OrderStatus } from "@shared/api/types/orders";

function useHasSession(): boolean {
  return useSyncExternalStore(
    subscribeSession,
    () => Boolean(getSession()?.accessToken),
    () => false,
  );
}

export function useOrders(status?: OrderStatus) {
  const hasSession = useHasSession();

  return useQuery({
    queryKey: orderKeys.list(status),
    queryFn: () => listOrders(status),
    enabled: hasSession,
  });
}

export function useOrder(id: string) {
  const hasSession = useHasSession();

  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id) && hasSession,
  });
}
