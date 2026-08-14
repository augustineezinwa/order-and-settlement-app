import type { OrderStatus } from "@shared/api/types/orders";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (status?: OrderStatus) => [...orderKeys.lists(), { status }] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export const paymentKeys = {
  all: ["payments"] as const,
  list: (orderId: string) => [...paymentKeys.all, "list", orderId] as const,
};
