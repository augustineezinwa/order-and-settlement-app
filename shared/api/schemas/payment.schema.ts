import { z } from "zod";

export const recordPaymentSchema = z.object({
  amountCents: z.number().int().min(1),
  paidAt: z.string().date(),
  note: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
