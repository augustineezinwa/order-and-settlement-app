# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) frontend, Hono TypeScript API in `backend/`, Supabase Postgres with Drizzle ORM, Supabase Auth (email/password), Docker deployment target on Render. Stack is locked per `AGENTS.md`.

## Users

Small business team where one operator manages customer orders and records payments against them. They need a clear view of what is owed, what has been paid, and which orders are overdue.

## Product Purpose

Orders & Settlements lets that operator create orders with line items, track payment progress, and see derived order status (`pending`, `partially_paid`, `paid`, `overdue`). Success for the current phase is a complete take-home deliverable: working API, dashboard UI covering the assignment spec, deployed and documented for reviewers.

## Positioning

Order totals and status are derived from line items and payment history—not manually edited—so the ledger stays consistent even when payments arrive out of order or concurrently. Over-payment is blocked server-side; duplicate submits are safe via idempotency keys.

## Operating Context

Operators work in a browser dashboard against a REST API. Backend is feature-complete (auth, orders CRUD, payment recording with row-lock concurrency). Frontend is not yet built beyond the Next.js starter template. Reviewers evaluate against the `orders-and-settlements` take-home specification.

## Capabilities and Constraints

**Shipped (backend):**

- Email/password sign-up and sign-in; all order and payment routes scoped to authenticated user
- Create, list, get, update, and delete orders with dynamic line items
- Order total = sum of (quantity × unit price); no tax or discount
- Status derived at read time; `overdue` when past due date and not fully paid
- Orders become read-only after first payment; delete only when no payments exist
- Record and list payments; reject over-payment with `maxAllowedCents` in error details
- `Idempotency-Key` header on payment POST for double-click and retry safety

**Planned (frontend, per assignment):**

- Orders list with status filter
- Order detail with line items and payment history
- Create order form with dynamic line items
- Record payment form with validation error display

**Optional stretch (not committed):** refunds, audit log UI, CSV export.

**Terminology:** amounts stored in cents; dates as ISO date strings (`YYYY-MM-DD`).

## Brand Commitments

Product name: **Orders & Settlements**. No custom logo, voice guide, or marketing site yet—UI should use the name descriptively and professionally for a business tool.

## Evidence on Hand

- Backend integration tests covering auth, orders, and payments (including concurrency and idempotency)
- README documents payment concurrency and idempotency behavior
- No customer testimonials, case studies, or production deployment URL yet—do not fabricate social proof or live URLs

## Product Principles

1. **Ledger integrity first** — totals and status come from data, not user guesswork.
2. **Operator clarity** — a busy person scanning a list should instantly see status, amount due, and due date.
3. **Safe money moves** — block over-payment; make duplicate submits idempotent; serialize concurrent payments.
4. **Honest scope** — ship the assignment completely before optional stretch goals.
5. **Review-ready** — setup, API behavior, and tradeoffs must be documentable for evaluators.

## Accessibility & Inclusion

No product-specific accessibility standard confirmed yet. Default to WCAG-minded patterns (semantic HTML, keyboard access, visible focus, readable contrast) for the dashboard build.
