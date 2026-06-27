"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  CreditCard,
  Truck,
} from "lucide-react";

// ─── Notification Preview Data ───────────────────────────
const NOTIFICATION_PREVIEWS = [
  {
    id: 1,
    icon: ShoppingCart,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    title: "New Order Received",
    message: "NZO-20260626-034 — ₹1,249",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: AlertTriangle,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    title: "Low Stock Alert",
    message: "Tiger Prawns — 5 kg remaining",
    time: "8 min ago",
  },
  {
    id: 3,
    icon: CreditCard,
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
    title: "Failed Payment",
    message: "Order NZO-019 — gateway timeout",
    time: "12 min ago",
  },
  {
    id: 4,
    icon: Truck,
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.1)",
    title: "Delivery Delay",
    message: "Order NZO-007 — rider in traffic",
    time: "18 min ago",
  },
];

// ─── Component ───────────────────────────────────────────
interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ sidebarCollapsed, onToggleSidebar }: AdminHeaderProps) {
  const [lastSync, setLastSync] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Sync timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSync((prev) => prev + 10);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastSync(0);
    setTimeout(() => setIsRefreshing(false), 1200);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(".admin-search-input");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const syncLabel =
    lastSync < 60
      ? `Updated ${lastSync || 10} sec ago`
      : `Updated ${Math.floor(lastSync / 60)} min ago`;

  const headerClasses = [
    "admin-header",
    sidebarCollapsed ? "sidebar-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClasses}>
      <div className="admin-header-left">
        <button
          className="admin-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          type="button"
        >
          <Menu size={18} />
        </button>

        {/* Global Search */}
        <div className="admin-global-search">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="admin-search-input"
            readOnly
          />
          <kbd className="admin-search-kbd">Ctrl K</kbd>
        </div>
      </div>

      <div className="admin-header-right">
        {/* Live Status Badge */}
        <div className="admin-live-badge">
          <span className="admin-live-dot" />
          <span className="admin-live-text">LIVE</span>
        </div>

        {/* Last Sync */}
        <span className="admin-sync-text">{syncLabel}</span>

        {/* Refresh Button */}
        <button
          className={`admin-refresh-btn ${isRefreshing ? "spinning" : ""}`}
          onClick={handleRefresh}
          type="button"
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
        >
          <RefreshCw size={15} />
        </button>

        {/* Divider */}
        <div className="admin-header-divider" />

        {/* Notification Bell + Dropdown */}
        <div className="admin-notification-wrapper" ref={notifRef}>
          <button
            className={`admin-notification-btn ${showNotifications ? "active" : ""}`}
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell size={17} />
            <span className="admin-notification-badge">4</span>
          </button>

          {showNotifications && (
            <div className="admin-notification-dropdown">
              <div className="admin-notif-dropdown-header">
                <span className="admin-notif-dropdown-title">Notifications</span>
                <span className="admin-notif-dropdown-count">4 unread</span>
              </div>
              <div className="admin-notif-dropdown-list">
                {NOTIFICATION_PREVIEWS.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} className="admin-notif-dropdown-item">
                      <div
                        className="admin-notif-dropdown-icon"
                        style={{ background: notif.bg, color: notif.color }}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="admin-notif-dropdown-content">
                        <div className="admin-notif-dropdown-item-title">{notif.title}</div>
                        <div className="admin-notif-dropdown-item-msg">{notif.message}</div>
                      </div>
                      <div className="admin-notif-dropdown-time">{notif.time}</div>
                    </div>
                  );
                })}
              </div>
              <div className="admin-notif-dropdown-footer">
                View All Notifications
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
