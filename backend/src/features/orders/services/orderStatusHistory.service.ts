import type { OrderStatusHistoryEntry } from "@shared/api/types/orders.js";
import { and, asc, eq } from "drizzle-orm";

import { HttpError } from "../../../global/errors.js";
import type { Database } from "../../../lib/db/index.js";
import { orderStatusHistory } from "../../../lib/db/schema/audit.js";
import { orders } from "../../../lib/db/schema/orders.js";

export function createOrderStatusHistoryService(db: Database) {
  return {
    async listStatusHistory(userId: string, orderId: string): Promise<OrderStatusHistoryEntry[]> {
      const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

      if (!order) {
        throw new HttpError(404, "Order not found", "ORDER_NOT_FOUND");
      }

      const rows = await db
        .select({
          id: orderStatusHistory.id,
          fromStatus: orderStatusHistory.fromStatus,
          toStatus: orderStatusHistory.toStatus,
          changedAt: orderStatusHistory.changedAt,
        })
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, orderId))
        .orderBy(asc(orderStatusHistory.changedAt));

      return rows.map((row) => ({
        id: row.id,
        fromStatus: row.fromStatus,
        toStatus: row.toStatus,
        changedAt: row.changedAt.toISOString(),
      }));
    },
  };
}

export type OrderStatusHistoryService = ReturnType<typeof createOrderStatusHistoryService>;
