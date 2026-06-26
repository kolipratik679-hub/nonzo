"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { useAdminAuth } from "@/context/admin-auth-context";

// ─── Component ───────────────────────────────────────────
export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn, isLoading } = useAdminAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track screen size
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setMobileSidebarOpen(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const handleCloseMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="admin-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="admin-spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: "rgba(200,16,46,0.2)", borderTopColor: "#C8102E" }} />
      </div>
    );
  }

  // Don't render shell if not logged in (redirect happens in context)
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="admin-spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: "rgba(200,16,46,0.2)", borderTopColor: "#C8102E" }} />
      </div>
    );
  }

  const mainClasses = [
    "admin-main",
    sidebarCollapsed ? "sidebar-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="admin-layout">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />

      <AdminHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      <main className={mainClasses}>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
