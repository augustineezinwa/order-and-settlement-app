import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrderDetailPageClient } from "@/components/dashboard/order-detail-page-client";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell>
      <OrderDetailPageClient id={id} />
    </DashboardShell>
  );
}
