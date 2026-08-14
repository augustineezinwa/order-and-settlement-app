#!/usr/bin/env node

const API = process.env.API_URL ?? "http://localhost:8787";

async function request(path, { method = "GET", token, body, headers = {} } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  return { status: res.status, json };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const email = `paytest-${Date.now()}@example.com`;
const password = "testpass123";

console.log("1. Sign up");
const signUp = await request("/auth/sign-up", {
  method: "POST",
  body: { email, password },
});
assert(signUp.status === 201 || signUp.status === 200, `Sign up failed: ${signUp.status}`);
const token = signUp.json.accessToken;
assert(token, "Missing access token");

console.log("2. Create order ($100 due)");
const orderRes = await request("/orders", {
  method: "POST",
  token,
  body: {
    customerName: "Record Payment Test",
    dueDate: "2026-12-31",
    lineItems: [{ description: "Consulting", quantity: 1, unitPriceCents: 10000 }],
  },
});
assert(orderRes.status === 201 || orderRes.status === 200, `Create order failed: ${orderRes.status}`);
const orderId = orderRes.json.id;
assert(orderRes.json.amountDueCents === 10000, "Expected $100 due");

console.log("3. Partial payment $40");
const partial = await request(`/orders/${orderId}/payments`, {
  method: "POST",
  token,
  headers: { "Idempotency-Key": crypto.randomUUID() },
  body: { amountCents: 4000, paidAt: "2026-08-14", note: "Partial" },
});
assert(partial.status === 201 || partial.status === 200, `Partial payment failed: ${partial.status}`);
assert(partial.json.order.amountDueCents === 6000, "Expected $60 remaining");

console.log("4. Overpayment $70 (expect 400 OVERPAYMENT)");
const over = await request(`/orders/${orderId}/payments`, {
  method: "POST",
  token,
  headers: { "Idempotency-Key": crypto.randomUUID() },
  body: { amountCents: 7000, paidAt: "2026-08-14" },
});
assert(over.status === 400, `Expected 400, got ${over.status}`);
assert(over.json.error?.code === "OVERPAYMENT", "Expected OVERPAYMENT code");
assert(over.json.error?.details?.maxAllowedCents === 6000, "Expected maxAllowedCents 6000");

console.log("5. Pay remaining $60");
const finalPay = await request(`/orders/${orderId}/payments`, {
  method: "POST",
  token,
  headers: { "Idempotency-Key": crypto.randomUUID() },
  body: { amountCents: 6000, paidAt: "2026-08-14" },
});
assert(finalPay.status === 201 || finalPay.status === 200, `Final payment failed: ${finalPay.status}`);
assert(finalPay.json.order.status === "paid", "Expected paid status");
assert(finalPay.json.order.amountDueCents === 0, "Expected zero due");

console.log("6. Verify order detail");
const detail = await request(`/orders/${orderId}`, { token });
assert(detail.json.payments.length === 2, "Expected 2 payments");
assert(detail.json.amountDueCents === 0, "Expected zero due on detail");

console.log("\nAll record-payment API checks passed.");
