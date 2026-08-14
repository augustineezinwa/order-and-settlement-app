# TODO — Orders and Settlements

Source: `orders-and-settlements.pdf` take-home assignment.
Structure follows [AGENTS.md](./AGENTS.md): feature-based routes/controllers/middlewares/services, `lib/db` singleton, per-feature integration tests.

## Setup

- [x] Scaffold `backend/` (Hono) and confirm Next.js App Router `frontend/` (or app) skeleton
- [x] Add `lib/db` singleton (Supabase Postgres client)
- [x] Set up Drizzle config + first migration
- [x] Add settings module (t3-env) — fail fast on missing config
- [x] Add `backend/global/middlewares/` for reusable middleware (auth check, error handler, request logging)

## Feature: Auth

- [x] Supabase Auth (email + password) sign up route/controller/service
- [x] Log in route/controller/service
- [x] Auth middleware — attach `userId` to request context
- [x] Ensure all downstream queries scope by authenticated `userId`
- [x] Integration tests: sign up, log in, reject unauthenticated access

## Feature: Orders

- [x] `POST /orders` — create order (customer, due date, line items)
- [x] `GET /orders` — list orders (with status filter)
- [x] `GET /orders/:id` — order detail (line items + payment history)
- [x] `PATCH /orders/:id` — update order (read-only after first payment; delete only when no payments exist — documented in README)
- [x] `DELETE /orders/:id`
- [x] Service: compute subtotal = Σ(quantity × unit price)
- [x] Service: order total = subtotal (no tax/discount)
- [x] Service: derive status — `pending` / `partially_paid` / `paid` / `overdue` (derived at read time)
- [x] Feature middleware (`features/orders/middlewares/`) — validate order ownership on `:id` routes
- [x] Integration tests: create order totals math, status derivation incl. overdue-then-paid edge case

## Feature: Payments

- [x] `POST /orders/:id/payments` — record payment (amount ≥ 0.01, date, optional note)
- [x] Service: reject over-payment — error includes max allowed amount (`maxAllowedCents`)
- [x] Service: recompute order status after payment (transactional write, row-locked for concurrency)
- [x] `GET /orders/:id/payments` — payment history
- [x] `Idempotency-Key` header support on payment POST (double-click/retry safe)
- [x] Integration tests: partial payment, full payment, over-payment rejection, concurrent payment row-lock
- [x] Document concurrency approach (two simultaneous payments) in README

## Dashboard (Frontend)

- [x] Orders list view — customer, status, order total, amount paid, amount due, due date
- [x] Status filter control
- [x] Order detail page — line items + full payment history (with running balance)
- [x] Dashboard overview — portfolio summary strip + status-mix and amounts-due charts
- [x] Sign up / sign in pages, wired to `POST /auth/sign-up` and `POST /auth/sign-in` (session in localStorage, nav shows email + sign out)
- [x] Wire dashboard/detail to live API (currently demo data — see `src/lib/orders/demo-orders.ts`)
- [x] Create order form (dynamic line items)
- [x] Record payment form with validation error display (button is present but disabled until wired)

## API polish

- [ ] Consistent error response shape across all routes
- [ ] Validation errors include actionable/resolution hints
- [ ] No single entry-point file for routes — mount per-feature routers

## Stretch goals (optional)

- [ ] Refunds (negative payment or separate entity)
- [ ] Audit log of status changes with timestamps
- [ ] CSV export of orders for a date range

## Deployment & docs

- [ ] Deploy to Render (Docker) — get live URL
- [ ] README: prerequisites + setup steps
- [ ] README: API overview (main endpoints)
- [ ] README: status derivation rules + edge-case decisions
- [ ] README: assumptions/tradeoffs, what to improve before production
- [ ] README: include deployed URL
- [ ] Optional: short Loom walkthrough
