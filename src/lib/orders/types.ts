export type OrderStatus = "pending" | "partially_paid" | "paid" | "overdue";

export type OrderSummary = {
  id: string;
  customerName: string;
  dueDate: string;
  status: OrderStatus;
  orderTotalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
};

export const ORDER_STATUSES: OrderStatus[] = ["pending", "partially_paid", "paid", "overdue"];
