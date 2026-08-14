import type { Context } from "hono";

import type { AppEnv } from "../../../types/appEnv.js";
import type { PaymentService } from "../services/payment.service.js";

export function listPaymentsController(paymentService: PaymentService) {
  return async (c: Context<AppEnv>) => {
    const orderId = c.get("orderId");
    if (!orderId) {
      throw new Error("orderId missing from context");
    }

    const result = await paymentService.listPayments(c.get("userId"), orderId);
    return c.json(result);
  };
}
