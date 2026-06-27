"use client";

import React from "react";
import { BUSINESS_HEALTH_CARDS } from "./dashboard-data";
import { StatCard, SectionTitle } from "../reusable-components";

// ─── Map Card IDs to Destination Routes ───────────────────
const CARD_HREFS: Record<string, string> = {
  "todays-revenue": "/admin/reports",
  "todays-orders": "/admin/orders",
  "pending-orders": "/admin/orders",
  "preparing-orders": "/admin/orders",
  "packed-orders": "/admin/orders",
  "out-for-delivery": "/admin/delivery",
  "delivered-today": "/admin/orders",
  "cancelled-today": "/admin/orders",
};

// ─── Component ───────────────────────────────────────────
export function BusinessHealthCards() {
  return (
    <div className="dash-section">
      <SectionTitle label="Business Health" dotColor="#3b82f6" />
      <div className="dash-health-grid">
        {BUSINESS_HEALTH_CARDS.map((card) => (
          <StatCard
            key={card.id}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
            trend={card.trend}
            trendValue={card.trendValue}
            comparison={card.comparison}
            href={CARD_HREFS[card.id] || "/admin"}
          />
        ))}
      </div>
    </div>
  );
}
