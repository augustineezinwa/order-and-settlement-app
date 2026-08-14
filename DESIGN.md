---
name: Orders & Settlements
description: Receipt Tape — a mechanical-ledger theme shared by every page, marketing and app alike
colors:
  background: "#f2ede1"
  foreground: "#221c14"
  card: "#fbf8f1"
  surface-muted: "#f2ede1"
  text-muted: "#7a7061"
  border-subtle: "rgba(34, 28, 20, 0.14)"
  code-surface: "rgba(34, 28, 20, 0.08)"
  accent: "#b3241c"
  status-paid-text: "#3f6b34"
  status-paid-border: "rgba(63, 107, 52, 0.35)"
typography:
  display:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: "-0.025em"
  body:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.78
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-oswald), Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
  mono:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.9em"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  pill: "9999px"
  sm: "0.25rem"
  key: "3px"
spacing:
  page-y: "8rem"
  page-x: "4rem"
  section-gap: "1.5rem"
  button-x: "1.25rem"
components:
  button-primary:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "2.5rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "2.5rem"
  code-inline:
    backgroundColor: "{colors.code-surface}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.375rem"
---

# Design System: Orders & Settlements

## Overview

**Creative North Star: "Receipt Tape"**

Orders & Settlements reads like a mechanical ledger: settlement as a calculation you can watch happen, struck onto paper rather than typed into a form. This is one theme for the whole product — marketing landing page, operator dashboard, order detail, and auth — not a marketing skin over a separate app palette. A visitor moving from the homepage to "Open dashboard" to "Sign in" should never feel a seam.

The system started as two worlds (a monochrome "Clean Ledger" app shell and a Receipt Tape landing page, chosen from two built directions — a discarded Engraved Certificate direction, see the landing surface brief for that history) and was deliberately unified into one at the product owner's request. Every page now shares the same warm ivory ground, near-black ink, and single alarm-red accent.

**Key Characteristics:**

