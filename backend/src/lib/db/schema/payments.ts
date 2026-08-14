import { sql } from "drizzle-orm";
import { bigint, check, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { orders } from "./orders.js";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // Minimum recordable payment is $0.01, i.e. 1 cent.
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    paidAt: date("paid_at").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("payments_amount_min", sql`${t.amountCents} >= 1`)],
);
