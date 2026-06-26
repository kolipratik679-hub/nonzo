import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface AdminStatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

// ─── Component ───────────────────────────────────────────
export function AdminStatCard({
  title,
  value,
  change,
  changeType = "positive",
  icon: Icon,
  iconBg,
  iconColor,
}: AdminStatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card-header">
        <div>
          <div className="admin-stat-card-value">{value}</div>
          <div className="admin-stat-card-label">{title}</div>
        </div>
        <div
          className="admin-stat-card-icon"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={20} />
        </div>
      </div>
      {change && (
        <span className={`admin-stat-card-change ${changeType}`}>
          {changeType === "positive" ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {change}
        </span>
      )}
    </div>
  );
}
