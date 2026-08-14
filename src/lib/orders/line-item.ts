import type { LineItem } from "@/lib/orders/types";

export function lineTotalCents(item: Pick<LineItem, "quantity" | "unitPriceCents">): number {
  return item.quantity * item.unitPriceCents;
}
