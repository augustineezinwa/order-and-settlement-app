import { z } from "zod";

import { ORDER_STATUSES } from "../types/orders.js";

export const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1),
  dueDate: z.string().date(),
  lineItems: z.array(lineItemSchema).min(1),
});

export const updateOrderSchema = createOrderSchema;

export const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
