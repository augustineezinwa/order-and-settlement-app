import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

const labels: Record<OrderStatus, string> = {
  pending: "pending",
  partially_paid: "partially paid",
  paid: "paid",
  overdue: "overdue",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-xs uppercase tracking-wide",
        status === "paid" && "border-[var(--status-paid-border)] text-[var(--status-paid-text)]",
        status === "overdue" && "border-destructive/40 text-destructive",
      )}
    >
      {labels[status]}
    </Badge>
  );
}
