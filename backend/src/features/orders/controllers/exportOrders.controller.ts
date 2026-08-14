import type { Context } from "hono";

import { throwValidationError } from "../../../global/validation.js";
import type { AppEnv } from "../../../types/appEnv.js";
import { exportOrdersQuerySchema } from "../schemas/order.schema.js";
import { serializeOrdersCsv } from "../services/orderCsv.service.js";
import type { OrderService } from "../services/order.service.js";

export function exportOrdersController(orderService: OrderService) {
  return async (c: Context<AppEnv>) => {
    const parsed = exportOrdersQuerySchema.safeParse({
      from: c.req.query("from"),
      to: c.req.query("to"),
    });
    if (!parsed.success) {
      throwValidationError(parsed.error, "Invalid query parameters");
    }

    const orders = await orderService.exportOrders(c.get("userId"), parsed.data);
    const csv = serializeOrdersCsv(orders);
    const { from, to } = parsed.data;

    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", `attachment; filename="orders-${from}-${to}.csv"`);
    return c.body(csv);
  };
}
