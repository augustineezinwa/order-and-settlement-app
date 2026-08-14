import { describe, expect, it } from "vitest";

import type { OrderSummary } from "@shared/api/types/orders.js";
import { serializeOrdersCsv } from "./orderCsv.service.js";

describe("serializeOrdersCsv", () => {
  it("escapes customer names and formats amounts", () => {
    const orders: OrderSummary[] = [
      {
        id: "order-1",
        customerName: 'Acme, "LLC"',
        dueDate: "2026-08-15",
        status: "partially_paid",
        orderTotalCents: 2500,
        amountPaidCents: 1000,
        amountDueCents: 1500,
      },
    ];

    expect(serializeOrdersCsv(orders)).toBe(
      [
        "id,customer_name,due_date,status,order_total,amount_paid,amount_due",
        'order-1,"Acme, ""LLC""",2026-08-15,partially_paid,25.00,10.00,15.00',
      ].join("\n"),
    );
  });
});
