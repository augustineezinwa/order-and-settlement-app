# Architecture

Orders & Settlements is a full-stack order ledger: operators create orders with line items, record payments, and see derived settlement status. This document describes how the pieces fit together in local development and production.

## Stack

| Layer | Technology | Role |
| ----- | ---------- | ---- |
| Frontend | Next.js 16 (App Router), React, TanStack Query | Dashboard, auth UI, client-side session |
| API | Hono (TypeScript) | REST endpoints, auth middleware, business logic |
| Database | Supabase Postgres | Orders, line items, payments, audit tables |
| Auth | Supabase Auth (email + password) | Sign-up / sign-in; JWT validated on API |
| ORM / migrations | Drizzle | Schema, queries, migrations on startup (prod) |
| Shared contracts | `shared/api/` (Zod + types) | Request validation and API shapes used by both tiers |
| Hosting | Render (Docker) | Single container: Next.js + Hono + migrate |

## System context

```mermaid
flowchart TB
  subgraph users [Users]
    browser([Browser])
  end

  subgraph render [Render — Docker container]
    direction TB
    next[["Next.js<br/>App Router + React Query"]]
    hono{{"Hono API<br/>feature routes"}}
    next -->|"rewrite /api/*"| hono
  end

  subgraph supabase [Supabase]
    auth([("Supabase Auth")])
    db[(("Postgres<br/>orders · payments · audit"))]
  end

  browser -->|"HTTPS · pages + /api/*"| next
  hono -->|"SQL via Drizzle"| db
  hono -->|"sign-up / sign-in / token verify"| auth
```

The browser never talks to Hono or Supabase directly in production. All API calls — including sign-up and sign-in — go to `/api/...` on the same origin; Next.js rewrites those requests to the in-container Hono process, which is the only thing that talks to Supabase.

## Production runtime

One Docker image runs three startup steps in [`docker-entrypoint.sh`](docker-entrypoint.sh):

1. **Migrate** — `npm run db:migrate` (Drizzle)
2. **API** — Hono on internal port `8787` (`tsx` + `NODE_PATH` for shared schemas)
3. **Web** — Next.js standalone on Render’s public `PORT`

```mermaid
sequenceDiagram
  participant R as Render load balancer
  participant N as Next.js :PORT
  participant H as Hono :8787
  participant D as Postgres

  Note over R,D: Container startup
  H->>D: drizzle migrate
  H-->>H: listen 8787

  Note over R,D: Request flow
  R->>N: GET /dashboard
  N-->>R: HTML + JS

  R->>N: GET /api/orders
  N->>H: rewrite → /orders
  H->>D: SELECT …
  D-->>H: rows
  H-->>N: JSON
  N-->>R: JSON
```

| Process | Port | Visibility |
| ------- | ---- | ------------ |
| Next.js | `$PORT` (Render-injected) | Public |
| Hono | `8787` | Internal only |
| Postgres | Supabase pooler | External managed |

Environment: `BACKEND_URL=http://127.0.0.1:8787` is baked at **build** time for Next rewrites; runtime secrets (`DATABASE_URL`, `SUPABASE_*`, `CORS_ORIGIN`) come from Render.

## Local development

Two processes, same contract as production:

```mermaid
flowchart LR
  devBrowser([Browser :3000])
  devNext[["Next.js dev"]]
  devHono{{"Hono dev :8787"}}
  devDb[(("Postgres"))]

  devBrowser --> devNext
  devNext -->|"/api/* rewrite"| devHono
  devHono --> devDb
```

```bash
# Terminal 1
cd backend && npm run dev    # :8787

# Terminal 2
npm run dev                  # :3000, BACKEND_URL defaults to localhost:8787
```

## Backend structure

Feature-based layout per [`AGENTS.md`](AGENTS.md): routes → controllers → services → Drizzle. Reusable middleware lives under `backend/global/`.

