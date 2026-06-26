"use client";

import { TicketPercent } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminCouponsPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Coupons & Promotions"
        description="Create and manage discount coupons, promotional offers, and special deals. Set validity periods and usage limits."
        icon={TicketPercent}
      />
    </AdminLayoutShell>
  );
}
