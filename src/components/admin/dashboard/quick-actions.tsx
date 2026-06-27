"use client";

import React from "react";
import { QUICK_ACTIONS } from "./dashboard-data";
import { DashboardCard, QuickActionCard } from "../reusable-components";

// ─── Map Action IDs to Destination Routes ──────────────────
const ACTION_HREFS: Record<string, string> = {
  "add-product": "/admin/products",
  "view-orders": "/admin/orders",
  "inventory": "/admin/inventory",
  "customers": "/admin/customers",
  "coupons": "/admin/coupons",
  "reports": "/admin/reports",
};

// ─── Component ───────────────────────────────────────────
export function QuickActions() {
  return (
    <DashboardCard title="Quick Actions">
      <div className="dash-quick-actions-grid">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionCard
            key={action.id}
            label={action.label}
            icon={action.icon}
            color={action.color}
            bgColor={action.bgColor}
            href={ACTION_HREFS[action.id] || "/admin"}
          />
        ))}
      </div>
    </DashboardCard>
  );
}
