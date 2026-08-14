import type { Context } from "hono";

import { HttpError } from "../../../global/errors.js";
import { throwValidationError } from "../../../global/validation.js";
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
      throwValidationError(parsed.error, "Invalid request body");
    }

    const idempotencyKey = c.req.header("Idempotency-Key")?.trim() || undefined;
    if (idempotencyKey !== undefined && idempotencyKey.length === 0) {
      throw new HttpError(400, "Idempotency-Key must not be empty", "VALIDATION_ERROR");
    }

    const result = await paymentService.recordPayment(c.get("userId"), orderId, parsed.data, idempotencyKey);
    return c.json(result, 201);
  };
}
