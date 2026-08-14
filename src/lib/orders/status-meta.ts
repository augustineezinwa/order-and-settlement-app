import type { OrderStatus } from "./types";

/**
 * Status color is the one deliberate exception to the monochrome-first rule
 * (see DESIGN.md) — it exists only on badges, alerts, and these charts.
 * pending/partially_paid stay neutral ink; paid/overdue reuse the same
 * semantic tokens the status badge already uses.
 */
export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "var(--text-muted)",
  partially_paid: "var(--foreground)",
  paid: "var(--status-paid-text)",
  overdue: "var(--destructive)",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  partially_paid: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
};
