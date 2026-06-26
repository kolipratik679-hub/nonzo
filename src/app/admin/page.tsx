"use client";

import React from "react";
import {
  ShoppingCart,
  CalendarCheck,
  IndianRupee,
  Clock,
  XCircle,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";

// ─── Dummy Data ──────────────────────────────────────────
const STATS = [
  {
    title: "Total Orders",
    value: "1,247",
    change: "+12.5% vs last month",
    changeType: "positive" as const,
    icon: ShoppingCart,
    iconBg: "rgba(59, 130, 246, 0.1)",
    iconColor: "#3b82f6",
  },
  {
    title: "Today's Orders",
    value: "34",
    change: "+8 vs yesterday",
    changeType: "positive" as const,
    icon: CalendarCheck,
    iconBg: "rgba(16, 185, 129, 0.1)",
    iconColor: "#10b981",
  },
  {
    title: "Revenue",
    value: "₹4,82,350",
    change: "+18.2% vs last month",
    changeType: "positive" as const,
    icon: IndianRupee,
    iconBg: "rgba(168, 85, 247, 0.1)",
    iconColor: "#a855f7",
  },
  {
    title: "Pending Orders",
    value: "12",
    change: "3 need attention",
    changeType: "negative" as const,
    icon: Clock,
    iconBg: "rgba(245, 158, 11, 0.1)",
    iconColor: "#f59e0b",
  },
  {
    title: "Cancelled Orders",
    value: "23",
    change: "-5.1% vs last month",
    changeType: "positive" as const,
    icon: XCircle,
    iconBg: "rgba(239, 68, 68, 0.1)",
    iconColor: "#ef4444",
  },
  {
    title: "Customers",
    value: "856",
    change: "+42 this month",
    changeType: "positive" as const,
    icon: Users,
    iconBg: "rgba(6, 182, 212, 0.1)",
    iconColor: "#06b6d4",
  },
  {
    title: "Products",
    value: "48",
    change: "3 new this week",
    changeType: "positive" as const,
    icon: Package,
    iconBg: "rgba(34, 197, 94, 0.1)",
    iconColor: "#22c55e",
  },
  {
    title: "Inventory Alerts",
    value: "7",
    change: "Low stock items",
    changeType: "negative" as const,
    icon: AlertTriangle,
    iconBg: "rgba(249, 115, 22, 0.1)",
    iconColor: "#f97316",
  },
];

const RECENT_ORDERS = [
  { id: "NZO-20260625-001", customer: "Rahul Sharma", items: 3, total: "₹1,249", status: "Confirmed", time: "10 min ago" },
  { id: "NZO-20260625-002", customer: "Priya Patel", items: 2, total: "₹789", status: "Pending", time: "25 min ago" },
  { id: "NZO-20260625-003", customer: "Amit Singh", items: 5, total: "₹2,150", status: "Delivered", time: "1 hr ago" },
  { id: "NZO-20260625-004", customer: "Sneha Desai", items: 1, total: "₹449", status: "Confirmed", time: "2 hrs ago" },
  { id: "NZO-20260625-005", customer: "Vikram Joshi", items: 4, total: "₹1,890", status: "Cancelled", time: "3 hrs ago" },
];

const LATEST_CUSTOMERS = [
  { name: "Aarav Mehta", mobile: "98XXXX1234", orders: 3, initials: "AM", color: "#3b82f6" },
  { name: "Ishita Reddy", mobile: "87XXXX5678", orders: 1, initials: "IR", color: "#a855f7" },
  { name: "Rohan Naik", mobile: "90XXXX9012", orders: 2, initials: "RN", color: "#10b981" },
  { name: "Kavya Iyer", mobile: "91XXXX3456", orders: 5, initials: "KI", color: "#f59e0b" },
];

const LOW_STOCK = [
  { name: "Surmai / King Fish", stock: 3, unit: "kg", color: "#ef4444" },
  { name: "Tiger Prawns (Large)", stock: 5, unit: "kg", color: "#f59e0b" },
  { name: "Blue Crab", stock: 2, unit: "pcs", color: "#ef4444" },
  { name: "Pomfret (White)", stock: 4, unit: "kg", color: "#f59e0b" },
];

// ─── Status Badge Helper ─────────────────────────────────
function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed": return "confirmed";
    case "pending": return "pending";
    case "cancelled": return "cancelled";
    case "delivered": return "delivered";
    default: return "";
  }
}

// ─── Component ───────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <AdminLayoutShell>
      <div>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="admin-dashboard-grid">
          {STATS.map((stat) => (
            <AdminStatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Sections Grid */}
        <div className="admin-sections-grid">
          {/* Recent Orders */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <span className="admin-table-title">Recent Orders</span>
              <button className="admin-view-all-btn" type="button">
                View All <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: "#111", fontSize: 12 }}>{order.id}</td>
                      <td>{order.customer}</td>
                      <td style={{ fontWeight: 600 }}>{order.total}</td>
                      <td>
                        <span className={`admin-status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: "#888" }}>{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Customers */}
          <div className="admin-section-card">
            <div className="admin-section-header">
              <span className="admin-section-title">Latest Customers</span>
              <button className="admin-view-all-btn" type="button">
                View All <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
              </button>
            </div>
            <div className="admin-section-body">
              {LATEST_CUSTOMERS.map((customer) => (
                <div key={customer.mobile} className="admin-list-item">
                  <div
                    className="admin-list-avatar"
                    style={{ background: `${customer.color}15`, color: customer.color }}
                  >
                    {customer.initials}
                  </div>
                  <div className="admin-list-info">
                    <div className="admin-list-primary">{customer.name}</div>
                    <div className="admin-list-secondary">{customer.mobile}</div>
                  </div>
                  <div className="admin-list-value">
                    {customer.orders} order{customer.orders !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="admin-section-card">
            <div className="admin-section-header">
              <span className="admin-section-title">Low Stock Products</span>
              <button className="admin-view-all-btn" type="button">
                View All <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
              </button>
            </div>
            <div className="admin-section-body">
              {LOW_STOCK.map((product) => (
                <div key={product.name} className="admin-list-item">
                  <div
                    className="admin-list-avatar"
                    style={{ background: `${product.color}15`, color: product.color, borderRadius: 8 }}
                  >
                    <AlertTriangle size={16} />
                  </div>
                  <div className="admin-list-info">
                    <div className="admin-list-primary">{product.name}</div>
                    <div className="admin-list-secondary">Current stock</div>
                  </div>
                  <div
                    className="admin-list-value"
                    style={{ color: product.stock <= 3 ? "#ef4444" : "#f59e0b" }}
                  >
                    {product.stock} {product.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Overview Placeholder */}
          <div className="admin-section-card">
            <div className="admin-section-header">
              <span className="admin-section-title">Sales Overview</span>
              <button className="admin-view-all-btn" type="button">
                View Report <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
              </button>
            </div>
            <div
              className="admin-section-body"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                color: "#ccc",
              }}
            >
              <IndianRupee size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 14, color: "#aaa", margin: 0 }}>
                Sales chart will be displayed here
              </p>
              <p style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>
                Coming in next update
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
