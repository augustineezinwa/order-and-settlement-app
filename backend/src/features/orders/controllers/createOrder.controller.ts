import type { Context } from "hono";

import { throwValidationError } from "../../../global/validation.js";
import type { AppEnv } from "../../../types/appEnv.js";
import { createOrderSchema } from "../schemas/order.schema.js";
import type { OrderService } from "../services/order.service.js";

export function createOrderController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const parsed = createOrderSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throwValidationError(parsed.error, "Invalid request body");
    }

    const order = await orderService.createOrder(c.get("userId"), parsed.data);
    return c.json(order, 201);
  };
}
