import { and, asc, eq, sql } from "drizzle-orm";

import { HttpError } from "../../../global/errors.js";
import {
  computeAmountDue,
  computeOrderTotal,
  computeSubtotal,
} from "../../orders/services/orderTotals.service.js";
import {
  deriveDisplayStatus,
  deriveStoredStatus,
} from "../../orders/services/orderStatus.service.js";
import type { Database } from "../../../lib/db/index.js";
import { orderItems, orders } from "../../../lib/db/schema/orders.js";
import { payments } from "../../../lib/db/schema/payments.js";
import type { RecordPaymentInput } from "../schemas/payment.schema.js";

export type PaymentRecord = {
  id: string;
  amountCents: number;
  paidAt: string;
  note: string | null;
  recordedBy: string;
};

export type RecordPaymentResult = {
  payment: PaymentRecord;
  order: {
    status: ReturnType<typeof deriveDisplayStatus>;
    orderTotalCents: number;
    amountPaidCents: number;
    amountDueCents: number;
  };
};

export function createPaymentService(db: Database) {
  return {
    async recordPayment(
      userId: string,
      orderId: string,
      input: RecordPaymentInput,
    ): Promise<RecordPaymentResult> {
      return db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(orders)
          .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
          .for("update");

        if (!order) {
          throw new HttpError(404, "Order not found", "ORDER_NOT_FOUND");
        }

        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
        const orderTotalCents = computeOrderTotal(computeSubtotal(items));

        const [paidRow] = await tx
          .select({
            paidCents: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number),
          })
          .from(payments)
          .where(eq(payments.orderId, orderId));

        const currentPaidCents = paidRow?.paidCents ?? 0;
        const amountDueCents = computeAmountDue(orderTotalCents, currentPaidCents);

        if (input.amountCents > amountDueCents) {
          throw new HttpError(
            400,
            `Payment exceeds amount due. Maximum allowed: ${amountDueCents} cents`,
            "OVERPAYMENT",
            { maxAllowedCents: amountDueCents },
          );
        }

        const [payment] = await tx
          .insert(payments)
          .values({
            orderId,
            recordedBy: userId,
            amountCents: input.amountCents,
            paidAt: input.paidAt,
            note: input.note,
          })
          .returning();

        const newPaidCents = currentPaidCents + input.amountCents;
        const storedStatus = deriveStoredStatus({
          totalCents: orderTotalCents,
          paidCents: newPaidCents,
        });

        await tx
          .update(orders)
          .set({ status: storedStatus, updatedAt: new Date() })
          .where(eq(orders.id, orderId));

        return {
          payment: {
            id: payment.id,
            amountCents: payment.amountCents,
            paidAt: payment.paidAt,
            note: payment.note,
            recordedBy: payment.recordedBy,
          },
          order: {
            status: deriveDisplayStatus({
              dueDate: order.dueDate,
              totalCents: orderTotalCents,
              paidCents: newPaidCents,
            }),
            orderTotalCents,
            amountPaidCents: newPaidCents,
            amountDueCents: computeAmountDue(orderTotalCents, newPaidCents),
          },
        };
      });
    },

    async listPayments(userId: string, orderId: string): Promise<{ payments: PaymentRecord[] }> {
      const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

      if (!order) {
        throw new HttpError(404, "Order not found", "ORDER_NOT_FOUND");
      }

      const rows = await db
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId))
        .orderBy(asc(payments.paidAt), asc(payments.createdAt));

      return {
        payments: rows.map((payment) => ({
          id: payment.id,
          amountCents: payment.amountCents,
          paidAt: payment.paidAt,
          note: payment.note,
          recordedBy: payment.recordedBy,
        })),
      };
    },
  };
}

export type PaymentService = ReturnType<typeof createPaymentService>;
