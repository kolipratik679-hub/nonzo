"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { LOW_STOCK } from "./dashboard-data";
import { DashboardCard } from "../reusable-components";

// ─── Component ───────────────────────────────────────────
export function LowStockCard() {
  const [filter, setFilter] = useState("all");

  const filterSelect = (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="dash-header-select"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="all">All Levels</option>
      <option value="critical">Critical (≤ 3)</option>
      <option value="warning">Warning (&gt; 3)</option>
    </select>
  );

  const filteredStock = LOW_STOCK.filter((product) => {
    if (filter === "all") return true;
    if (filter === "critical") return product.stock <= 3;
    if (filter === "warning") return product.stock > 3;
    return true;
  });

  return (
    <DashboardCard
      title="Low Stock Products"
      filterDropdown={filterSelect}
      viewAllHref="/admin/inventory"
      href="/admin/inventory" // Make card clickable to Inventory
      scrollable={true}
      maxHeight="250px"
    >
      <div className="dash-stock-list">
        {filteredStock.map((product) => {
          const percentage = Math.round((product.stock / product.maxStock) * 100);
          return (
            <div key={product.sku} className="dash-stock-row">
              <div className="dash-stock-left">
                <div
                  className="dash-stock-icon"
                  style={{
                    background: `${product.color}12`,
                    color: product.color,
                  }}
                >
                  <AlertTriangle size={14} />
                </div>
                <div className="dash-stock-info">
                  <div className="dash-stock-name">{product.name}</div>
                  <div className="dash-stock-sku">SKU: {product.sku}</div>
                </div>
              </div>
              <div className="dash-stock-right">
                <div className="dash-stock-level">
                  <span style={{ color: product.stock <= 3 ? "#ef4444" : "#f59e0b", fontWeight: 700 }}>
                    {product.stock} {product.unit}
                  </span>
                  <span className="dash-stock-max"> / {product.maxStock} {product.unit}</span>
                </div>
                <div className="dash-stock-bar-track">
                  <div
                    className="dash-stock-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      background: product.stock <= 3 ? "#ef4444" : "#f59e0b",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {filteredStock.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: "13px" }}>
            No low-stock products match this filter.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
