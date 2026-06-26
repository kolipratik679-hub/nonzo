"use client";

import { Warehouse } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminInventoryPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Inventory Management"
        description="Track stock levels, manage inventory batches, record wastage, and set low-stock alerts for all products."
        icon={Warehouse}
      />
    </AdminLayoutShell>
  );
}
