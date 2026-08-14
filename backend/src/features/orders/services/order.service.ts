import type { OrderDetail, OrderSummary, OrderStatus } from "@shared/api/types/orders.js";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";

import { HttpError } from "../../../global/errors.js";
import type { Database } from "../../../lib/db/index.js";
import { orderItems, orders } from "../../../lib/db/schema/orders.js";
import { payments } from "../../../lib/db/schema/payments.js";
import type { CreateOrderInput, ExportOrdersQuery, UpdateOrderInput } from "../schemas/order.schema.js";
import { deriveDisplayStatus } from "./orderStatus.service.js";
import {
  computeAmountDue,
  computeOrderTotal,
  computeSubtotal,
} from "./orderTotals.service.js";

export type { OrderDetail, OrderSummary };

function mapOrderSummary(input: {
  id: string;
  customerName: string;
  dueDate: string;
  lineItems: Array<{ quantity: number; unitPriceCents: number }>;
  paidCents: number;
}): OrderSummary {
  const orderTotalCents = computeOrderTotal(computeSubtotal(input.lineItems));
  const amountPaidCents = input.paidCents;
  const status = deriveDisplayStatus({
    dueDate: input.dueDate,
    totalCents: orderTotalCents,
    paidCents: amountPaidCents,
  });

  return {
    id: input.id,
    customerName: input.customerName,
    dueDate: input.dueDate,
    status,
    orderTotalCents,
    amountPaidCents,
    amountDueCents: computeAmountDue(orderTotalCents, amountPaidCents),
  };
}

export function createOrderService(db: Database) {
  async function loadPaidCentsByOrderId(orderIds: string[]): Promise<Map<string, number>> {
    if (orderIds.length === 0) {
      return new Map();
    }

    const rows = await db
      .select({
        orderId: payments.orderId,
        paidCents: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number),
      })
      .from(payments)
      .where(inArray(payments.orderId, orderIds))
      .groupBy(payments.orderId);

    return new Map(rows.map((row) => [row.orderId, row.paidCents]));
  }

  async function loadLineItemsByOrderId(orderIds: string[]) {
    if (orderIds.length === 0) {
      return new Map<string, Array<{ quantity: number; unitPriceCents: number }>>();
    }

    const rows = await db
      .select({
        orderId: orderItems.orderId,
        quantity: orderItems.quantity,
        unitPriceCents: orderItems.unitPriceCents,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const grouped = new Map<string, Array<{ quantity: number; unitPriceCents: number }>>();
    for (const row of rows) {
      const items = grouped.get(row.orderId) ?? [];
      items.push({ quantity: row.quantity, unitPriceCents: row.unitPriceCents });
      grouped.set(row.orderId, items);
    }

    return grouped;
  }

  return {
    async createOrder(userId: string, input: CreateOrderInput): Promise<OrderSummary> {
      const order = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(orders)
          .values({
            userId,
            customerName: input.customerName,
            dueDate: input.dueDate,
          })
          .returning();

        await tx.insert(orderItems).values(
          input.lineItems.map((item) => ({
            orderId: created.id,
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
        );

        return created;
      });

      return mapOrderSummary({
        id: order.id,
        customerName: order.customerName,
        dueDate: order.dueDate,
        lineItems: input.lineItems,
        paidCents: 0,
      });
    },

    async listOrders(
      userId: string,
      filter?: { status?: OrderStatus },
    ): Promise<OrderSummary[]> {
      const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
      const orderIds = userOrders.map((order) => order.id);
      const lineItemsByOrderId = await loadLineItemsByOrderId(orderIds);
      const paidByOrderId = await loadPaidCentsByOrderId(orderIds);

      let summaries = userOrders.map((order) =>
        mapOrderSummary({
          id: order.id,
          customerName: order.customerName,
          dueDate: order.dueDate,
          lineItems: lineItemsByOrderId.get(order.id) ?? [],
          paidCents: paidByOrderId.get(order.id) ?? 0,
        }),
      );

      if (filter?.status) {
        summaries = summaries.filter((summary) => summary.status === filter.status);
      }

      return summaries;
    },

    async exportOrders(userId: string, range: ExportOrdersQuery): Promise<OrderSummary[]> {
      const userOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.userId, userId),
            gte(orders.dueDate, range.from),
            lte(orders.dueDate, range.to),
          ),
        );

      const orderIds = userOrders.map((order) => order.id);
      const lineItemsByOrderId = await loadLineItemsByOrderId(orderIds);
      const paidByOrderId = await loadPaidCentsByOrderId(orderIds);

      return userOrders.map((order) =>
        mapOrderSummary({
          id: order.id,
          customerName: order.customerName,
          dueDate: order.dueDate,
          lineItems: lineItemsByOrderId.get(order.id) ?? [],
          paidCents: paidByOrderId.get(order.id) ?? 0,
        }),
      );
    },

    async getOrderById(userId: string, orderId: string): Promise<OrderDetail> {
      const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

      if (!order) {
        throw new HttpError(404, "Order not found", "ORDER_NOT_FOUND");
      }

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      const paymentRows = await db.select().from(payments).where(eq(payments.orderId, orderId));
      const paidCents = paymentRows.reduce((sum, payment) => sum + payment.amountCents, 0);

      const summary = mapOrderSummary({
        id: order.id,
        customerName: order.customerName,
        dueDate: order.dueDate,
        lineItems: items,
        paidCents,
      });

      return {
        ...summary,
        lineItems: items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        })),
        payments: paymentRows.map((payment) => ({
          id: payment.id,
          amountCents: payment.amountCents,
          paidAt: payment.paidAt,
          note: payment.note,
          recordedBy: payment.recordedBy,
        })),
      };
    },

    async orderExistsForUser(userId: string, orderId: string): Promise<boolean> {
      const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

      return Boolean(order);
    },

    async countPayments(orderId: string): Promise<number> {
      const [row] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(payments)
        .where(eq(payments.orderId, orderId));

      return row?.count ?? 0;
    },

    async updateOrder(userId: string, orderId: string, input: UpdateOrderInput): Promise<OrderSummary> {
      const paymentCount = await this.countPayments(orderId);
      if (paymentCount > 0) {
        throw new HttpError(409, "Order cannot be edited after a payment has been recorded", "ORDER_NOT_EDITABLE");
      }

      const updated = await db.transaction(async (tx) => {
        const [order] = await tx
          .update(orders)
          .set({
            customerName: input.customerName,
            dueDate: input.dueDate,
            updatedAt: new Date(),
          })
          .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
          .returning();

        if (!order) {
          throw new HttpError(404, "Order not found", "ORDER_NOT_FOUND");
        }

        await tx.delete(orderItems).where(eq(orderItems.orderId, orderId));
        await tx.insert(orderItems).values(
          input.lineItems.map((item) => ({
            orderId,
            description: item.description,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
        );

        return order;
      });

      return mapOrderSummary({
        id: updated.id,
        customerName: updated.customerName,
        dueDate: updated.dueDate,
        lineItems: input.lineItems,
        paidCents: 0,
      });
    },

    async deleteOrder(userId: string, orderId: string): Promise<void> {
      const paymentCount = await this.countPayments(orderId);
      if (paymentCount > 0) {
        throw new HttpError(409, "Order cannot be deleted after a payment has been recorded", "ORDER_NOT_DELETABLE");
      }

      const deleted = await db
        .delete(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .returning({ id: orders.id });

      if (deleted.length === 0) {
        throw new HttpError(404, "Order not found", "ORDER_NOT_FOUND");
      }
    },
  };
}

export type OrderService = ReturnType<typeof createOrderService>;
