import { z } from "zod";

export const recordPaymentSchema = z.object({
  amountCents: z.number().int().min(1, "Minimum payment is $0.01."),
  paidAt: z.string().date("Use a valid payment date (YYYY-MM-DD)."),
  note: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
