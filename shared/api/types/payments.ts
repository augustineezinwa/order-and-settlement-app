import type { OrderStatus } from "./orders.js";

export type PaymentRecord = {
  id: string;
  amountCents: number;
  paidAt: string;
  note: string | null;
  recordedBy: string;
};

export type RecordPaymentResult = {
  payment: PaymentRecord;
  order: {
    status: OrderStatus;
    orderTotalCents: number;
    amountPaidCents: number;
    amountDueCents: number;
  };
};

export type ListPaymentsResponse = {
  payments: PaymentRecord[];
};
