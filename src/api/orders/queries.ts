import { useQuery } from "@tanstack/react-query";

import { useHasSession } from "@/api/auth/use-has-session";
import { getOrder, listOrders, listOrderStatusHistory } from "@/api/orders/client";
import { orderKeys } from "@/api/query-keys";
import type { OrderStatus } from "@shared/api/types/orders";

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

export function useOrderStatusHistory(orderId: string) {
  const hasSession = useHasSession();

  return useQuery({
    queryKey: orderKeys.statusHistory(orderId),
    queryFn: () => listOrderStatusHistory(orderId),
    enabled: Boolean(orderId) && hasSession,
  });
}
