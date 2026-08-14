import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  valueCents: number;
  tone?: "default" | "muted" | "warn";
};

const toneClass: Record<NonNullable<Stat["tone"]>, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  warn: "text-destructive",
};

/**
 * Ledger-style stat strip: hairline-divided cells, mono numerals, no card
 * chrome. Shared between the dashboard overview and the order detail page
 * so a total always reads the same way.
 */
export function LedgerSummary({ stats }: { stats: Stat[] }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-border rounded-lg border border-border bg-card",
        "sm:grid-cols-4 sm:divide-y-0",
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="px-4 py-4 sm:px-5 sm:py-5">
          <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </dt>
          <dd
            className={cn(
              "mt-1.5 font-mono text-xl tabular-nums sm:text-2xl",
              toneClass[stat.tone ?? "default"],
            )}
          >
            {formatUsd(stat.valueCents)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
