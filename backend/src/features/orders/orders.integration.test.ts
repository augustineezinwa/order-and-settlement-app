import { migrate } from "drizzle-orm/postgres-js/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";
import { HttpError } from "../../global/errors.js";
import { db, sql } from "../../lib/db/index.js";
import { payments } from "../../lib/db/schema/payments.js";
import type { AuthService } from "../auth/services/auth.service.js";
import { deriveDisplayStatus } from "./services/orderStatus.service.js";
import { computeSubtotal } from "./services/orderTotals.service.js";
import { createOrderService, type OrderSummary } from "./services/order.service.js";

const mockUserA = { id: "00000000-0000-0000-0000-000000000001", email: "a@example.com" };
const mockUserB = { id: "00000000-0000-0000-0000-000000000002", email: "b@example.com" };

function daysFromToday(offset: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function createMockAuthService(): AuthService {
  return {
    signUp: async () => ({ accessToken: "token", user: mockUserA }),
    signIn: async () => ({ accessToken: "token", user: mockUserA }),
    getUserFromToken: async (token: string) => {
      if (token === "token-user-a") {
        return mockUserA;
      }
      if (token === "token-user-b") {
        return mockUserB;
      }
      throw new HttpError(401, "Invalid or expired token", "UNAUTHORIZED");
    },
  };
}

const headersFor = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const sampleLineItems = [
  { description: "Widget", quantity: 2, unitPriceCents: 1000 },
  { description: "Gadget", quantity: 1, unitPriceCents: 500 },
];

const dbReady = await (async () => {
  try {
    await sql`select 1`;
    await migrate(db, { migrationsFolder: "./drizzle" });
    return true;
  } catch {
    return false;
  }
})();

describe("order math and status helpers", () => {
  it("computes subtotal", () => {
    expect(computeSubtotal(sampleLineItems)).toBe(2500);
  });

  it("derives overdue then paid", () => {
    const pastDue = daysFromToday(-1);
    expect(
      deriveDisplayStatus({ dueDate: pastDue, totalCents: 100_000, paidCents: 40_000 }),
    ).toBe("overdue");
    expect(
      deriveDisplayStatus({ dueDate: pastDue, totalCents: 100_000, paidCents: 100_000 }),
    ).toBe("paid");
  });
});

describe.skipIf(!dbReady)("orders integration", () => {
  const orderService = createOrderService(db);

  async function resetOrders() {
    await sql`truncate table order_status_history, payment_audit_log, payments, order_items, orders cascade`;
  }

  beforeEach(async () => {
    await resetOrders();
  });

  it("creates an order with correct totals", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const res = await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Acme",
        dueDate: daysFromToday(30),
        lineItems: sampleLineItems,
      }),
    });

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({
      customerName: "Acme",
      orderTotalCents: 2500,
      amountPaidCents: 0,
      amountDueCents: 2500,
      status: "pending",
    });
  });

  it("lists orders scoped by userId", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });

    await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Acme",
        dueDate: daysFromToday(10),
        lineItems: sampleLineItems,
      }),
    });

    const res = await app.request("/orders", { headers: headersFor("token-user-b") });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ orders: [] });
  });

  it("derives overdue then paid on order detail", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const createRes = await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Acme",
        dueDate: daysFromToday(-1),
        lineItems: [{ description: "Service", quantity: 1, unitPriceCents: 100_000 }],
      }),
    });
    const created = (await createRes.json()) as OrderSummary;

    await db.insert(payments).values({
      orderId: created.id,
      recordedBy: mockUserA.id,
      amountCents: 40_000,
      paidAt: daysFromToday(0),
    });

    const overdueRes = await app.request(`/orders/${created.id}`, {
      headers: headersFor("token-user-a"),
    });
    expect(overdueRes.status).toBe(200);
    await expect(overdueRes.json()).resolves.toMatchObject({
      status: "overdue",
      amountPaidCents: 40_000,
      amountDueCents: 60_000,
    });

    await db.insert(payments).values({
      orderId: created.id,
      recordedBy: mockUserA.id,
      amountCents: 60_000,
      paidAt: daysFromToday(0),
    });

    const paidRes = await app.request(`/orders/${created.id}`, {
      headers: headersFor("token-user-a"),
    });
    expect(paidRes.status).toBe(200);
    await expect(paidRes.json()).resolves.toMatchObject({
      status: "paid",
      amountPaidCents: 100_000,
      amountDueCents: 0,
    });
  });

  it("rejects PATCH after a payment exists", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const createRes = await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Acme",
        dueDate: daysFromToday(10),
        lineItems: sampleLineItems,
      }),
    });
    const created = (await createRes.json()) as OrderSummary;

    await db.insert(payments).values({
      orderId: created.id,
      recordedBy: mockUserA.id,
      amountCents: 100,
      paidAt: daysFromToday(0),
    });

    const patchRes = await app.request(`/orders/${created.id}`, {
      method: "PATCH",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Updated",
        dueDate: daysFromToday(20),
        lineItems: sampleLineItems,
      }),
    });

    expect(patchRes.status).toBe(409);
    await expect(patchRes.json()).resolves.toEqual({
      error: { message: "Order cannot be edited after a payment has been recorded", code: "ORDER_NOT_EDITABLE" },
    });
  });

  it("allows DELETE with no payments and rejects after payment", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const createRes = await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Acme",
        dueDate: daysFromToday(10),
        lineItems: sampleLineItems,
      }),
    });
    const created = (await createRes.json()) as OrderSummary;

    const deleteOk = await app.request(`/orders/${created.id}`, {
      method: "DELETE",
      headers: headersFor("token-user-a"),
    });
    expect(deleteOk.status).toBe(204);

    const recreateRes = await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Acme",
        dueDate: daysFromToday(10),
        lineItems: sampleLineItems,
      }),
    });
    const recreated = (await recreateRes.json()) as OrderSummary;

    await db.insert(payments).values({
      orderId: recreated.id,
      recordedBy: mockUserA.id,
      amountCents: 100,
      paidAt: daysFromToday(0),
    });

    const deleteBlocked = await app.request(`/orders/${recreated.id}`, {
      method: "DELETE",
      headers: headersFor("token-user-a"),
    });
    expect(deleteBlocked.status).toBe(409);
  });

  it("rejects unauthenticated access", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const res = await app.request("/orders");
    expect(res.status).toBe(401);
  });

  it("returns actionable validation errors for export query", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const res = await app.request("/orders/export", { headers: headersFor("token-user-a") });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR" },
    });
  });

  it("exports orders filtered by due date range", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const inRangeDue = daysFromToday(10);
    const outOfRangeDue = daysFromToday(40);

    await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "In range",
        dueDate: inRangeDue,
        lineItems: sampleLineItems,
      }),
    });

    await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Out of range",
        dueDate: outOfRangeDue,
        lineItems: sampleLineItems,
      }),
    });

    const from = daysFromToday(0);
    const to = daysFromToday(20);
    const res = await app.request(`/orders/export?from=${from}&to=${to}`, {
      headers: headersFor("token-user-a"),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const csv = await res.text();
    expect(csv).toContain("In range");
    expect(csv).not.toContain("Out of range");
  });

  it("records status history on create and partial payment", async () => {
    const app = createApp({ authService: createMockAuthService(), orderService });
    const createRes = await app.request("/orders", {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({
        customerName: "Acme",
        dueDate: daysFromToday(10),
        lineItems: sampleLineItems,
      }),
    });
    const created = (await createRes.json()) as OrderSummary;

    const initialHistory = await app.request(`/orders/${created.id}/status-history`, {
      headers: headersFor("token-user-a"),
    });
    expect(initialHistory.status).toBe(200);
    await expect(initialHistory.json()).resolves.toEqual({
      history: [
        expect.objectContaining({
          fromStatus: null,
          toStatus: "pending",
        }),
      ],
    });

    const payRes = await app.request(`/orders/${created.id}/payments`, {
      method: "POST",
      headers: { ...headersFor("token-user-a"), "Idempotency-Key": "test-key-1" },
      body: JSON.stringify({ amountCents: 100, paidAt: daysFromToday(0) }),
    });
    expect(payRes.status).toBe(201);

    const historyRes = await app.request(`/orders/${created.id}/status-history`, {
      headers: headersFor("token-user-a"),
    });
    expect(historyRes.status).toBe(200);
    const body = (await historyRes.json()) as { history: Array<{ fromStatus: string | null; toStatus: string }> };
    expect(body.history).toHaveLength(2);
    expect(body.history[1]).toMatchObject({
      fromStatus: "pending",
      toStatus: "partially_paid",
    });
  });
});
