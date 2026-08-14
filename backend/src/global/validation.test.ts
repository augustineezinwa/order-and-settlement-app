import { describe, expect, it } from "vitest";

import { formatZodError } from "@shared/api/validation.js";
import { authCredentialsSchema } from "@shared/api/schemas/auth.schema.js";
import { createOrderSchema } from "@shared/api/schemas/order.schema.js";

describe("formatZodError", () => {
  it("groups issues by dotted field path", () => {
    const parsed = createOrderSchema.safeParse({
      customerName: "",
      dueDate: "not-a-date",
      lineItems: [],
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const formatted = formatZodError(parsed.error);
    expect(formatted.message).toBe("Enter the customer name.");
    expect(formatted.fieldErrors.customerName).toEqual(["Enter the customer name."]);
    expect(formatted.fieldErrors.dueDate).toEqual(["Use a valid due date (YYYY-MM-DD)."]);
    expect(formatted.fieldErrors.lineItems).toEqual(["Add at least one line item."]);
  });

  it("uses actionable auth messages", () => {
    const parsed = authCredentialsSchema.safeParse({ email: "bad", password: "short" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const formatted = formatZodError(parsed.error);
    expect(formatted.fieldErrors.email).toEqual(["Enter a valid email address."]);
    expect(formatted.fieldErrors.password).toEqual(["Password must be at least 8 characters."]);
  });
});
