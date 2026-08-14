import type { Context } from "hono";

import { HttpError } from "../../../global/errors.js";
import type { AppEnv } from "../../../types/appEnv.js";
import { createOrderSchema } from "../schemas/order.schema.js";
import type { OrderService } from "../services/order.service.js";

export function createOrderController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const parsed = createOrderSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid request body", "VALIDATION_ERROR");
    }

    const order = await orderService.createOrder(c.get("userId"), parsed.data);
    return c.json(order, 201);
  };
}
