"use client";

import { Package } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminProductsPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Products Management"
        description="Add, edit, and manage your product catalog. Upload images, set pricing, manage weight options, and configure cut types."
        icon={Package}
      />
    </AdminLayoutShell>
  );
}
