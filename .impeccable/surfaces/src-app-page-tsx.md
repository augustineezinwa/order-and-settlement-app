---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Landing page (/)

**Mode:** Persuade

**Audience:** Take-home reviewers and small-business operators evaluating the product.

**Job:** Understand what Orders & Settlements does, trust the ledger mechanism, and sign up or sign in.

**Action:** Get started → /sign-up; Sign in → /sign-in

**Composition:** Receipt Tape / mechanical adding machine — a perforated tape prints an order's line items and payments as struck lines; a digit-wheel readout rolls the balance due like a real adding machine. Four sections: hero (headline + rolling readout + printing tape), "the four states of settlement" (order lifecycle as punched ticket stubs), "the ledger holds because the mechanism enforces it" (three mechanism facts with mono proof snippets), and an "Open the ledger" CTA close.

**Proof:** Synthetic Acme Corp $1,000 order demonstration (labeled, mirrors the assignment's own sample scenario). Mechanism section cites real API behaviors (derived totals, row lock, idempotency).

**Constraints:** Receipt Tape world — warm ivory ground (#f2ede1), near-black ink, one alarm-red accent (#b3241c); Oswald for stamped condensed-caps labels/nav/buttons, Geist Sans for body copy, Geist Mono for the tape feed and ledger figures. Deliberately light-only paper material (does not adapt to OS dark mode — a considered choice, not an omission). No box shadows beyond the flat key-press offset shadow already in use; no gradients or glassmorphism. This palette now drives the whole app (see DESIGN.md) — the landing page still declares its own local `--tape-*` custom properties rather than reading the global tokens, so it stays self-contained, but the values are kept identical by convention.

**Provenance:** Chosen by the user from two fully-built directions (Receipt Tape vs. an Engraved Certificate direction) produced via Impeccable's direction-round process — see PRODUCT.md history / this file's git history for the seed key (3f949344) and challenger weighing if needed later. The certificate direction and its components were deleted after the choice; two of its section headings ("the four states of settlement", "the ledger holds because the mechanism enforces it") were kept by explicit request and re-dressed in the Receipt Tape's own material rather than reused verbatim. The theme was later extended app-wide (dashboard, order detail, auth) by explicit request, superseding the original "Clean Ledger" app palette entirely.

**Unresolved:** Dashboard nav ("Payments") still a stub. `/orders/new` (create-order form) not built.
