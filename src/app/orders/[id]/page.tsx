import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrderDetailView } from "@/components/dashboard/order-detail";
import { getOrderDetail } from "@/lib/orders/demo-order-detail";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderDetail(id);

  if (!order) notFound();

  return (
    <DashboardShell>
      <OrderDetailView order={order} />
    </DashboardShell>
  );
}
