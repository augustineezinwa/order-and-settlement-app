import { z } from "zod";

import { ORDER_STATUSES } from "../types/orders";

export const lineItemSchema = z.object({
  description: z.string().min(1, "Enter a description for this line item."),
  quantity: z.number().int().positive("Quantity must be at least 1."),
  unitPriceCents: z.number().int().nonnegative("Unit price cannot be negative."),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Enter the customer name."),
  dueDate: z.string().date("Use a valid due date (YYYY-MM-DD)."),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item."),
});

export const updateOrderSchema = createOrderSchema;

export const listOrdersQuerySchema = z.object({
  status: z
    .enum(ORDER_STATUSES, {
      error: "Status must be one of: pending, partially_paid, paid, or overdue.",
    })
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
