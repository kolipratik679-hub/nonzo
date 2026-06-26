"use client";

import { BarChart3 } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminReportsPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Reports & Analytics"
        description="View sales analytics, revenue trends, customer insights, and product performance reports with visual charts."
        icon={BarChart3}
      />
    </AdminLayoutShell>
  );
}
