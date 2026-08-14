import type { Context } from "hono";

import type { AppEnv } from "../../../types/appEnv.js";
import type { OrderStatusHistoryService } from "../services/orderStatusHistory.service.js";

export function listStatusHistoryController(statusHistoryService: OrderStatusHistoryService) {
  return async (c: Context<AppEnv>) => {
    const orderId = c.get("orderId");
    if (!orderId) {
      throw new Error("orderId missing from context");
    }

    const history = await statusHistoryService.listStatusHistory(c.get("userId"), orderId);
    return c.json({ history });
  };
}
