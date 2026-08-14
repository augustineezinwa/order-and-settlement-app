import Link from "next/link";

import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { LedgerSummary } from "@/components/dashboard/ledger-summary";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUsd } from "@/lib/money";
import { lineTotalCents } from "@/lib/orders/line-item";
import type { OrderDetail } from "@/lib/orders/types";

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const isReadOnly = order.payments.length > 0;

  // Running balance after each payment, oldest first — computed once up
  // front so rendering the rows below never mutates state during render.
  const paymentsWithBalance = order.payments.reduce<
    Array<{ payment: (typeof order.payments)[number]; balanceAfterCents: number }>
  >((rows, payment) => {
    const previousBalance = rows.at(-1)?.balanceAfterCents ?? order.orderTotalCents;
    rows.push({ payment, balanceAfterCents: previousBalance - payment.amountCents });
    return rows;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          ← Orders
        </Link>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{order.customerName}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {order.id} · due {order.dueDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.amountDueCents > 0 && (
            <button
              type="button"
              disabled
              title="Record payment form coming soon"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground opacity-60"
            >
              Record payment
            </button>
          )}
        </div>
      </div>

      <LedgerSummary
        stats={[
          { label: "Order total", valueCents: order.orderTotalCents },
          { label: "Paid", valueCents: order.amountPaidCents, tone: "muted" },
          {
            label: "Amount due",
            valueCents: order.amountDueCents,
            tone: order.status === "overdue" ? "warn" : "default",
          },
        ]}
      />

      {isReadOnly && (
        <p className="font-mono text-xs text-muted-foreground">
          Read-only — line items lock once the first payment is recorded.
        </p>
      )}

      <section aria-labelledby="line-items-heading" className="rounded-lg border bg-card">
        <h2
          id="line-items-heading"
          className="border-b px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted-foreground"
        >
          Line items
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead className="pr-4">Line total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-4">{item.description}</TableCell>
                <TableCell className="font-mono tabular-nums">{item.quantity}</TableCell>
                <TableCell className="font-mono tabular-nums text-muted-foreground">
                  {formatUsd(item.unitPriceCents)}
                </TableCell>
                <TableCell className="pr-4 font-mono tabular-nums">
                  {formatUsd(lineTotalCents(item))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="px-4 font-medium">
                Subtotal
              </TableCell>
              <TableCell className="pr-4 font-mono tabular-nums">
                {formatUsd(order.orderTotalCents)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      <section aria-labelledby="payments-heading" className="rounded-lg border bg-card">
        <h2
          id="payments-heading"
          className="border-b px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted-foreground"
        >
          Payment history
        </h2>
        {order.payments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No payments recorded yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="pr-4">Balance after</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsWithBalance.map(({ payment, balanceAfterCents }) => (
                <TableRow key={payment.id}>
                  <TableCell className="px-4 font-mono tabular-nums text-muted-foreground">
                    {payment.paidAt}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {formatUsd(payment.amountCents)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.note ?? "—"}</TableCell>
                  <TableCell className="pr-4 font-mono tabular-nums">
                    {formatUsd(balanceAfterCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