- Warm ivory ground, paper-toned panels, near-black ink — restrained, not monochrome-strict; one red accent carries both the primary marketing CTA and the app's destructive/overdue semantics
- Flat surfaces; depth conveyed through background steps (ground vs. paper) and hairline borders, with one deliberate exception (the landing page's key-press button shadow)
- Two button geometries by context: pill buttons for app/dashboard/auth actions, flat "key" buttons (sharp corners, offset press-shadow) for the landing page's mechanical-tape moments — see Shapes
- Geist Sans for body copy, Oswald for nav/labels/section kickers, Geist Mono for amounts, IDs, tape feeds, and code
- Deliberately light-only. The whole app commits to this paper material rather than repainting for OS dark mode — a considered choice, not an omission, made twice (once for the landing page, then extended app-wide)

## Colors

### Primary

- **Ink** (`#221c14`): Primary text, filled button backgrounds, primary borders/rules at reduced opacity. The authoritative voice of the interface everywhere.

### Neutral

- **Ivory Ground** (`#f2ede1`): Page background — landing hero, dashboard shell, auth shell, 404. Header chrome sits flush against this, divided only by a hairline.
- **Paper** (`#fbf8f1`): Cards, panels, the tape feed, form panels — one subtle step lighter than the ground.
- **Muted Ink** (`#7a7061`): Secondary copy, de-emphasized labels, table sub-rows.
- **Hairline** (`rgba(34, 28, 20, 0.14)`): Borders, dividers, table rules.
- **Code Wash** (`rgba(34, 28, 20, 0.08)`): Inline code, proof snippets.

### Accent

- **Alarm Red** (`#b3241c`): The one saturated color in the system. Used for exactly two things — the landing page's primary CTA / print-strike flash, and the app's `destructive`/overdue semantics (badges, amount-due warnings). Never used as a general accent or on secondary chrome.
- **Settled Green** (`#3f6b34`): The one other semantic color, reserved for the `paid` status badge and chart segment — warmed to sit next to the red/ivory palette rather than a cool emerald.

### Named Rules

**The Two-Color-Semantics Rule.** Outside of status badges/charts and the landing CTA, the UI stays ink-on-ivory. Red means "needs attention / overdue"; green means "settled." No other hue is introduced.

**The One Surface Step Rule.** At most one background step between page (Ivory Ground) and content panel (Paper). Avoid nested boxes.

## Typography

**Display / Body Font:** Geist Sans (Arial, Helvetica fallback) — headings and body copy everywhere.
**Label Font:** Oswald (condensed, 500–700 weight) — nav wordmark, section kickers, buttons that want a "stamped" voice, uppercase tracked labels.
**Mono Font:** Geist Mono (ui-monospace fallback) — currency, order IDs, dates, the receipt tape feed, inline code.

### Hierarchy

- **Display** (600, 1.875–3rem, tight tracking): Page titles, hero headlines.
- **Body** (400, 1.125rem, 1.78 line-height): Explanatory copy.
- **Label** (Oswald 600, 0.75rem, 0.14em tracking, uppercase): Nav, kickers, table headers, buttons.
- **Mono** (400, 0.9em, tabular-nums where numeric): Amounts, IDs, dates, proof snippets.

### Named Rules

**The Numbers in Mono Rule.** Currency, IDs, and dates always use Geist Mono so figures align and scan separately from prose — unchanged from the original system, now enforced consistently on both the dashboard tables and the landing tape feed / digit-wheel readout.

## Layout

Marketing sections (landing) run wide (`max-w-6xl`, generous `py-20`–`py-32`). App shells (dashboard, order detail, auth) run at `max-w-6xl` for content-dense views or `max-w-sm` for the centered auth card, with tighter `py-8`–`py-16`. Auth and 404 pages use `min-h-screen` flex centering (not `min-h-full`, which does not reliably resolve through the layout's percentage-height chain) so short-content pages still center correctly in the viewport rather than only within their own shrink-wrapped height.

## Elevation & Depth

Flat by default. Hierarchy comes from the ground/paper background step and hairline borders — no `box-shadow` for cards, panels, or dashboard buttons. The single exception is the landing page's "key-press" button (`shadow-[0_2px_0_var(--tape-edge)]`, zero blur, an offset block shadow that compresses on `:active`) — a literal mechanical-key affordance confined to `src/components/landing/**`. It does not appear on dashboard or auth buttons, which stay shadow-free pills.

## Shapes

Two geometries, chosen by context rather than mixed on one surface:

- **App shapes** (dashboard, order detail, auth, 404): soft-square cards and inputs (`rounded-lg`, ~10px) and **pill buttons** (`rounded-full`) — familiar, calm, operate-mode conventions.
- **Landing shapes**: sharp `rounded-[3px]` "key" buttons with the press-shadow above, `rounded-sm` panels (tape feed, ticket stubs) — a mechanical, stamped register rather than a soft app affordance.

Never mix pill buttons with the key-press shadow, or flat keys with soft-square app cards, on the same surface.

## Components

### Buttons

- **App primary** (dashboard "Create order", auth "Sign in"/"Create account"): full pill, Ink fill, Paper label, 40px height, `hover:bg-primary/80`.
- **App secondary/ghost** (nav "Sign in"/"Sign out"): pill, hairline border, transparent fill, `hover:bg-muted`.
- **Landing key buttons**: `rounded-[3px]`, Ink or Alarm Red fill, offset press-shadow, compress on `:active`.

### Cards / Containers

- **Corner style:** `rounded-lg` (app), `rounded-sm` (landing tape/ticket panels).
- **Background:** Paper on Ivory Ground.
- **Shadow:** None (see Elevation).
- **Border:** Hairline, always.

### Inputs / Fields

- **Style:** `rounded-lg`, hairline border, Paper background, 40px height on auth forms.
- **Focus:** ring at `--ring` (ink, 40% opacity) — no glow/colored shadows.
- **Error:** `border-destructive` + a `text-destructive` message directly under the field; a form-level error (e.g. a failed API call) renders as a dismissed-on-retry banner above the fields, not a toast.

### Status Badges / Charts

- `pending`: muted ink. `partially_paid`: full ink. `paid`: Settled Green. `overdue`: Alarm Red. The same four-color mapping drives the status badge, the dashboard's status-mix bar and largest-balances-due chart, and the landing page's four settlement-state ticket stubs — one semantic system, several renderings.

### Inline Code

- Code Wash background, Mono typography, 4px radius — file names, API paths, proof snippets (`SELECT … FOR UPDATE`, `Idempotency-Key: uuid-v4`).

## Do's and Don'ts

### Do:

- **Do** use the same background tokens (`--background`, `--card`, `--surface-muted`) on every page — they resolve to the same Receipt Tape values everywhere; there is no per-surface override left in the codebase except the landing page's own scoped `--tape-*` custom properties, which carry identical values for historical/self-containment reasons.
- **Do** use Geist Mono for tabular numbers, order IDs, dates, and cent amounts.
- **Do** keep pill buttons + soft-square cards on app surfaces; keep key buttons + sharp panels on the landing page. Don't cross the two.
- **Do** reserve Alarm Red for the landing CTA and the app's destructive/overdue semantics — never a general accent.
- **Do** use `min-h-screen` (not `min-h-full`) on any full-page shell that needs to center or fill the viewport.

### Don't:

- **Don't** add box shadows, gradients, or glassmorphism, except the landing page's one named key-press shadow.
- **Don't** introduce a second saturated accent beyond Alarm Red and Settled Green.
- **Don't** reintroduce a dark-mode palette without a real toggle — the app currently has none, and a `prefers-color-scheme` media query with no corresponding light/dark design intent is how the previous two-token-system bug happened (see globals.css history).
- **Don't** center-align data tables or form field labels — operator tools align start for scannability (auth form labels are an intentional exception: the whole card is centered as a unit, per the product owner's request).
- **Don't** fabricate brand imagery or logos; use the product name typographically until real assets exist.
