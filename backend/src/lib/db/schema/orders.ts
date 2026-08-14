import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// `overdue` is applied at read time (due date passed while not fully paid); the stored
// value is otherwise derived from payments on each write.
export const orderStatus = pgEnum("order_status", [
  "pending",
  "partially_paid",
  "paid",
  "overdue",
]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Supabase Auth user; all queries scope by this. No cross-schema FK to auth.users on purpose.
  userId: uuid("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  dueDate: date("due_date").notNull(),
  status: orderStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: bigint("unit_price_cents", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
    check("order_items_unit_price_nonneg", sql`${t.unitPriceCents} >= 0`),
  ],
);
