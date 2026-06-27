"use client";

import React, { useState } from "react";
import { LATEST_CUSTOMERS } from "./dashboard-data";
import { DashboardCard } from "../reusable-components";

// ─── Component ───────────────────────────────────────────
export function LatestCustomersCard() {
  const [filter, setFilter] = useState("all");

  const filterSelect = (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="dash-header-select"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="all">All Customers</option>
      <option value="new">New</option>
      <option value="returning">Returning</option>
    </select>
  );

  const filteredCustomers = LATEST_CUSTOMERS.filter((customer) => {
    if (filter === "all") return true;
    if (filter === "new") return customer.orders <= 2;
    if (filter === "returning") return customer.orders > 2;
    return true;
  });

  return (
    <DashboardCard
      title="Latest Customers"
      filterDropdown={filterSelect}
      viewAllHref="/admin/customers"
      href="/admin/customers" // Make card clickable to Customers
      scrollable={true}
      maxHeight="250px"
    >
      <div className="dash-customers-list">
        {filteredCustomers.map((customer) => (
          <div key={customer.mobile} className="dash-customer-row">
            <div
              className="dash-customer-avatar"
              style={{ background: `${customer.color}15`, color: customer.color }}
            >
              {customer.initials}
            </div>
            <div className="dash-customer-info">
              <div className="dash-customer-name">{customer.name}</div>
              <div className="dash-customer-meta">
                {customer.mobile} • Joined {customer.joined}
              </div>
            </div>
            <div className="dash-customer-stats">
              <div className="dash-customer-orders">
                {customer.orders} order{customer.orders !== 1 ? "s" : ""}
              </div>
              <div className="dash-customer-spent">{customer.spent}</div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: "13px" }}>
            No customers match this filter.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
