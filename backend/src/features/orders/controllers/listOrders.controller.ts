import type { Context } from "hono";

import { HttpError } from "../../../global/errors.js";
import type { AppEnv } from "../../../types/appEnv.js";
import { listOrdersQuerySchema } from "../schemas/order.schema.js";
import type { OrderService } from "../services/order.service.js";

export function listOrdersController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const parsed = listOrdersQuerySchema.safeParse({ status: c.req.query("status") });
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid query parameters", "VALIDATION_ERROR");
    }

    const orders = await orderService.listOrders(c.get("userId"), parsed.data);
    return c.json({ orders });
  };
}
