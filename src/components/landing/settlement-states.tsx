import { oswald } from "@/lib/fonts";

const states = [
  { tag: "I", status: "Pending", note: "Order struck — no payment received yet" },
  { tag: "II", status: "Partially paid", note: "$400.00 rung against the $1,000.00 total" },
  { tag: "III", status: "Paid", note: "Balance cleared to zero" },
  { tag: "IV", status: "Overdue", note: "Past due date, balance still open", warn: true },
];

/** The four order-lifecycle states as punched ticket stubs on the tape. */
export function SettlementStates() {
  return (
    <section
      aria-labelledby="states-heading"
      className="border-t border-[var(--tape-edge)] bg-[var(--tape-ground)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <h2
          id="states-heading"
          className="max-w-2xl font-sans text-2xl font-semibold tracking-tight md:text-3xl"
        >
          The four states of settlement
        </h2>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {states.map((state, i) => (
            <div
              key={state.tag}
              className="tape-line relative"
              style={{ animationDelay: `${0.1 + i * 0.15}s` }}
            >
              <div className="ticket-notches" aria-hidden="true" />
              <div className="flex h-full flex-col gap-2 rounded-sm border border-[var(--tape-edge)] bg-[var(--tape-paper)] px-5 pb-6 pt-5">
                <span className={`${oswald.className} text-xs text-[var(--tape-muted)]`}>
                  {state.tag}
                </span>
                <span
                  className={`${oswald.className} text-sm font-semibold uppercase tracking-[0.08em] ${
                    state.warn ? "text-[var(--tape-accent)]" : "text-[var(--tape-ink)]"
                  }`}
                >
                  {state.status}
                </span>
                <span className="mt-1 font-mono text-xs leading-relaxed text-[var(--tape-muted)]">
                  {state.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ticket-notches {
          position: absolute;
          top: -6px;
          left: 0;
          right: 0;
          height: 12px;
          background-image: radial-gradient(circle at 50% 50%, var(--tape-ground) 3px, transparent 3.5px);
          background-size: 16px 12px;
          background-repeat: repeat-x;
          background-position: 8px 0;
        }
      `}</style>
    </section>
  );
}
