"use client";

import { Truck } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminDeliveryPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Delivery Management"
        description="Configure delivery slots, zones, and charges. Manage delivery personnel and track real-time deliveries."
        icon={Truck}
      />
    </AdminLayoutShell>
  );
}
