"use client";

import React, { useState } from "react";
import { RECENT_ORDERS } from "./dashboard-data";
import { DashboardCard } from "../reusable-components";

// ─── Status styling map ─────────────────────────────────
const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Confirmed: { color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  Pending: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  Delivered: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" },
  Cancelled: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
  Preparing: { color: "#f97316", bg: "rgba(249, 115, 22, 0.12)" },
  Packed: { color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)" },
};

const AVATAR_COLORS = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#06b6d4", "#f97316"];

// ─── Component ───────────────────────────────────────────
export function RecentOrdersCard() {
  const [filter, setFilter] = useState("all");

  const filterSelect = (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="dash-header-select"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="all">All Orders</option>
      <option value="Pending">Pending</option>
      <option value="Confirmed">Confirmed</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  );

  const filteredOrders = RECENT_ORDERS.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  return (
    <DashboardCard
      title="Recent Orders"
      filterDropdown={filterSelect}
      viewAllHref="/admin/orders"
      href="/admin/orders" // Make card clickable to Orders
      scrollable={true}
      maxHeight="320px"
    >
      <div style={{ overflowX: "auto" }}>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, i) => {
              const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.Pending;
              return (
                <tr key={order.id}>
                  <td>
                    <span className="dash-order-id">{order.id}</span>
                  </td>
                  <td>
                    <div className="dash-customer-cell">
                      <div
                        className="dash-mini-avatar"
                        style={{
                          background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}15`,
                          color: AVATAR_COLORS[i % AVATAR_COLORS.length],
                        }}
                      >
                        {order.avatar}
                      </div>
                      {order.customer}
                    </div>
                  </td>
                  <td>{order.items}</td>
                  <td className="dash-table-amount">{order.total}</td>
                  <td>
                    <span
                      className="dash-status-pill"
                      style={{ color: statusStyle.color, background: statusStyle.bg }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="dash-table-muted">{order.time}</td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                  No orders match this status filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
