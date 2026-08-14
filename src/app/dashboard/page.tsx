import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrdersDashboard } from "@/components/dashboard/orders-dashboard";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <OrdersDashboard />
    </DashboardShell>
  );
}
