import { CreateOrderForm } from "@/components/dashboard/create-order-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function NewOrderPage() {
  return (
    <DashboardShell>
      <CreateOrderForm />
    </DashboardShell>
  );
}
