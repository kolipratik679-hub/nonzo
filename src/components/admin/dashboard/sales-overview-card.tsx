"use client";

import React, { useState } from "react";
import { SALES_OVERVIEW_DATA } from "./dashboard-data";
import { DashboardCard } from "../reusable-components";

// ─── Component ───────────────────────────────────────────
export function SalesOverviewCard() {
  const [filter, setFilter] = useState("week");
  const maxVal = Math.max(...SALES_OVERVIEW_DATA.map((d) => d.value));
  const total = SALES_OVERVIEW_DATA.reduce((sum, d) => sum + d.value, 0);
  const avg = Math.round(total / SALES_OVERVIEW_DATA.length);

  const filterSelect = (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="dash-header-select"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="week">Weekly</option>
      <option value="month">Monthly</option>
    </select>
  );

  return (
    <DashboardCard
      title="Sales Overview"
      subtitle={`Weekly total: ₹${total.toLocaleString("en-IN")} · Avg: ₹${avg.toLocaleString("en-IN")}/day`}
      filterDropdown={filterSelect}
      viewAllHref="/admin/reports"
      viewAllText="View Report"
      href="/admin/reports"
    >
      {/* Y-axis + Chart area */}
      <div className="dash-sales-chart-wrapper">
        <div className="dash-sales-y-axis">
          {[maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map((val) => (
            <span key={val} className="dash-sales-y-label">
              ₹{(val / 1000).toFixed(0)}k
            </span>
          ))}
        </div>
        <div className="dash-sales-chart-area">
          {/* Grid lines */}
          <div className="dash-sales-gridlines">
            <div className="dash-sales-gridline" />
            <div className="dash-sales-gridline" />
            <div className="dash-sales-gridline" />
            <div className="dash-sales-gridline" />
          </div>

          {/* Bars */}
          <div className="dash-sales-chart">
            {SALES_OVERVIEW_DATA.map((point, idx) => {
              const percentage = (point.value / maxVal) * 100;
              const isHighest = point.value === maxVal;
              return (
                <div key={point.day} className="dash-sales-bar-col">
                  <div className="dash-sales-bar-track">
                    <div
                      className={`dash-sales-bar-fill ${isHighest ? "highest" : ""}`}
                      style={{
                        height: `${percentage}%`,
                        animationDelay: `${idx * 0.08}s`,
                      }}
                    >
                      <span className="dash-sales-bar-tooltip">
                        ₹{point.value.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="dash-sales-bar-label">{point.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
