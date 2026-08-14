"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MechanicalReadout } from "@/components/landing/mechanical-readout";
import { SettlementStates } from "@/components/landing/settlement-states";
import { TapeFeed } from "@/components/landing/tape-feed";
import { oswald } from "@/lib/fonts";

const BALANCE_SEQUENCE = ["1000.00", "0600.00", "0000.00"];

const mechanisms = [
  {
    tag: "01",
    title: "Totals strike from the tape, not a keypad",
    body: "Order total is always Σ(quantity × unit price). Status follows payment history — never hand-edited.",
    proof: "pending → partially_paid → paid · overdue at read",
  },
  {
    tag: "02",
    title: "Two payments can't hit the same key at once",
    body: "Concurrent submissions lock the order row, re-check the balance, and reject over-payment with the max allowed.",
    proof: "SELECT … FOR UPDATE · 409 on double-spend",
  },
  {
    tag: "03",
    title: "A jammed key never double-strikes",
    body: "Send an Idempotency-Key with each payment POST. Retries return the original punch instead of charging twice.",
    proof: "Idempotency-Key: uuid-v4",
  },
];

export function LandingPage() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Reduced-motion visitors get the static first frame — no cycling, no
    // synchronous jump-to-final that would itself be an unannounced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % BALANCE_SEQUENCE.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={`${oswald.variable} min-h-screen bg-[var(--tape-ground)] text-[var(--tape-ink)]`}
      style={
        {
          "--tape-ground": "#f2ede1",
          "--tape-paper": "#fbf8f1",
          "--tape-ink": "#221c14",
          "--tape-muted": "#7a7061",
          "--tape-well": "#cfc6b3",
          "--tape-edge": "rgba(34,28,20,0.14)",
          "--tape-accent": "#b3241c",
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes tape-line-print {
          0% { opacity: 0; transform: translateY(-0.35em); }
          15% { opacity: 1; background-color: rgba(179,36,28,0.16); }
          100% { opacity: 1; transform: translateY(0); background-color: transparent; }
        }
        .tape-line {
          animation: tape-line-print 0.5s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .tape-line { animation: none; opacity: 1; }
        }
        .key-press:active { transform: translateY(2px); }
      `}</style>

      <header className="border-b border-[var(--tape-edge)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
          <span
            className={`${oswald.className} text-sm font-semibold uppercase tracking-[0.18em]`}
          >
            Orders &amp; Settlements
          </span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="font-sans text-sm text-[var(--tape-muted)] hover:text-[var(--tape-ink)]">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={`${oswald.className} key-press inline-flex h-10 items-center justify-center rounded-[3px] bg-[var(--tape-ink)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tape-paper)] shadow-[0_2px_0_var(--tape-edge)] transition-transform`}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10 md:pb-32 md:pt-24">
          <div>
            <p
              className={`${oswald.className} text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tape-accent)]`}
            >
              Every payment, struck into the tape
            </p>
            <h1 className="mt-4 font-sans text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
              Nothing is typed twice. Nothing goes unrecorded.
            </h1>
            <p className="mt-5 max-w-lg font-sans text-lg leading-relaxed text-[var(--tape-muted)]">
              Orders &amp; Settlements totals every line, locks every payment, and prints the
              balance as it actually stands — not as anyone remembers it.
            </p>

            <div className="mt-10 inline-block rounded-sm border border-[var(--tape-edge)] bg-[var(--tape-paper)] px-6 py-5">
              <p className={`${oswald.className} text-xs uppercase tracking-[0.14em] text-[var(--tape-muted)]`}>
                Balance due — Acme Corp
              </p>
              <MechanicalReadout
                value={`$${BALANCE_SEQUENCE[step]}`}
                className="mt-1 font-mono text-4xl font-medium tabular-nums text-[var(--tape-ink)] md:text-5xl"
              />
            </div>

            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/sign-up"
                className={`${oswald.className} key-press inline-flex h-12 items-center justify-center rounded-[3px] bg-[var(--tape-accent)] px-7 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--tape-paper)] shadow-[0_3px_0_rgba(0,0,0,0.25)] transition-transform`}
              >
                Press to begin
              </Link>
              <span className="font-mono text-xs text-[var(--tape-muted)]">
                No card required
              </span>
            </div>
          </div>

          <div className="justify-self-center md:justify-self-end">
            <div className="w-[min(88vw,20rem)]">
              <TapeFeed />
            </div>
          </div>
        </section>

        <SettlementStates />

        <section
          aria-labelledby="mechanism-heading"
          className="border-t border-[var(--tape-edge)] bg-[var(--tape-paper)]"
        >
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
            <h2
              id="mechanism-heading"
              className="max-w-2xl font-sans text-2xl font-semibold tracking-tight md:text-3xl"
            >
              The ledger holds because the mechanism enforces it
            </h2>

            <ol className="mt-14 grid gap-px overflow-hidden rounded-sm bg-[var(--tape-edge)] md:grid-cols-3">
              {mechanisms.map((m) => (
                <li key={m.tag} className="bg-[var(--tape-paper)] p-6">
                  <span className={`${oswald.className} text-xs text-[var(--tape-muted)]`}>{m.tag}</span>
                  <h3 className="mt-3 font-sans text-base font-semibold">{m.title}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--tape-muted)]">{m.body}</p>
                  <code className="mt-4 block rounded-sm bg-[var(--tape-ground)] px-3 py-2 font-mono text-xs leading-relaxed text-[var(--tape-ink)]">
                    {m.proof}
                  </code>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="flex flex-col items-start justify-between gap-8 border-t border-[var(--tape-edge)] pt-12 md:flex-row md:items-end">
            <div>
              <h2 className="font-sans text-2xl font-semibold tracking-tight md:text-3xl">
                Open the ledger
              </h2>
              <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-[var(--tape-muted)]">
                Create orders, record payments, and watch the balance strike itself as
                settlements land.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className={`${oswald.className} key-press inline-flex h-12 items-center justify-center rounded-[3px] bg-[var(--tape-ink)] px-7 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--tape-paper)] shadow-[0_3px_0_rgba(0,0,0,0.25)] transition-transform`}
              >
                Open dashboard
              </Link>
              <Link
                href="/sign-in"
                className="font-sans text-sm text-[var(--tape-muted)] hover:text-[var(--tape-ink)]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--tape-edge)] bg-[var(--tape-paper)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 font-sans text-sm text-[var(--tape-muted)] md:flex-row md:items-center md:justify-between md:px-10">
          <p>Orders &amp; Settlements</p>
          <p className="font-mono text-xs">Take-home · API-backed order &amp; payment ledger</p>
        </div>
      </footer>
    </div>
  );
}
