"use client";

import { useOrderStatusHistory } from "@/api/orders/queries";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderStatus } from "@/lib/orders/types";

function formatStatusLabel(status: OrderStatus | null): string {
  if (!status) return "—";
  return status.replace("_", " ");
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function OrderStatusHistory({ orderId }: { orderId: string }) {
  const { data: history = [], isLoading, error } = useOrderStatusHistory(orderId);

  return (
    <section aria-labelledby="status-history-heading" className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h2
          id="status-history-heading"
          className="font-mono text-xs uppercase tracking-wide text-muted-foreground"
        >
          Status history
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Stored payment-driven transitions only. Overdue is derived at read time and is not logged here.
        </p>
      </div>

      {isLoading ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading status history…</p>
      ) : error ? (
        <p role="alert" className="px-4 py-8 text-center text-sm text-destructive">
          Failed to load status history.
        </p>
      ) : history.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No status changes recorded yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">When</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                  {formatTimestamp(entry.changedAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.fromStatus ? formatStatusLabel(entry.fromStatus) : "Created"}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={entry.toStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
