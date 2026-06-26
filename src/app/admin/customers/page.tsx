"use client";

import { Users } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminCustomersPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Customers Management"
        description="View customer profiles, order history, addresses, and activity. Manage customer accounts and communications."
        icon={Users}
      />
    </AdminLayoutShell>
  );
}
