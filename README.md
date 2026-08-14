# Orders & Settlements

Order tracking and payment ledger for a small business operator. Create orders with line items, record payments, and see derived status (`pending`, `partially_paid`, `paid`, `overdue`).

**Stack:** Next.js 16 (App Router) + Hono API + Supabase Postgres + Supabase Auth + Drizzle ORM.

## Deployed URL

<!-- Replace after Render deploy -->
`https://order-settlement.onrender.com` _(update with your live Render service URL)_

## Architecture (production)

Single Docker container on Render:

- **Next.js** listens on the public `PORT` (serves the dashboard)
- **Hono API** runs internally on port `8787`
- Browser calls `/api/*`; Next.js rewrites to the in-container API (`BACKEND_URL=http://127.0.0.1:8787`)
- Migrations run on container startup via Drizzle

Local development uses two processes (backend `:8787`, frontend `:3000`), same as before.

## Prerequisites

- Node.js 22+ ([`.nvmrc`](.nvmrc))
- A Supabase project with Postgres and email/password auth enabled
- Env vars listed in [`backend/.env.example`](backend/.env.example)

## Local development

1. Clone the repo and install dependencies:

```bash
npm install
cd backend && npm install && cd ..
```

2. Copy env template and fill in Supabase credentials:

```bash
cp backend/.env.example backend/.env
```

3. Run migrations:

```bash
cd backend && npm run db:migrate
```

4. Start both servers (two terminals):

```bash
# Terminal 1 — API on :8787
cd backend && npm run dev

# Terminal 2 — Next.js on :3000
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000), sign up, and use the dashboard.

## Docker (prod-like local)

Requires `backend/.env` with valid Supabase credentials:

```bash
docker compose up --build
```

- App: [http://localhost:3000](http://localhost:3000)
- Health: [http://localhost:3000/api/health](http://localhost:3000/api/health) → `{"status":"ok"}`

## Deploy to Render

1. Push this repo to GitHub.
2. Create a **Web Service** from the Render dashboard (or use [`render.yaml`](render.yaml)).
3. Runtime: **Docker**; Dockerfile at repo root.
4. Set environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase Postgres pooler URI (port 6543) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key (sign-in) |
| `SUPABASE_SECRET_KEY` | Secret key (sign-up admin) |
| `CORS_ORIGIN` | Your Render app URL (e.g. `https://order-settlement.onrender.com`) |
| `NODE_ENV` | `production` |

5. Deploy. On each start, the container runs migrations then starts API + Next.js.
6. Update the **Deployed URL** section above with your live URL.

## API overview

All routes require `Authorization: Bearer <accessToken>` except auth endpoints.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/sign-up` | Create account (email + password) |
| `POST` | `/auth/sign-in` | Sign in |
| `GET` | `/health` | Health check |
| `POST` | `/orders` | Create order (customer, due date, line items) |
| `GET` | `/orders` | List orders (`?status=` optional) |
| `GET` | `/orders/:id` | Order detail + payments |
| `PATCH` | `/orders/:id` | Update order (blocked after first payment) |
| `DELETE` | `/orders/:id` | Delete order (only if no payments) |
| `POST` | `/orders/:id/payments` | Record payment (`Idempotency-Key` header) |
| `GET` | `/orders/:id/payments` | Payment history |

**Error shape** (all routes):

```json
{ "error": { "message": "...", "code": "OPTIONAL", "details": {} } }
```

Common codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `OVERPAYMENT`, `ORDER_NOT_FOUND`, `IDEMPOTENCY_KEY_REUSED`.

## Status derivation

Status is derived at read time from line items and payment history:

| Status | Rule |
|--------|------|
| `paid` | Amount paid ≥ order total |
| `overdue` | Due date &lt; today **and** not fully paid |
| `partially_paid` | Some payment recorded, not fully paid, not overdue |
| `pending` | No payments, not overdue |

**Edge case:** An order past its due date that receives a final payment becomes `paid`, not `overdue`.

## Business rules

- Order total = Σ(quantity × unit price). Amounts stored in **cents**. No tax or discount.
- Orders become **read-only** after the first payment is recorded.
- Orders can be **deleted** only when they have zero payments.
- Over-payment is rejected with `OVERPAYMENT` and `details.maxAllowedCents`.
- Payment POST accepts an `Idempotency-Key` header (UUID) for double-click / retry safety.

## Payment concurrency

Recording a payment runs in a single database transaction. The order row is locked with `SELECT ... FOR UPDATE` before checking the amount due and inserting the payment.

If two payments are submitted at the same time, the second transaction blocks until the first commits, then re-checks the remaining balance. That prevents double-spending on the server without extra application-level locks.

Replaying the same `Idempotency-Key` with the same payload returns the original payment instead of creating a duplicate. Reusing a key with a different order or payload returns `409 IDEMPOTENCY_KEY_REUSED`.

## Assumptions and tradeoffs

- **Single-container deploy** — Next.js and Hono share one Render service; simpler URL, both processes restart together.
- **Session in localStorage** — not httpOnly cookies; acceptable for a take-home demo.
- **Derived status** — not stored as a separate audit trail (stretch goal).
- **Supabase** — managed Postgres + Auth; no self-hosted DB.
- **No tax, discounts, or multi-currency.**

## Testing

```bash
# Backend integration tests
cd backend && npm test

# Payment flow script (API must be running on :8787)
node scripts/test-record-payment.mjs

# Frontend production build
npm run build

# Docker prod-like smoke test
docker compose up --build
```

## Project layout

```text
backend/          Hono API, Drizzle schema/migrations, integration tests
src/              Next.js App Router dashboard
shared/api/       End-to-end types and Zod schemas
Dockerfile        Single-container production image
docker-entrypoint.sh
```

See [`AGENTS.md`](AGENTS.md) for coding conventions.
