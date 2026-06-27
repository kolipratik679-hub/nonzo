import {
  IndianRupee,
  ShoppingCart,
  Clock,
  ChefHat,
  PackageCheck,
  Truck,
  CircleCheck,
  XCircle,
  Plus,
  Eye,
  Warehouse,
  Users,
  Ticket,
  BarChart3,
  AlertTriangle,
  CreditCard,
  Timer,
  TruckIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════════════════ */

export interface BusinessHealthCard {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  comparison: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accentColor: string;
}

export interface RevenuePeriod {
  label: string;
  value: string;
  numericValue: number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface LiveAlert {
  id: string;
  type: "warning" | "error" | "info" | "urgent";
  title: string;
  message: string;
  time: string;
  icon: LucideIcon;
}

export interface PipelineStage {
  id: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: "Confirmed" | "Pending" | "Delivered" | "Cancelled" | "Preparing" | "Packed";
  time: string;
  avatar: string;
}

export interface Customer {
  name: string;
  mobile: string;
  orders: number;
  initials: string;
  color: string;
  joined: string;
  spent: string;
}

export interface LowStockProduct {
  name: string;
  stock: number;
  maxStock: number;
  unit: string;
  color: string;
  sku: string;
}

export interface SalesDataPoint {
  day: string;
  value: number;
}

export interface RevenueChartPoint {
  day: string;
  revenue: number;
  orders: number;
  growth: string;
}


/* ═══════════════════════════════════════════════════════════
   1. BUSINESS HEALTH CARDS
   ═══════════════════════════════════════════════════════════ */

export const BUSINESS_HEALTH_CARDS: BusinessHealthCard[] = [
  {
    id: "todays-revenue",
    title: "Today's Revenue",
    value: "₹18,450",
    trend: "up",
    trendValue: "+12.5%",
    comparison: "vs yesterday ₹16,400",
    icon: IndianRupee,
    iconBg: "rgba(168, 85, 247, 0.12)",
    iconColor: "#a855f7",
    accentColor: "#a855f7",
  },
  {
    id: "todays-orders",
    title: "Today's Orders",
    value: "34",
    trend: "up",
    trendValue: "+8",
    comparison: "vs yesterday 26",
    icon: ShoppingCart,
    iconBg: "rgba(59, 130, 246, 0.12)",
    iconColor: "#3b82f6",
    accentColor: "#3b82f6",
  },
  {
    id: "pending-orders",
    title: "Pending Orders",
    value: "12",
    trend: "down",
    trendValue: "−3",
    comparison: "3 need attention",
    icon: Clock,
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#f59e0b",
    accentColor: "#f59e0b",
  },
  {
    id: "preparing-orders",
    title: "Preparing",
    value: "8",
    trend: "neutral",
    trendValue: "0",
    comparison: "in kitchen now",
    icon: ChefHat,
    iconBg: "rgba(249, 115, 22, 0.12)",
    iconColor: "#f97316",
    accentColor: "#f97316",
  },
  {
    id: "packed-orders",
    title: "Packed",
    value: "5",
    trend: "up",
    trendValue: "+2",
    comparison: "ready for pickup",
    icon: PackageCheck,
    iconBg: "rgba(6, 182, 212, 0.12)",
    iconColor: "#06b6d4",
    accentColor: "#06b6d4",
  },
  {
    id: "out-for-delivery",
    title: "Out for Delivery",
    value: "6",
    trend: "up",
    trendValue: "+1",
    comparison: "on the way",
    icon: Truck,
    iconBg: "rgba(99, 102, 241, 0.12)",
    iconColor: "#6366f1",
    accentColor: "#6366f1",
  },
  {
    id: "delivered-today",
    title: "Delivered Today",
    value: "21",
    trend: "up",
    trendValue: "+5",
    comparison: "vs yesterday 16",
    icon: CircleCheck,
    iconBg: "rgba(16, 185, 129, 0.12)",
    iconColor: "#10b981",
    accentColor: "#10b981",
  },
  {
    id: "cancelled-today",
    title: "Cancelled Today",
    value: "3",
    trend: "down",
    trendValue: "−2",
    comparison: "vs yesterday 5",
    icon: XCircle,
    iconBg: "rgba(239, 68, 68, 0.12)",
    iconColor: "#ef4444",
    accentColor: "#ef4444",
  },
];

/* ═══════════════════════════════════════════════════════════
   2. REVENUE SUMMARY
   ═══════════════════════════════════════════════════════════ */

export const REVENUE_SUMMARY: RevenuePeriod[] = [
  {
    label: "Today",
    value: "₹18,450",
    numericValue: 18450,
    change: "+12.5%",
    changeType: "positive",
  },
  {
    label: "Yesterday",
    value: "₹16,400",
    numericValue: 16400,
    change: "+8.2%",
    changeType: "positive",
  },
  {
    label: "Last 7 Days",
    value: "₹1,12,800",
    numericValue: 112800,
    change: "+15.3%",
    changeType: "positive",
  },
  {
    label: "Last 30 Days",
    value: "₹4,82,350",
    numericValue: 482350,
    change: "+18.2%",
    changeType: "positive",
  },
];

export const MINI_CHART_DATA: number[] = [42, 65, 55, 78, 60, 85, 72, 90, 68, 95, 82, 88];

export const REVENUE_CHART_DATA: RevenueChartPoint[] = [
  { day: "Mon", revenue: 12400, orders: 24, growth: "+5.2%" },
  { day: "Tue", revenue: 15800, orders: 31, growth: "+8.1%" },
  { day: "Wed", revenue: 13200, orders: 26, growth: "-2.4%" },
  { day: "Thu", revenue: 18900, orders: 36, growth: "+11.5%" },
  { day: "Fri", revenue: 24500, orders: 48, growth: "+19.2%" },
  { day: "Sat", revenue: 19500, orders: 39, growth: "+12.0%" },
  { day: "Sun", revenue: 18450, orders: 34, growth: "+12.5%" },
];


/* ═══════════════════════════════════════════════════════════
   3. QUICK ACTIONS
   ═══════════════════════════════════════════════════════════ */

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "add-product", label: "Add Product", icon: Plus, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
  { id: "view-orders", label: "View Orders", icon: Eye, color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" },
  { id: "inventory", label: "Inventory", icon: Warehouse, color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)" },
  { id: "customers", label: "Customers", icon: Users, color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)" },
  { id: "coupons", label: "Coupons", icon: Ticket, color: "#f97316", bgColor: "rgba(249, 115, 22, 0.1)" },
  { id: "reports", label: "Reports", icon: BarChart3, color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.1)" },
];

/* ═══════════════════════════════════════════════════════════
   4. LIVE ALERTS
   ═══════════════════════════════════════════════════════════ */

export const LIVE_ALERTS: LiveAlert[] = [
  {
    id: "alert-1",
    type: "warning",
    title: "Low Stock Alert",
    message: "Tiger Prawns (Large) — only 5 kg remaining",
    time: "2 min ago",
    icon: AlertTriangle,
  },
  {
    id: "alert-2",
    type: "error",
    title: "Failed Payment",
    message: "Order NZO-20260626-019 — payment gateway timeout",
    time: "8 min ago",
    icon: CreditCard,
  },
  {
    id: "alert-3",
    type: "urgent",
    title: "Pending Orders",
    message: "3 orders pending for over 15 minutes",
    time: "12 min ago",
    icon: Timer,
  },
  {
    id: "alert-4",
    type: "info",
    title: "Delivery Delay",
    message: "Order NZO-20260626-007 — rider stuck in traffic",
    time: "18 min ago",
    icon: TruckIcon,
  },
];

/* ═══════════════════════════════════════════════════════════
   5. ORDER PIPELINE
   ═══════════════════════════════════════════════════════════ */

export const ORDER_PIPELINE: PipelineStage[] = [
  { id: "pending", label: "Pending", count: 12, color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.12)" },
  { id: "confirmed", label: "Confirmed", count: 9, color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.12)" },
  { id: "preparing", label: "Preparing", count: 8, color: "#f97316", bgColor: "rgba(249, 115, 22, 0.12)" },
  { id: "packed", label: "Packed", count: 5, color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.12)" },
  { id: "out-for-delivery", label: "Out for Delivery", count: 6, color: "#6366f1", bgColor: "rgba(99, 102, 241, 0.12)" },
  { id: "delivered", label: "Delivered", count: 21, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.12)" },
];

/* ═══════════════════════════════════════════════════════════
   6. RECENT ORDERS (redesigned)
   ═══════════════════════════════════════════════════════════ */

export const RECENT_ORDERS: RecentOrder[] = [
  { id: "NZO-20260626-001", customer: "Rahul Sharma", items: 3, total: "₹1,249", status: "Confirmed", time: "10 min ago", avatar: "RS" },
  { id: "NZO-20260626-002", customer: "Priya Patel", items: 2, total: "₹789", status: "Pending", time: "25 min ago", avatar: "PP" },
  { id: "NZO-20260626-003", customer: "Amit Singh", items: 5, total: "₹2,150", status: "Delivered", time: "1 hr ago", avatar: "AS" },
  { id: "NZO-20260626-004", customer: "Sneha Desai", items: 1, total: "₹449", status: "Preparing", time: "2 hrs ago", avatar: "SD" },
  { id: "NZO-20260626-005", customer: "Vikram Joshi", items: 4, total: "₹1,890", status: "Cancelled", time: "3 hrs ago", avatar: "VJ" },
  { id: "NZO-20260626-006", customer: "Meera Nair", items: 2, total: "₹980", status: "Packed", time: "3 hrs ago", avatar: "MN" },
];

/* ═══════════════════════════════════════════════════════════
   7. LATEST CUSTOMERS (redesigned)
   ═══════════════════════════════════════════════════════════ */

export const LATEST_CUSTOMERS: Customer[] = [
  { name: "Aarav Mehta", mobile: "98XXXX1234", orders: 3, initials: "AM", color: "#3b82f6", joined: "Today", spent: "₹2,340" },
  { name: "Ishita Reddy", mobile: "87XXXX5678", orders: 1, initials: "IR", color: "#a855f7", joined: "Yesterday", spent: "₹780" },
  { name: "Rohan Naik", mobile: "90XXXX9012", orders: 2, initials: "RN", color: "#10b981", joined: "2 days ago", spent: "₹1,560" },
  { name: "Kavya Iyer", mobile: "91XXXX3456", orders: 5, initials: "KI", color: "#f59e0b", joined: "3 days ago", spent: "₹4,200" },
  { name: "Arjun Rao", mobile: "99XXXX7890", orders: 2, initials: "AR", color: "#06b6d4", joined: "5 days ago", spent: "₹1,890" },
];

/* ═══════════════════════════════════════════════════════════
   8. LOW STOCK PRODUCTS (redesigned)
   ═══════════════════════════════════════════════════════════ */

export const LOW_STOCK: LowStockProduct[] = [
  { name: "Surmai / King Fish", stock: 3, maxStock: 25, unit: "kg", color: "#ef4444", sku: "SF-001" },
  { name: "Tiger Prawns (Large)", stock: 5, maxStock: 20, unit: "kg", color: "#f59e0b", sku: "TP-002" },
  { name: "Blue Crab", stock: 2, maxStock: 15, unit: "pcs", color: "#ef4444", sku: "BC-003" },
  { name: "Pomfret (White)", stock: 4, maxStock: 20, unit: "kg", color: "#f59e0b", sku: "PW-004" },
  { name: "Rohu Fish", stock: 6, maxStock: 30, unit: "kg", color: "#f59e0b", sku: "RF-005" },
];

/* ═══════════════════════════════════════════════════════════
   9. SALES OVERVIEW (7-day)
   ═══════════════════════════════════════════════════════════ */

export const SALES_OVERVIEW_DATA: SalesDataPoint[] = [
  { day: "Mon", value: 12400 },
  { day: "Tue", value: 15800 },
  { day: "Wed", value: 13200 },
  { day: "Thu", value: 18900 },
  { day: "Fri", value: 22100 },
  { day: "Sat", value: 19500 },
  { day: "Sun", value: 18450 },
];
