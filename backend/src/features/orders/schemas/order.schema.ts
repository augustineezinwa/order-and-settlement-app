import { z } from "zod";

import { orderStatus } from "../../../lib/db/schema/orders.js";

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
  status: z.enum(orderStatus.enumValues).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
