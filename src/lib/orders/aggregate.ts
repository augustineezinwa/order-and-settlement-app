import { ORDER_STATUSES, type OrderStatus, type OrderSummary } from "./types";

export type StatusBucket = {
  status: OrderStatus;
  count: number;
  totalCents: number;
};

/** Book-of-business composition: count and order-total value per status. */
export function statusBreakdown(orders: OrderSummary[]): StatusBucket[] {
  return ORDER_STATUSES.map((status) => {
    const rows = orders.filter((o) => o.status === status);
    return {
      status,
      count: rows.length,
      totalCents: rows.reduce((sum, o) => sum + o.orderTotalCents, 0),
    };
  });
}

/** Orders with a balance outstanding, ranked highest amount due first. */
export function amountsDueByOrder(orders: OrderSummary[], limit = 6): OrderSummary[] {
  return [...orders]
    .filter((o) => o.amountDueCents > 0)
    .sort((a, b) => b.amountDueCents - a.amountDueCents)
    .slice(0, limit);
}

export type PortfolioTotals = {
  orderTotalCents: number;
  amountPaidCents: number;
  amountDueCents: number;
  overdueCents: number;
};

export function portfolioTotals(orders: OrderSummary[]): PortfolioTotals {
  return {
    orderTotalCents: orders.reduce((sum, o) => sum + o.orderTotalCents, 0),
    amountPaidCents: orders.reduce((sum, o) => sum + o.amountPaidCents, 0),
    amountDueCents: orders.reduce((sum, o) => sum + o.amountDueCents, 0),
    overdueCents: orders
      .filter((o) => o.status === "overdue")
      .reduce((sum, o) => sum + o.amountDueCents, 0),
  };
}
