"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { useRequireSession } from "@/api/auth/use-require-session";
import { useOrders } from "@/api/orders/queries";
import { ApiError } from "@/api/client";
import { AmountsDueChart } from "@/components/dashboard/amounts-due-chart";
import { LedgerSummary } from "@/components/dashboard/ledger-summary";
import { OrdersExportPanel } from "@/components/dashboard/orders-export-panel";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { StatusCompositionChart } from "@/components/dashboard/status-composition-chart";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { portfolioTotals } from "@/lib/orders/aggregate";
import { ORDER_STATUSES, type OrderStatus, type OrderSummary } from "@/lib/orders/types";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";

type SortKey = keyof Pick<OrderSummary, "customerName" | "dueDate" | "orderTotalCents" | "amountDueCents">;

function compareOrders(a: OrderSummary, b: OrderSummary, key: SortKey, dir: "asc" | "desc") {
  const av = a[key];
  const bv = b[key];
  if (av === bv) return 0;
  if (av < bv) return dir === "asc" ? -1 : 1;
  return dir === "asc" ? 1 : -1;
}

export function OrdersDashboard() {
  const router = useRouter();
  const hasSession = useRequireSession();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const apiStatus = statusFilter === "all" ? undefined : statusFilter;
  const { data: orders = [], isLoading, error } = useOrders(apiStatus);

  const portfolio = useMemo(() => portfolioTotals(orders), [orders]);

  const filtered = useMemo(() => {
    let rows = [...orders];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.status.includes(q),
      );
    }

    rows.sort((a, b) => compareOrders(a, b, sortKey, sortDir));
    return rows;
  }, [orders, search, sortKey, sortDir]);

  const totals = useMemo(
    () => ({
      orderTotalCents: filtered.reduce((s, o) => s + o.orderTotalCents, 0),
      amountPaidCents: filtered.reduce((s, o) => s + o.amountPaidCents, 0),
      amountDueCents: filtered.reduce((s, o) => s + o.amountDueCents, 0),
    }),
    [filtered],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  if (!hasSession) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error) {
    const message = error instanceof ApiError ? error.message : "Failed to load orders.";
    return (
      <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Derived totals and status from line items and payment history.
          </p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Create order
        </Link>
      </div>

      <LedgerSummary
        stats={[
          { label: "Portfolio total", valueCents: portfolio.orderTotalCents },
          { label: "Collected", valueCents: portfolio.amountPaidCents, tone: "muted" },
          { label: "Amount due", valueCents: portfolio.amountDueCents },
          { label: "Overdue", valueCents: portfolio.overdueCents, tone: "warn" },
        ]}
      />

      <div className="grid gap-6 rounded-lg border border-border bg-card p-5 lg:grid-cols-2 lg:p-6">
        <StatusCompositionChart orders={orders} />
        <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <AmountsDueChart orders={orders} />
        </div>
      </div>

      <OrdersExportPanel />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            All
          </FilterChip>
          {ORDER_STATUSES.map((status) => (
            <FilterChip
              key={status}
              active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {status.replace("_", " ")}
            </FilterChip>
          ))}
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer or order id…"
          className="max-w-sm rounded-full"
          aria-label="Search orders"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button type="button" className="font-medium" onClick={() => toggleSort("orderTotalCents")}>
                  Order total{sortIndicator("orderTotalCents")}
                </button>
              </TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>
                <button type="button" className="font-medium" onClick={() => toggleSort("amountDueCents")}>
                  Due{sortIndicator("amountDueCents")}
                </button>
              </TableHead>
              <TableHead className="pr-4">
                <button type="button" className="font-medium" onClick={() => toggleSort("dueDate")}>
                  Due date{sortIndicator("dueDate")}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 px-4 text-center text-muted-foreground">
                  No orders match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <TableCell className="px-4 font-medium">
                    <Link href={`/orders/${order.id}`} className="hover:underline">
                      {order.customerName}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8)}…
                    </p>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{formatUsd(order.orderTotalCents)}</TableCell>
                  <TableCell className="font-mono tabular-nums text-muted-foreground">
                    {formatUsd(order.amountPaidCents)}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{formatUsd(order.amountDueCents)}</TableCell>
                  <TableCell className="pr-4 font-mono tabular-nums text-muted-foreground">
                    {order.dueDate}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="px-4 font-medium">
                {filtered.length} order{filtered.length === 1 ? "" : "s"} shown
              </TableCell>
              <TableCell className="font-mono tabular-nums">{formatUsd(totals.orderTotalCents)}</TableCell>
              <TableCell className="font-mono tabular-nums">{formatUsd(totals.amountPaidCents)}</TableCell>
              <TableCell className="font-mono tabular-nums">{formatUsd(totals.amountDueCents)}</TableCell>
              <TableCell className="pr-4" />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm capitalize transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
