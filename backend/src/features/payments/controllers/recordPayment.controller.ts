import type { Context } from "hono";

import { HttpError } from "../../../global/errors.js";
import type { AppEnv } from "../../../types/appEnv.js";
import { recordPaymentSchema } from "../schemas/payment.schema.js";
import type { PaymentService } from "../services/payment.service.js";

export function recordPaymentController(paymentService: PaymentService) {
  return async (c: Context<AppEnv>) => {
    const orderId = c.get("orderId");
    if (!orderId) {
      throw new Error("orderId missing from context");
    }

    const parsed = recordPaymentSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid request body", "VALIDATION_ERROR");
    }

    const result = await paymentService.recordPayment(c.get("userId"), orderId, parsed.data);
    return c.json(result, 201);
  };
}
