"use client";

type TapeLine = {
  text: string;
  variant?: "rule" | "strike" | "stamp";
};

const lines: TapeLine[] = [
  { text: "ORDER · ACME CORP" },
  { text: "2 × STANDARD INSTALL KIT @ $500.00" },
  { text: "SUBTOTAL ............ $1,000.00", variant: "rule" },
  { text: "" },
  { text: "08-10  DEPOSIT RECEIVED", variant: "strike" },
  { text: "AMOUNT ............... $400.00" },
  { text: "BALANCE .............. $600.00", variant: "rule" },
  { text: "STATUS: PARTIALLY PAID", variant: "stamp" },
];

/** A receipt tape printing itself one struck line at a time, on load. */
export function TapeFeed() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-2 left-0 right-0 flex justify-between px-2">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-[var(--tape-well)]" />
        ))}
      </div>
      <div className="rounded-sm bg-[var(--tape-paper)] px-5 pb-5 pt-6 shadow-[inset_0_0_0_1px_var(--tape-edge)]">
        <ol className="space-y-1.5 font-mono text-[0.8125rem] leading-relaxed text-[var(--tape-ink)]">
          {lines.map((line, i) => (
            <li
              key={i}
              className={`whitespace-pre tape-line ${line.variant === "stamp" ? "font-semibold text-[var(--tape-accent)]" : ""}`}
              style={{ animationDelay: `${0.15 + i * 0.22}s` }}
            >
              {line.text || " "}
            </li>
          ))}
        </ol>
      </div>
      <div className="pointer-events-none absolute -bottom-2 left-0 right-0 flex justify-between px-2">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-[var(--tape-well)]" />
        ))}
      </div>
    </div>
  );
}
