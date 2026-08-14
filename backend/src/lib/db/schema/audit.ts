import { bigint, date, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { orderStatus } from "./orders.js";

export const auditAction = pgEnum("audit_action", ["insert", "update", "delete"]);

// Populated by the payments_audit trigger. IDs are plain uuids (no FK) so history
// survives payment/order deletion. Columns snapshot the row as of the action.
export const paymentAuditLog = pgTable(
  "payment_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id").notNull(),
    orderId: uuid("order_id").notNull(),
    action: auditAction("action").notNull(),
    actorId: uuid("actor_id").notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    paidAt: date("paid_at").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("payment_audit_log_payment_id_idx").on(t.paymentId),
    index("payment_audit_log_order_id_idx").on(t.orderId),
  ],
);

// Populated by the orders_status_audit trigger on every written status transition.
// `overdue` is read-derived and never written, so it does not appear here.
export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull(),
    fromStatus: orderStatus("from_status"),
    toStatus: orderStatus("to_status").notNull(),
    actorId: uuid("actor_id").notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_status_history_order_id_idx").on(t.orderId)],
);
