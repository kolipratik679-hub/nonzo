"use client";

import React from "react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import {
  DashboardHeader,
  BusinessHealthCards,
  RevenueCard,
  QuickActions,
  LiveAlerts,
  OrderPipeline,
  RecentOrdersCard,
  LatestCustomersCard,
  LowStockCard,
  SalesOverviewCard,
} from "@/components/admin/dashboard";

// ─── Component ───────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <AdminLayoutShell>
      <div className="dash-page">
        {/* 1. Dashboard Header — IST Clock, Greeting, Search, Notifications */}
        <DashboardHeader />

        {/* 2. Business Health Cards — 8 KPI cards */}
        <BusinessHealthCards />

        {/* 3. Revenue Card + Quick Actions — Side by side */}
        <div className="dash-row-2col">
          <div className="dash-col-wide">
            <RevenueCard />
          </div>
          <div className="dash-col-narrow">
            <QuickActions />
          </div>
        </div>

        {/* 4. Order Pipeline — Visual flow */}
        <OrderPipeline />

        {/* 5. Live Alerts */}
        <LiveAlerts />

        {/* 6. Recent Orders — Full width */}
        <RecentOrdersCard />

        {/* 7. Latest Customers + Low Stock — Side by side */}
        <div className="dash-row-2col-even">
          <LatestCustomersCard />
          <LowStockCard />
        </div>

        {/* 8. Sales Overview — Full width */}
        <SalesOverviewCard />
      </div>
    </AdminLayoutShell>
  );
}
