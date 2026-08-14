"use client";

import Link from "next/link";

import { useRequireSession } from "@/api/auth/use-require-session";
import { useOrder } from "@/api/orders/queries";
import { ApiError } from "@/api/client";
import { OrderDetailView } from "@/components/dashboard/order-detail";

export function OrderDetailPageClient({ id }: { id: string }) {
  const hasSession = useRequireSession();
  const { data: order, isLoading, error } = useOrder(id);

  if (!hasSession) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error) {
    const message = error instanceof ApiError ? error.message : "Failed to load order.";
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          ← Orders
        </Link>
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          ← Orders
        </Link>
        <p className="text-sm text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  return <OrderDetailView order={order} />;
}
