export type LineItemTotalInput = {
  quantity: number;
  unitPriceCents: number;
};

export function computeLineTotal(quantity: number, unitPriceCents: number): number {
  return quantity * unitPriceCents;
}

export function computeSubtotal(items: LineItemTotalInput[]): number {
  return items.reduce((sum, item) => sum + computeLineTotal(item.quantity, item.unitPriceCents), 0);
}

export function computeOrderTotal(subtotalCents: number): number {
  return subtotalCents;
}

export function computeAmountDue(totalCents: number, paidCents: number): number {
  return Math.max(0, totalCents - paidCents);
}
