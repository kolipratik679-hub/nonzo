"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ArrowRight,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// ─── SECTION TITLE ───────────────────────────────────────────
interface SectionTitleProps {
  label: string;
  dotColor?: string;
}

export function SectionTitle({ label, dotColor = "#3b82f6" }: SectionTitleProps) {
  return (
    <div className="dash-section-label">
      <span className="dash-section-dot" style={{ background: dotColor }} />
      {label}
    </div>
  );
}

// ─── STAT CARD (KPI CARD) ────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  comparison?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = "rgba(200, 16, 46, 0.1)",
  iconColor = "#C8102E",
  trend,
  trendValue,
  comparison,
  href,
}: StatCardProps) {
  const CardContent = (
    <div className={`dash-health-card ${href ? "clickable-card" : ""}`}>
      <div className="dash-health-card-top">
        <div
          className="dash-health-icon"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={18} />
        </div>
        {trend && (
          <div
            className={`dash-health-trend ${
              trend === "up"
                ? "positive"
                : trend === "down"
                  ? "negative"
                  : "neutral"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp size={11} />
            ) : trend === "down" ? (
              <TrendingDown size={11} />
            ) : (
              <Minus size={11} />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="dash-health-value">{value}</div>
      <div className="dash-health-title">{title}</div>
      {comparison && <div className="dash-health-comparison">{comparison}</div>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}

// ─── WIDGET HEADER ───────────────────────────────────────────
interface WidgetHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  filterDropdown?: React.ReactNode;
  viewAllHref?: string;
  viewAllText?: string;
  onViewAllClick?: () => void;
  actionMenuPlaceholder?: boolean;
}

export function WidgetHeader({
  title,
  subtitle,
  filterDropdown,
  viewAllHref,
  viewAllText = "View All",
  onViewAllClick,
  actionMenuPlaceholder = true,
}: WidgetHeaderProps) {
  return (
    <div className="dash-card-header">
      <div className="dash-card-header-left">
        <div>
          {typeof title === "string" ? (
            <h3 className="dash-card-title">{title}</h3>
          ) : (
            title
          )}
          {subtitle && <p className="dash-card-subtitle">{subtitle}</p>}
        </div>
        {filterDropdown && <div className="dash-header-filter-wrapper">{filterDropdown}</div>}
      </div>
      <div className="dash-card-header-actions">
        {viewAllHref ? (
          <Link href={viewAllHref} className="dash-view-all-btn">
            {viewAllText} <ArrowRight size={12} />
          </Link>
        ) : onViewAllClick ? (
          <button type="button" onClick={onViewAllClick} className="dash-view-all-btn">
            {viewAllText} <ArrowRight size={12} />
          </button>
        ) : null}
        {actionMenuPlaceholder && (
          <button
            type="button"
            className="dash-action-menu-trigger"
            aria-label="Actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FILTER BAR ──────────────────────────────────────────────
interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export function FilterBar({ options, selectedValue, onChange }: FilterBarProps) {
  return (
    <div className="dash-filter-bar">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`dash-filter-pill ${selectedValue === option.value ? "active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ─── QUICK ACTION CARD ───────────────────────────────────────
interface QuickActionCardProps {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href?: string;
  onClick?: () => void;
}

export function QuickActionCard({
  label,
  icon: Icon,
  color,
  bgColor,
  href,
  onClick,
}: QuickActionCardProps) {
  const btnContent = (
    <>
      <div className="dash-quick-action-icon" style={{ background: bgColor, color }}>
        <Icon size={20} />
      </div>
      <span className="dash-quick-action-label">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="dash-quick-action-btn" style={{ textDecoration: "none" }}>
        {btnContent}
      </Link>
    );
  }

  return (
    <button type="button" className="dash-quick-action-btn" onClick={onClick} aria-label={label}>
      {btnContent}
    </button>
  );
}

// ─── ALERT CARD ──────────────────────────────────────────────
interface AlertCardProps {
  title: string;
  message: string;
  time: string;
  icon: React.ElementType;
  type: "warning" | "error" | "info" | "urgent";
}

const ALERT_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  warning: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", label: "WARNING" },
  error: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", label: "CRITICAL" },
  urgent: { color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", label: "URGENT" },
  info: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", label: "INFO" },
};

export function AlertCard({ title, message, time, icon: Icon, type }: AlertCardProps) {
  const style = ALERT_STYLES[type] || ALERT_STYLES.info;
  return (
    <div className={`dash-alert-item dash-alert-${type}`} style={{ borderLeftColor: style.color }}>
      <div className="dash-alert-icon" style={{ background: style.bg, color: style.color }}>
        <Icon size={16} />
      </div>
      <div className="dash-alert-content">
        <div className="dash-alert-title-row">
          <span className="dash-alert-title">{title}</span>
          <span className="dash-alert-badge" style={{ color: style.color, background: style.bg }}>
            {style.label}
          </span>
        </div>
        <div className="dash-alert-message">{message}</div>
      </div>
      <div className="dash-alert-time">{time}</div>
    </div>
  );
}

// ─── DASHBOARD CARD (CONTAINER) ──────────────────────────────
interface DashboardCardProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
  filterDropdown?: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: string;
  className?: string;
  children: React.ReactNode;
  href?: string;
}

export function DashboardCard({
  title,
  subtitle,
  viewAllHref,
  viewAllText,
  filterDropdown,
  scrollable = false,
  maxHeight = "320px",
  className = "",
  children,
  href,
}: DashboardCardProps) {
  const router = useRouter();
  const cardClasses = `dash-card ${href ? "clickable-card" : ""} ${className}`.trim();

  const handleCardClick = (e: React.MouseEvent) => {
    if (!href) return;
    const target = e.target as HTMLElement;
    // Do not navigate if user clicked on a link, button, select, or input
    if (
      target.closest("a") ||
      target.closest("button") ||
      target.closest("select") ||
      target.closest("input")
    ) {
      return;
    }
    router.push(href);
  };

  const CardContent = (
    <>
      {title && (
        <WidgetHeader
          title={title}
          subtitle={subtitle}
          filterDropdown={filterDropdown}
          viewAllHref={viewAllHref}
          viewAllText={viewAllText}
          actionMenuPlaceholder={true}
        />
      )}
      <div
        className="dash-card-body"
        style={
          scrollable
            ? {
                maxHeight: maxHeight,
                overflowY: "auto",
                position: "relative",
              }
            : undefined
        }
      >
        {children}
      </div>
    </>
  );

  return (
    <div
      className={cardClasses}
      onClick={href ? handleCardClick : undefined}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={
        href
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(href);
              }
            }
          : undefined
      }
      style={href ? { cursor: "pointer", outline: "none" } : undefined}
    >
      {CardContent}
    </div>
  );
}
