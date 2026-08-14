import type { Context } from "hono";

import { HttpError } from "../../../global/errors.js";
import type { AppEnv } from "../../../types/appEnv.js";
import { updateOrderSchema } from "../schemas/order.schema.js";
import type { OrderService } from "../services/order.service.js";

export function updateOrderController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const orderId = c.get("orderId");
    if (!orderId) {
      throw new Error("orderId missing from context");
    }

    const parsed = updateOrderSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid request body", "VALIDATION_ERROR");
    }

    const order = await orderService.updateOrder(c.get("userId"), orderId, parsed.data);
    return c.json(order);
  };
}
