import { createMiddleware } from "hono/factory";

import { HttpError } from "../../../global/errors.js";
import type { AppEnv } from "../../../types/appEnv.js";
import type { OrderService } from "../services/order.service.js";

export function createValidateOrderOwnership(orderService: OrderService) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const orderId = c.req.param("id");
    if (!orderId) {
      throw new HttpError(400, "Order id is required", "VALIDATION_ERROR");
    }

    const userId = c.get("userId");
    const exists = await orderService.orderExistsForUser(userId, orderId);

    if (!exists) {
      throw new HttpError(404, "Order not found", "ORDER_NOT_FOUND");
    }

    c.set("orderId", orderId);
    await next();
  });
}