```mermaid
flowchart TB
  subgraph hono_app [Hono app]
    mw[["Global middleware<br/>CORS · logger · errors"]]
    auth_routes{{"/auth"}}
    order_routes{{"/orders"}}

    mw --> auth_routes
    mw --> order_routes

    subgraph orders_feature [orders feature]
      oc[Controllers]
      os[Services]
      om[validateOrderOwnership]
      order_routes --> om --> oc --> os
    end

    subgraph payments_feature [payments feature]
      pc[Controllers]
      ps[Services]
      order_routes --> pc --> ps
    end
  end

  db[(Postgres)]
  os --> db
  ps --> db
```

| Feature | Endpoints (prefix `/orders` or `/auth`) | Notes |
| ------- | --------------------------------------- | ----- |
| Auth | `POST /auth/sign-up`, `sign-in`, `sign-out`, `GET /auth/me` | Supabase JWT in an httpOnly cookie → `userId`/`userEmail` on context |
| Orders | CRUD, list, export CSV, status history | Scoped by `userId` |
| Payments | `POST/GET …/:id/payments` | Row lock, idempotency key, overpayment guard |

## Frontend structure

```mermaid
flowchart TB
  subgraph browser [Browser]
    cookie[("httpOnly cookie<br/>oas_session")]
  end

  subgraph next_app [Next.js App Router]
    pages[["Pages<br/>/ · /dashboard · /orders/* · /sign-in"]]
    rq[["TanStack Query<br/>useMe · useOrders · useOrder · mutations"]]
    pages --> rq
  end

  api_proxy["/api/* rewrite"]
  rq -->|"fetch, credentials: include"| api_proxy
  api_proxy --> hono_backend{{Hono API}}
  hono_backend -.->|"Set-Cookie on sign-up/in/out"| cookie
  cookie -.->|"attached automatically"| api_proxy

  shared[["shared/api<br/>Zod schemas + types"]]
  pages -.-> shared
  hono_backend -.-> shared
```

The session token never reaches page JavaScript — it lives only in an httpOnly cookie the browser attaches to every `/api/*` request. The frontend asks `GET /auth/me` (via `useMe`) to know whether it's signed in rather than reading a token itself. Protected pages use `useRequireSession` (redirects to `/sign-in` when `useMe` comes back empty); the landing page uses `useHasSession` for conditional CTAs only. See [README.md § Auth & sessions](README.md#auth--sessions) for the cookie's exact attributes and the CSRF tradeoff.

## Data model and status

```mermaid
erDiagram
  orders ||--o{ order_items : contains
  orders ||--o{ payments : receives
  orders ||--o{ order_status_history : logs

  orders {
    uuid id PK
    uuid user_id
    text customer_name
    date due_date
    enum status "pending|partially_paid|paid"
  }

  payments {
    uuid id PK
    uuid order_id FK
    bigint amount_cents
    date paid_at
  }

  order_status_history {
    uuid id PK
    uuid order_id
    enum from_status
    enum to_status
    timestamptz changed_at
  }
```

**Status rules:**

- **Stored** on `orders.status`: `pending`, `partially_paid`, `paid` (updated when payments are recorded).
- **Derived at read time**: `overdue` when due date is past and balance remains — never written to the DB.
- **Audit**: DB triggers append to `order_status_history` on create and payment-driven status changes; `overdue` does not appear there.

Payment recording uses a transaction with `SELECT … FOR UPDATE` on the order row to serialize concurrent payments.

## Shared API contract

[`shared/api/`](shared/api/) holds Zod schemas and TypeScript types imported by:

- Backend controllers (validation via `throwValidationError`)
- Frontend forms and React Query clients

This keeps validation messages and field shapes identical across tiers without duplicating logic.

## Deployment artifact

```mermaid
flowchart LR
  subgraph build [Docker build]
    b_deps["backend-deps<br/>npm ci"]
    fe_build["frontend-build<br/>next build standalone"]
    runner["runner stage"]
    b_deps --> runner
    fe_build --> runner
  end

  runner --> image(["Image on Render"])
  image --> health["GET /api/health"]
```

See [`Dockerfile`](Dockerfile), [`render.yaml`](render.yaml), and [`README.md`](README.md) for env vars and deploy steps.
