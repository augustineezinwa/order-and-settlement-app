import type { OrderSummary } from "./types";

/** Synthetic demo data — replace with GET /orders when auth is wired. */
export const demoOrders: OrderSummary[] = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    customerName: "Acme Corp",
    dueDate: "2026-09-15",
    status: "partially_paid",
    orderTotalCents: 100_000,
    amountPaidCents: 40_000,
    amountDueCents: 60_000,
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    customerName: "Northline Studio",
    dueDate: "2026-08-01",
    status: "overdue",
    orderTotalCents: 245_000,
    amountPaidCents: 100_000,
    amountDueCents: 145_000,
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    customerName: "Verdant Supply",
    dueDate: "2026-10-20",
    status: "paid",
    orderTotalCents: 89_500,
    amountPaidCents: 89_500,
    amountDueCents: 0,
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    customerName: "Rivet Logistics",
    dueDate: "2026-09-30",
    status: "pending",
    orderTotalCents: 312_000,
    amountPaidCents: 0,
    amountDueCents: 312_000,
  },
  {
    id: "a1000000-0000-4000-8000-000000000005",
    customerName: "Stacked Media",
    dueDate: "2026-08-28",
    status: "paid",
    orderTotalCents: 156_000,
    amountPaidCents: 156_000,
    amountDueCents: 0,
  },
];
