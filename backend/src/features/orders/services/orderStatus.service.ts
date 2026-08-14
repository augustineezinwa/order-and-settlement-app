import type { orderStatus } from "../../../lib/db/schema/orders.js";

export type StoredOrderStatus = (typeof orderStatus.enumValues)[number];
export type DisplayOrderStatus = StoredOrderStatus;

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function deriveDisplayStatus(input: {
  dueDate: string;
  totalCents: number;
  paidCents: number;
}): DisplayOrderStatus {
  if (input.paidCents >= input.totalCents) {
    return "paid";
  }

  if (input.dueDate < todayDateString()) {
    return "overdue";
  }

  if (input.paidCents > 0) {
    return "partially_paid";
  }

  return "pending";
}

export function deriveStoredStatus(input: {
  totalCents: number;
  paidCents: number;
}): Exclude<StoredOrderStatus, "overdue"> {
  if (input.paidCents >= input.totalCents) {
    return "paid";
  }

  if (input.paidCents > 0) {
    return "partially_paid";
  }

  return "pending";
}
