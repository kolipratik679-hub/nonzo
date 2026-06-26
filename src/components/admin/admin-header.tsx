"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";

// ─── Component ───────────────────────────────────────────
interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ sidebarCollapsed, onToggleSidebar }: AdminHeaderProps) {
  const { adminUser, adminLogout } = useAdminAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

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
      </div>

      <div className="admin-header-right">
        {/* Profile Button */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            className="admin-profile-btn"
            onClick={() => setShowDropdown((prev) => !prev)}
            type="button"
            aria-label="Admin profile menu"
          >
            <div className="admin-profile-avatar">{initials}</div>
            <div className="admin-profile-info">
              <div className="admin-profile-name">{adminUser?.name || "Admin"}</div>
              <div className="admin-profile-role">{roleLabel}</div>
            </div>
            <ChevronDown size={14} style={{ color: "#888" }} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="admin-profile-dropdown">
              <button
                className="admin-dropdown-item"
                onClick={() => setShowDropdown(false)}
                type="button"
              >
                <User size={16} />
                <span>Profile</span>
              </button>
              <div className="admin-dropdown-divider" />
              <button
                className="admin-dropdown-item danger"
                onClick={() => {
                  setShowDropdown(false);
                  adminLogout();
                }}
                type="button"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
