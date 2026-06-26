"use client";

import { FolderTree } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminCategoriesPage() {
  return (
    <AdminLayoutShell>
      <AdminPlaceholderPage
        title="Categories Management"
        description="Create and manage product categories. Set category images, descriptions, and display order on the storefront."
        icon={FolderTree}
      />
    </AdminLayoutShell>
  );
}
