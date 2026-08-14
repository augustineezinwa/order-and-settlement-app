import type { OrderSummary } from "@shared/api/types/orders.js";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatUsdPlain(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function serializeOrdersCsv(orders: OrderSummary[]): string {
  const header = "id,customer_name,due_date,status,order_total,amount_paid,amount_due";
  const rows = orders.map((order) =>
    [
      order.id,
      escapeCsvField(order.customerName),
      order.dueDate,
      order.status,
      formatUsdPlain(order.orderTotalCents),
      formatUsdPlain(order.amountPaidCents),
      formatUsdPlain(order.amountDueCents),
    ].join(","),
  );

  return [header, ...rows].join("\n");
}
