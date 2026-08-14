import type { Context } from "hono";

import { throwValidationError } from "../../../global/validation.js";
import type { AppEnv } from "../../../types/appEnv.js";
import { listOrdersQuerySchema } from "../schemas/order.schema.js";
import type { OrderService } from "../services/order.service.js";

export function listOrdersController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const parsed = listOrdersQuerySchema.safeParse({ status: c.req.query("status") });
    if (!parsed.success) {
      throwValidationError(parsed.error, "Invalid query parameters");
    }

    const orders = await orderService.listOrders(c.get("userId"), parsed.data);
    return c.json({ orders });
  };
}
