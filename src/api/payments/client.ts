import type { RecordPaymentInput } from "@shared/api/schemas/payment.schema";
import type {
  ListPaymentsResponse,
  PaymentRecord,
  RecordPaymentResult,
} from "@shared/api/types/payments";
import { apiFetch } from "@/api/client";

export function listPayments(orderId: string): Promise<PaymentRecord[]> {
  return apiFetch<ListPaymentsResponse>(`/orders/${orderId}/payments`, { auth: true }).then(
    (res) => res.payments,
  );
}

export function recordPayment(
  orderId: string,
  input: RecordPaymentInput,
  idempotencyKey: string,
): Promise<RecordPaymentResult> {
  return apiFetch<RecordPaymentResult>(`/orders/${orderId}/payments`, {
    method: "POST",
    body: input,
    auth: true,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}
