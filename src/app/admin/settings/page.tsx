"use client";

import { Settings } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminSettingsPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Settings"
        description="Configure business settings, admin accounts, notification preferences, and system-level options."
        icon={Settings}
      />
    </AdminLayoutShell>
  );
}
