import { migrate } from "drizzle-orm/postgres-js/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";
import { HttpError } from "../../global/errors.js";
import { SESSION_COOKIE } from "../../global/sessionCookie.js";
import { db, sql } from "../../lib/db/index.js";
import type { AuthService } from "../auth/services/auth.service.js";
import { createOrderService, type OrderSummary } from "../orders/services/order.service.js";
import { createPaymentService } from "./services/payment.service.js";

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
    signOut: async () => {},
  };
}

const headersFor = (token: string, extra: Record<string, string> = {}) => ({
  Cookie: `${SESSION_COOKIE}=${token}`,
  "Content-Type": "application/json",
  ...extra,
});

const dbReady = await (async () => {
  try {
    await sql`select 1`;
    await migrate(db, { migrationsFolder: "./drizzle" });
    return true;
  } catch {
    return false;
  }
})();

async function createTestOrder(app: ReturnType<typeof createApp>): Promise<OrderSummary> {
  const res = await app.request("/orders", {
    method: "POST",
    headers: headersFor("token-user-a"),
    body: JSON.stringify({
      customerName: "Acme",
      dueDate: daysFromToday(30),
      lineItems: [{ description: "Service", quantity: 1, unitPriceCents: 100_000 }],
    }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as OrderSummary;
}

describe.skipIf(!dbReady)("payments integration", () => {
  const orderService = createOrderService(db);
  const paymentService = createPaymentService(db);

  async function resetData() {
    await sql`truncate table payments, order_items, orders cascade`;
  }

  beforeEach(async () => {
    await resetData();
  });

  it("records partial then full payment and rejects over-payment", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);

    const partialRes = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({ amountCents: 40_000, paidAt: daysFromToday(0) }),
    });
    expect(partialRes.status).toBe(201);
    await expect(partialRes.json()).resolves.toMatchObject({
      payment: { amountCents: 40_000 },
      order: {
        status: "partially_paid",
        orderTotalCents: 100_000,
        amountPaidCents: 40_000,
        amountDueCents: 60_000,
      },
    });

    const fullRes = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({ amountCents: 60_000, paidAt: daysFromToday(0) }),
    });
    expect(fullRes.status).toBe(201);
    await expect(fullRes.json()).resolves.toMatchObject({
      order: {
        status: "paid",
        amountPaidCents: 100_000,
        amountDueCents: 0,
      },
    });

    const overpayRes = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({ amountCents: 1, paidAt: daysFromToday(0) }),
    });
    expect(overpayRes.status).toBe(400);
    await expect(overpayRes.json()).resolves.toEqual({
      error: {
        message: "Payment exceeds amount due. Maximum allowed: 0 cents",
        code: "OVERPAYMENT",
        details: { maxAllowedCents: 0 },
      },
    });
  });

  it("returns payment history", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);

    await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({ amountCents: 40_000, paidAt: daysFromToday(-1) }),
    });
    await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: headersFor("token-user-a"),
      body: JSON.stringify({ amountCents: 60_000, paidAt: daysFromToday(0), note: "final" }),
    });

    const historyRes = await app.request(`/orders/${order.id}/payments`, {
      headers: headersFor("token-user-a"),
    });
    expect(historyRes.status).toBe(200);
    const history = (await historyRes.json()) as { payments: Array<{ amountCents: number; note?: string | null }> };
    expect(history.payments).toHaveLength(2);
    expect(history.payments[0].amountCents).toBe(40_000);
    expect(history.payments[1]).toMatchObject({ amountCents: 60_000, note: "final" });
  });

  it("rejects unauthenticated payment requests", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);

    const res = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCents: 100, paidAt: daysFromToday(0) }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects payment from non-owner", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);

    const res = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: headersFor("token-user-b"),
      body: JSON.stringify({ amountCents: 100, paidAt: daysFromToday(0) }),
    });
    expect(res.status).toBe(404);
  });

  it("serializes concurrent payments via row lock — one succeeds, one overpays", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);

    const payBody = JSON.stringify({ amountCents: 60_000, paidAt: daysFromToday(0) });
    const pay = () =>
      app.request(`/orders/${order.id}/payments`, {
        method: "POST",
        headers: headersFor("token-user-a"),
        body: payBody,
      });

    const [first, second] = await Promise.all([pay(), pay()]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 400]);

    const success = first.status === 201 ? first : second;
    const rejected = first.status === 400 ? first : second;

    await expect(success.json()).resolves.toMatchObject({
      payment: { amountCents: 60_000 },
      order: {
        orderTotalCents: 100_000,
        amountPaidCents: 60_000,
        amountDueCents: 40_000,
        status: "partially_paid",
      },
    });

    await expect(rejected.json()).resolves.toEqual({
      error: {
        message: "Payment exceeds amount due. Maximum allowed: 40000 cents",
        code: "OVERPAYMENT",
        details: { maxAllowedCents: 40_000 },
      },
    });

    const historyRes = await app.request(`/orders/${order.id}/payments`, {
      headers: headersFor("token-user-a"),
    });
    const history = (await historyRes.json()) as { payments: unknown[] };
    expect(history.payments).toHaveLength(1);
  });

  it("replays duplicate submit when the same Idempotency-Key is sent twice", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);
    const payBody = JSON.stringify({ amountCents: 40_000, paidAt: daysFromToday(0), note: "deposit" });
    const payHeaders = headersFor("token-user-a", { "Idempotency-Key": "pay-deposit-1" });

    const firstRes = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: payHeaders,
      body: payBody,
    });
    const secondRes = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: payHeaders,
      body: payBody,
    });

    expect(firstRes.status).toBe(201);
    expect(secondRes.status).toBe(201);

    const first = (await firstRes.json()) as { payment: { id: string } };
    const second = (await secondRes.json()) as { payment: { id: string } };
    expect(second.payment.id).toBe(first.payment.id);

    const historyRes = await app.request(`/orders/${order.id}/payments`, {
      headers: headersFor("token-user-a"),
    });
    const history = (await historyRes.json()) as { payments: unknown[] };
    expect(history.payments).toHaveLength(1);
  });

  it("replays concurrent duplicate submits that share an Idempotency-Key", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);
    const payBody = JSON.stringify({ amountCents: 60_000, paidAt: daysFromToday(0) });
    const payHeaders = headersFor("token-user-a", { "Idempotency-Key": "pay-concurrent-1" });
    const pay = () =>
      app.request(`/orders/${order.id}/payments`, {
        method: "POST",
        headers: payHeaders,
        body: payBody,
      });

    const [first, second] = await Promise.all([pay(), pay()]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const firstBody = (await first.json()) as { payment: { id: string } };
    const secondBody = (await second.json()) as { payment: { id: string } };
    expect(secondBody.payment.id).toBe(firstBody.payment.id);

    const historyRes = await app.request(`/orders/${order.id}/payments`, {
      headers: headersFor("token-user-a"),
    });
    const history = (await historyRes.json()) as { payments: unknown[] };
    expect(history.payments).toHaveLength(1);
  });

  it("rejects reusing an Idempotency-Key with a different payment payload", async () => {
    const app = createApp({
      authService: createMockAuthService(),
      orderService,
      paymentService,
    });
    const order = await createTestOrder(app);
    const payHeaders = headersFor("token-user-a", { "Idempotency-Key": "pay-conflict-1" });

    const firstRes = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: payHeaders,
      body: JSON.stringify({ amountCents: 40_000, paidAt: daysFromToday(0) }),
    });
    expect(firstRes.status).toBe(201);

    const secondRes = await app.request(`/orders/${order.id}/payments`, {
      method: "POST",
      headers: payHeaders,
      body: JSON.stringify({ amountCents: 50_000, paidAt: daysFromToday(0) }),
    });
    expect(secondRes.status).toBe(409);
    await expect(secondRes.json()).resolves.toEqual({
      error: {
        message: "Idempotency-Key already used with a different payment payload",
        code: "IDEMPOTENCY_KEY_REUSED",
      },
    });
  });
});
