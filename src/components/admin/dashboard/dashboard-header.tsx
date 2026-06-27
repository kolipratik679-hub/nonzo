"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Activity } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────
function getISTDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Component ───────────────────────────────────────────
export function DashboardHeader() {
  const { adminUser } = useAdminAuth();
  const [istDate, setIstDate] = useState<Date>(getISTDate);

  useEffect(() => {
    const timer = setInterval(() => {
      setIstDate(getISTDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = istDate.getHours();
  const greeting = getGreeting(hour);
  const firstName = adminUser?.name?.split(" ")[0] || "Admin";

  return (
    <div className="dash-greeting-card">
      <div className="dash-greeting-left">
        <h2 className="dash-greeting-title">{greeting} 👋</h2>
        <p className="dash-greeting-subtitle">
          Welcome back, <span className="dash-greeting-name">{firstName}</span> — Here&apos;s today&apos;s summary
        </p>
      </div>
      <div className="dash-greeting-right">
        <div className="dash-greeting-status">
          <Activity size={13} className="dash-greeting-status-icon" />
          <span className="dash-greeting-status-text">System Active</span>
        </div>
        <div className="dash-greeting-divider" />
        <div className="dash-greeting-time-wrapper">
          <span className="dash-greeting-label">Live IST</span>
          <span className="dash-greeting-time">{formatTime(istDate)}</span>
        </div>
        <div className="dash-greeting-divider" />
        <div className="dash-greeting-date-wrapper">
          <span className="dash-greeting-label">Date</span>
          <span className="dash-greeting-date">{formatDate(istDate)}</span>
        </div>
      </div>
    </div>
  );
}
