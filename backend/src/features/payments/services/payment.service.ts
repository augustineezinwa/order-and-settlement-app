import type { PaymentRecord, RecordPaymentResult } from "@shared/api/types/payments.js";
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

export type { PaymentRecord, RecordPaymentResult };

type PaymentRow = typeof payments.$inferSelect;
type OrderRow = typeof orders.$inferSelect;
type DbTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

function toPaymentRecord(payment: PaymentRow): PaymentRecord {
  return {
    id: payment.id,
    amountCents: payment.amountCents,
    paidAt: payment.paidAt,
    note: payment.note,
    recordedBy: payment.recordedBy,
  };
}

async function sumPaidCents(tx: DbTransaction, orderId: string): Promise<number> {
  const [paidRow] = await tx
    .select({
      paidCents: sql<number>`coalesce(sum(${payments.amountCents}), 0)`.mapWith(Number),
    })
    .from(payments)
    .where(eq(payments.orderId, orderId));

  return paidRow?.paidCents ?? 0;
}

async function buildRecordPaymentResult(
  tx: DbTransaction,
  order: OrderRow,
  payment: PaymentRow,
  orderTotalCents: number,
): Promise<RecordPaymentResult> {
  const amountPaidCents = await sumPaidCents(tx, order.id);

  return {
    payment: toPaymentRecord(payment),
    order: {
      status: deriveDisplayStatus({
        dueDate: order.dueDate,
        totalCents: orderTotalCents,
        paidCents: amountPaidCents,
      }),
      orderTotalCents,
      amountPaidCents,
      amountDueCents: computeAmountDue(orderTotalCents, amountPaidCents),
    },
  };
}

function assertIdempotentReplay(existing: PaymentRow, orderId: string, input: RecordPaymentInput) {
  if (existing.orderId !== orderId) {
    throw new HttpError(409, "Idempotency-Key already used for a different order", "IDEMPOTENCY_KEY_REUSED");
  }

  if (existing.amountCents !== input.amountCents || existing.paidAt !== input.paidAt || existing.note !== (input.note ?? null)) {
    throw new HttpError(
      409,
      "Idempotency-Key already used with a different payment payload",
      "IDEMPOTENCY_KEY_REUSED",
    );
  }
}

function isUniqueViolation(error: unknown): boolean {
  const codes: string[] = [];
  if (typeof error === "object" && error !== null && "code" in error) {
    codes.push(String((error as { code: unknown }).code));
  }
  if (typeof error === "object" && error !== null && "cause" in error) {
    const cause = (error as { cause: unknown }).cause;
    if (typeof cause === "object" && cause !== null && "code" in cause) {
      codes.push(String((cause as { code: unknown }).code));
    }
  }
  return codes.includes("23505");
}

export function createPaymentService(db: Database) {
  return {
    async recordPayment(
      userId: string,
      orderId: string,
      input: RecordPaymentInput,
      idempotencyKey?: string,
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

        if (idempotencyKey) {
          const [existing] = await tx
            .select()
            .from(payments)
            .where(eq(payments.idempotencyKey, idempotencyKey));

          if (existing) {
            assertIdempotentReplay(existing, orderId, input);
            return buildRecordPaymentResult(tx, order, existing, orderTotalCents);
          }
        }

        const currentPaidCents = await sumPaidCents(tx, orderId);
        const amountDueCents = computeAmountDue(orderTotalCents, currentPaidCents);

        if (input.amountCents > amountDueCents) {
          throw new HttpError(
            400,
            `Payment exceeds amount due. Maximum allowed: ${amountDueCents} cents`,
            "OVERPAYMENT",
            { maxAllowedCents: amountDueCents },
          );
        }

        try {
          const [payment] = await tx
            .insert(payments)
            .values({
              orderId,
              recordedBy: userId,
              amountCents: input.amountCents,
              paidAt: input.paidAt,
              note: input.note,
              idempotencyKey,
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

          return buildRecordPaymentResult(tx, order, payment, orderTotalCents);
        } catch (error) {
          if (!idempotencyKey || !isUniqueViolation(error)) {
            throw error;
          }

          const [existing] = await tx
            .select()
            .from(payments)
            .where(eq(payments.idempotencyKey, idempotencyKey));

          if (!existing) {
            throw error;
          }

          assertIdempotentReplay(existing, orderId, input);
          return buildRecordPaymentResult(tx, order, existing, orderTotalCents);
        }
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
        payments: rows.map(toPaymentRecord),
      };
    },
  };
}

export type PaymentService = ReturnType<typeof createPaymentService>;
