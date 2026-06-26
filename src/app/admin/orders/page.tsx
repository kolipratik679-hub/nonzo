"use client";

import { ShoppingCart } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminOrdersPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Orders Management"
        description="View, filter, and manage all customer orders. Update order statuses, assign delivery, and handle cancellations."
        icon={ShoppingCart}
      />
    </AdminLayoutShell>
  );
}
