"use client";

import { AdminAuthProvider } from "@/context/admin-auth-context";
import "./admin.css";

/**
 * Admin nested layout.
 *
 * This layout sits inside the root layout (which renders the customer shell),
 * but visually replaces it with a full-viewport admin container that covers
 * the customer header, footer, nav, and cart bar. This approach avoids
 * modifying any customer-facing files.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthProvider>
      {/*
        Full-viewport overlay that visually hides the customer shell
        behind the admin panel. Uses fixed positioning + z-index to
        render on top of everything without modifying customer code.
      */}
      <div
        className="admin-root"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </AdminAuthProvider>
  );
}
