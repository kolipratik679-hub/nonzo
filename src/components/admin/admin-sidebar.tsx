"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Users,
  Warehouse,
  TicketPercent,
  Truck,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";

// ─── Menu Configuration ──────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { label: "Delivery", href: "/admin/delivery", icon: Truck },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// ─── Component ───────────────────────────────────────────
interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({ collapsed, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { adminUser, adminLogout } = useAdminAuth();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarClasses = [
    "admin-sidebar",
    collapsed ? "collapsed" : "",
    mobileOpen ? "mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const initials = adminUser?.name
    ? adminUser.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const roleLabel =
    adminUser?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : adminUser?.role === "MANAGER"
        ? "Manager"
        : "Viewer";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${mobileOpen ? "visible" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={sidebarClasses}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <Image
            src="/NONZO-LOGO.png"
            alt="NONZO"
            width={36}
            height={36}
            style={{ borderRadius: 8, flexShrink: 0 }}
          />
          <h1>NONZO</h1>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${active ? "active" : ""}`}
                onClick={onCloseMobile}
                title={item.label}
              >
                <Icon className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile and Logout Section */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile-info">
            <div className="admin-sidebar-avatar" title={`${adminUser?.name || "Admin"} (${roleLabel})`}>
              {initials}
            </div>
            {!collapsed && (
              <div className="admin-sidebar-profile-details">
                <div className="admin-sidebar-profile-name">{adminUser?.name || "Admin"}</div>
                <div className="admin-sidebar-profile-role">{roleLabel}</div>
              </div>
            )}
          </div>
          <button
            onClick={adminLogout}
            className="admin-sidebar-logout-btn"
            title="Log Out"
            type="button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
