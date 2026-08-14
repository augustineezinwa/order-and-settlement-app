export const ORDER_STATUSES = ["pending", "partially_paid", "paid", "overdue"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderSummary = {
  id: string;
  customerName: string;
  dueDate: string;
  status: OrderStatus;
  orderTotalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
};

export type OrderDetail = OrderSummary & {
  lineItems: LineItem[];
  payments: Array<{
    id: string;
    amountCents: number;
    paidAt: string;
    note: string | null;
    recordedBy: string;
  }>;
};

export type ListOrdersResponse = {
  orders: OrderSummary[];
};
