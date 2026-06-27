"use client";

import React, { useState } from "react";
import { LIVE_ALERTS } from "./dashboard-data";
import { DashboardCard, AlertCard } from "../reusable-components";

// ─── Component ───────────────────────────────────────────
export function LiveAlerts() {
  const [filter, setFilter] = useState("all");

  const filterSelect = (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="dash-header-select"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="all">All Alerts</option>
      <option value="critical">Critical</option>
      <option value="warning">Warning</option>
      <option value="info">Info</option>
    </select>
  );

  const filteredAlerts = LIVE_ALERTS.filter((alert) => {
    if (filter === "all") return true;
    if (filter === "critical") return alert.type === "error" || alert.type === "urgent";
    if (filter === "warning") return alert.type === "warning";
    if (filter === "info") return alert.type === "info";
    return true;
  });

  return (
    <DashboardCard
      title={
        <span className="dash-card-title">
          <span className="dash-alerts-pulse" style={{ marginRight: "8px" }} />
          Live Alerts
          <span className="dash-alerts-count" style={{ marginLeft: "8px", fontSize: "11px", fontWeight: 600, color: "#888", background: "#f3f4f6", padding: "2px 8px", borderRadius: "10px" }}>
            {filteredAlerts.length} active
          </span>
        </span>
      }
      filterDropdown={filterSelect}
      scrollable={true}
      maxHeight="250px"
    >
      <div className="dash-alerts-list">
        {filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            title={alert.title}
            message={alert.message}
            time={alert.time}
            icon={alert.icon}
            type={alert.type}
          />
        ))}
        {filteredAlerts.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: "13px" }}>
            No active alerts in this category.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
