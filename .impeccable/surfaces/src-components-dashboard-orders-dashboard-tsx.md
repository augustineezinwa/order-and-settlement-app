---
version: 1
slug: "src-components-dashboard-orders-dashboard-tsx"
primary_target: "src/components/dashboard/orders-dashboard.tsx"
related_targets: ["src/components/dashboard/order-detail.tsx","src/app/orders/[id]/page.tsx","src/app/dashboard/page.tsx"]
---

# Orders dashboard & order detail

**Mode:** Operate

**Audience:** The single operator managing customer orders and payments.

**Job:** Scan every order's status and amount due at a glance, drill into one order for its line items and full payment history.

**Task/action:** Filter by status, sort the table, open an order; record-payment and create-order forms are not yet wired to the API (buttons present, disabled/stubbed).

**Composition:** Ledger-strip summary (portfolio total / collected / due / overdue, hairline-divided, mono numerals) → two-up chart panel (value-weighted status-mix bar + ranked largest-balances-due bar list, both colored by the same status semantics as the badge) → filter chips + search → sortable orders table, full row navigates to `/orders/[id]`. Order detail reuses the ledger-strip summary, then line items table and a payment-history table with a running balance column.

**Constraints:** Receipt Tape world, shared with the landing page (see DESIGN.md — the app used to run a separate monochrome "Clean Ledger" palette; unified into one theme app-wide by request). Ivory ground, paper cards, ink text, color reserved for status semantics only (pending=muted ink, partially_paid=full ink, paid=warm green, overdue=alarm red, matching the badge tokens). App surfaces keep pill buttons + soft-square (`rounded-lg`) cards — not the landing page's flat key-button geometry. No progress rings/sparklines-as-decoration; bars are real proportional data. Demo data lives in `src/lib/orders/demo-orders.ts` and `src/lib/orders/demo-order-detail.ts` until the API is wired.

**Unresolved:** Create-order and record-payment forms; live API wiring; `/orders/new` route (link exists, page doesn't yet).
