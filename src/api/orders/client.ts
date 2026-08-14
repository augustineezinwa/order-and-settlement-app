import type {
  CreateOrderInput,
  UpdateOrderInput,
} from "@shared/api/schemas/order.schema";
import type {
  ListOrdersResponse,
  OrderDetail,
  OrderStatus,
  OrderSummary,
} from "@shared/api/types/orders";
import { apiFetch } from "@/api/client";

export function listOrders(status?: OrderStatus): Promise<OrderSummary[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<ListOrdersResponse>(`/orders${query}`, { auth: true }).then((res) => res.orders);
}

export function getOrder(id: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/orders/${id}`, { auth: true });
}

export function createOrder(input: CreateOrderInput): Promise<OrderSummary> {
  return apiFetch<OrderSummary>("/orders", {
    method: "POST",
    body: input,
    auth: true,
  });
}

export function updateOrder(id: string, input: UpdateOrderInput): Promise<OrderSummary> {
  return apiFetch<OrderSummary>(`/orders/${id}`, {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export function deleteOrder(id: string): Promise<void> {
  return apiFetch<void>(`/orders/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
