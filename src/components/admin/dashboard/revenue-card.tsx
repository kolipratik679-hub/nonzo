"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { REVENUE_SUMMARY, REVENUE_CHART_DATA } from "./dashboard-data";
import { DashboardCard } from "../reusable-components";

// ─── Component ───────────────────────────────────────────
export function RevenueCard() {
  const [period, setPeriod] = useState("7days");
  const maxRevenue = Math.max(...REVENUE_CHART_DATA.map((d) => d.revenue));

  // Determine standard Y-axis scale up to 25k in 5k steps
  const yAxisTicks = [25000, 20000, 15000, 10000, 5000, 0];

  const filterSelect = (
    <select
      value={period}
      onChange={(e) => setPeriod(e.target.value)}
      className="dash-header-select"
      onClick={(e) => e.stopPropagation()} // Prevent card navigation when selecting filter
    >
      <option value="today">Today</option>
      <option value="yesterday">Yesterday</option>
      <option value="7days">Last 7 Days</option>
      <option value="30days">Last 30 Days</option>
    </select>
  );

  return (
    <DashboardCard
      title="Revenue Overview"
      subtitle="Financial performance & revenue analytics"
      filterDropdown={filterSelect}
      viewAllHref="/admin/reports"
      viewAllText="View Report"
      href="/admin/reports"
    >
      <div className="dash-revenue-top-summary">
        <div className="dash-revenue-total-box">
          <span className="dash-revenue-total-label">Total Revenue (Last 30 Days)</span>
          <div className="dash-revenue-total-value-row">
            <span className="dash-revenue-total-value">₹4,82,350</span>
            <span className="dash-revenue-badge-positive">+18.2% vs last month</span>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="dash-revenue-grid">
          {REVENUE_SUMMARY.map((summary) => (
            <div key={summary.label} className="dash-revenue-period">
              <div className="dash-revenue-period-label">{summary.label}</div>
              <div className="dash-revenue-period-value">{summary.value}</div>
              <div className={`dash-revenue-period-change ${summary.changeType}`}>
                <TrendingUp size={11} />
                {summary.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Analytics Chart */}
      <div className="dash-enterprise-chart-container">
        <div className="dash-enterprise-chart-header">
          <span className="dash-enterprise-chart-title">Revenue & Orders Trend</span>
          <div className="dash-enterprise-legend">
            <span className="dash-legend-item">
              <span className="dash-legend-color regular" /> Daily Revenue
            </span>
            <span className="dash-legend-item">
              <span className="dash-legend-color highest" /> Peak Day (#C8102E)
            </span>
          </div>
        </div>

        <div className="dash-enterprise-chart-wrapper">
          {/* Y-Axis Labels */}
          <div className="dash-enterprise-y-axis">
            {yAxisTicks.map((tick) => (
              <span key={tick} className="dash-enterprise-y-label">
                ₹{tick === 0 ? "0" : `${tick / 1000}k`}
              </span>
            ))}
          </div>

          {/* Chart Graphic Area */}
          <div className="dash-enterprise-chart-area">
            {/* Subtle Gridlines */}
            <div className="dash-enterprise-gridlines">
              {yAxisTicks.map((tick) => (
                <div key={tick} className="dash-enterprise-gridline" />
              ))}
            </div>

            {/* Bars Area */}
            <div className="dash-enterprise-bars">
              {REVENUE_CHART_DATA.map((point, idx) => {
                const heightPercentage = (point.revenue / 25000) * 100;
                const isHighest = point.revenue === maxRevenue;

                return (
                  <div key={point.day} className="dash-enterprise-bar-col">
                    <div className="dash-enterprise-bar-track">
                      <div
                        className={`dash-enterprise-bar-fill ${isHighest ? "highest" : ""}`}
                        style={{
                          height: `${Math.min(heightPercentage, 100)}%`,
                          animationDelay: `${idx * 0.06}s`,
                        }}
                      >
                        {/* Rich Hover Tooltip */}
                        <div className="dash-enterprise-tooltip">
                          <div className="dash-tooltip-header">
                            <span className="dash-tooltip-day">{point.day} Performance</span>
                            {isHighest && <span className="dash-tooltip-peak-badge">Peak Day</span>}
                          </div>
                          <div className="dash-tooltip-row">
                            <span className="dash-tooltip-label">Revenue:</span>
                            <span className="dash-tooltip-val revenue">₹{point.revenue.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="dash-tooltip-row">
                            <span className="dash-tooltip-label">Orders:</span>
                            <span className="dash-tooltip-val">{point.orders}</span>
                          </div>
                          <div className="dash-tooltip-row">
                            <span className="dash-tooltip-label">Growth:</span>
                            <span className={`dash-tooltip-val ${point.growth.startsWith("+") ? "pos" : "neg"}`}>
                              {point.growth}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dash-enterprise-x-label">{point.day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
