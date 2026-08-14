import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recordPayment } from "@/api/payments/client";
import { orderKeys } from "@/api/query-keys";
import type { RecordPaymentInput } from "@shared/api/schemas/payment.schema";

type RecordPaymentVariables = RecordPaymentInput & {
  orderId: string;
  idempotencyKey: string;
};

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, idempotencyKey, ...input }: RecordPaymentVariables) =>
      recordPayment(orderId, input, idempotencyKey),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
