import type { Context } from "hono";

import type { AppEnv } from "../../../types/appEnv.js";
import type { OrderService } from "../services/order.service.js";

export function deleteOrderController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const orderId = c.get("orderId");
    if (!orderId) {
      throw new Error("orderId missing from context");
    }

    await orderService.deleteOrder(c.get("userId"), orderId);
    return c.body(null, 204);
  };
}
