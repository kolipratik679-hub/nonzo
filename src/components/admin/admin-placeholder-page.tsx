import React from "react";
import { Clock } from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface AdminPlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

// ─── Component ───────────────────────────────────────────
export function AdminPlaceholderPage({
  title,
  description,
  icon: Icon,
}: AdminPlaceholderPageProps) {
  return (
    <div className="admin-placeholder">
      <div className="admin-placeholder-icon">
        <Icon size={36} />
      </div>
      <h2 className="admin-placeholder-title">{title}</h2>
      <p className="admin-placeholder-desc">{description}</p>
      <div className="admin-placeholder-badge">
        <Clock size={14} />
        Coming Soon
      </div>
    </div>
  );
}
