import { demoOrders } from "./demo-orders";
import type { OrderSummary } from "./types";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
};

export type Payment = {
  id: string;
  amountCents: number;
  date: string;
  note?: string;
};

export type OrderDetail = OrderSummary & {
  lineItems: LineItem[];
  payments: Payment[];
};

export function lineTotalCents(item: LineItem): number {
  return item.quantity * item.unitPriceCents;
}

/** Synthetic line items + payment history, keyed by demo order id. */
const details: Record<string, Pick<OrderDetail, "lineItems" | "payments">> = {
  "a1000000-0000-4000-8000-000000000001": {
    // Mirrors the assignment's own sample scenario: 2 × $500 = $1,000, $400 recorded so far.
    lineItems: [
      { id: "li-1", description: "Standard install kit", quantity: 2, unitPriceCents: 50_000 },
    ],
    payments: [
      { id: "pmt-1", amountCents: 40_000, date: "2026-08-10", note: "Deposit on order" },
    ],
  },
  "a1000000-0000-4000-8000-000000000002": {
    lineItems: [
      { id: "li-1", description: "Structural assessment", quantity: 1, unitPriceCents: 120_000 },
      { id: "li-2", description: "Materials — grade B steel", quantity: 5, unitPriceCents: 20_000 },
      { id: "li-3", description: "Site labor (days)", quantity: 5, unitPriceCents: 5_000 },
    ],
    payments: [
      { id: "pmt-1", amountCents: 60_000, date: "2026-07-05", note: "Initial draw" },
      { id: "pmt-2", amountCents: 40_000, date: "2026-07-20" },
    ],
  },
  "a1000000-0000-4000-8000-000000000003": {
    lineItems: [
      { id: "li-1", description: "Irrigation controller unit", quantity: 1, unitPriceCents: 89_500 },
    ],
    payments: [
      { id: "pmt-1", amountCents: 89_500, date: "2026-08-01", note: "Paid in full on delivery" },
    ],
  },
  "a1000000-0000-4000-8000-000000000004": {
    lineItems: [
      { id: "li-1", description: "Freight — pallet (LTL)", quantity: 12, unitPriceCents: 20_000 },
      { id: "li-2", description: "Fuel surcharge", quantity: 1, unitPriceCents: 72_000 },
    ],
    payments: [],
  },
  "a1000000-0000-4000-8000-000000000005": {
    lineItems: [
      { id: "li-1", description: "Media buy — Q3 package", quantity: 1, unitPriceCents: 156_000 },
    ],
    payments: [
      { id: "pmt-1", amountCents: 80_000, date: "2026-08-02", note: "First installment" },
      { id: "pmt-2", amountCents: 76_000, date: "2026-08-09", note: "Balance" },
    ],
  },
};

export function getOrderDetail(id: string): OrderDetail | undefined {
  const summary = demoOrders.find((o) => o.id === id);
  const detail = details[id];
  if (!summary || !detail) return undefined;
  return { ...summary, ...detail };
}
