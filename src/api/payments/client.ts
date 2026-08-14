import type { RecordPaymentInput } from "@shared/api/schemas/payment.schema";
import type {
  ListPaymentsResponse,
  PaymentRecord,
  RecordPaymentResult,
} from "@shared/api/types/payments";
import { apiFetch } from "@/api/client";

export function listPayments(orderId: string): Promise<PaymentRecord[]> {
  return apiFetch<ListPaymentsResponse>(`/orders/${orderId}/payments`).then((res) => res.payments);
}

export function recordPayment(
  orderId: string,
  input: RecordPaymentInput,
  idempotencyKey: string,
): Promise<RecordPaymentResult> {
  return apiFetch<RecordPaymentResult>(`/orders/${orderId}/payments`, {
    method: "POST",
    body: input,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}
