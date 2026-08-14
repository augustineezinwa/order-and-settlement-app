import Link from "next/link";

import { amountsDueByOrder } from "@/lib/orders/aggregate";
import { formatUsd } from "@/lib/money";
import { STATUS_COLOR } from "@/lib/orders/status-meta";
import type { OrderSummary } from "@/lib/orders/types";

/** Ranked bar list of the largest outstanding balances — who to chase first. */
export function AmountsDueChart({ orders }: { orders: OrderSummary[] }) {
  const rows = amountsDueByOrder(orders, 6);
  const max = Math.max(...rows.map((r) => r.amountDueCents), 1);

  return (
    <section aria-labelledby="amounts-due-heading">
      <h2
        id="amounts-due-heading"
        className="font-mono text-xs uppercase tracking-wide text-muted-foreground"
      >
        Largest balances due
      </h2>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing outstanding.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {rows.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`} className="group block">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium group-hover:underline">
                    {order.customerName}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-foreground">
                    {formatUsd(order.amountDueCents)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-muted">
                  <div
                    className="h-full rounded-sm transition-[width]"
                    style={{
                      width: `${(order.amountDueCents / max) * 100}%`,
                      backgroundColor: STATUS_COLOR[order.status],
                    }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
