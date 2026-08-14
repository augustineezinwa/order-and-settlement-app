import type { Context } from "hono";

import type { AppEnv } from "../../../types/appEnv.js";
import type { OrderService } from "../services/order.service.js";

export function getOrderController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const orderId = c.get("orderId");
    if (!orderId) {
      throw new Error("orderId missing from context");
    }

    const order = await orderService.getOrderById(c.get("userId"), orderId);
    return c.json(order);
  };
}
