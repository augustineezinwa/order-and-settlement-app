import { statusBreakdown } from "@/lib/orders/aggregate";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/orders/status-meta";
import type { OrderSummary } from "@/lib/orders/types";
import { formatUsd } from "@/lib/money";

/**
 * Composition of the book of business by status, as a single proportional
 * bar (value-weighted) with a ledger-style legend beneath it.
 */
export function StatusCompositionChart({ orders }: { orders: OrderSummary[] }) {
  const buckets = statusBreakdown(orders).filter((b) => b.count > 0);
  const total = buckets.reduce((sum, b) => sum + b.totalCents, 0) || 1;

  return (
    <section aria-labelledby="status-mix-heading">
      <h2
        id="status-mix-heading"
        className="font-mono text-xs uppercase tracking-wide text-muted-foreground"
      >
        Status mix
      </h2>

      <div
        className="mt-3 flex h-6 w-full overflow-hidden rounded-sm border border-border"
        role="img"
        aria-label={buckets
          .map((b) => `${STATUS_LABEL[b.status]}: ${formatUsd(b.totalCents)}`)
          .join(", ")}
      >
        {buckets.map((b) => (
          <div
            key={b.status}
            className="h-full first:rounded-l-[1px] last:rounded-r-[1px]"
            style={{
              width: `${(b.totalCents / total) * 100}%`,
              backgroundColor: STATUS_COLOR[b.status],
            }}
          />
        ))}
      </div>

      <dl className="mt-4 divide-y divide-border border-t border-border">
        {buckets.map((b) => (
          <div key={b.status} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[b.status] }}
                aria-hidden="true"
              />
              <dt className="truncate">{STATUS_LABEL[b.status]}</dt>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{b.count}</span>
            </div>
            <dd className="shrink-0 font-mono tabular-nums">{formatUsd(b.totalCents)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
