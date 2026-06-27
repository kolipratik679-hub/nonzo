"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ORDER_PIPELINE } from "./dashboard-data";
import { SectionTitle } from "../reusable-components";

// ─── Component ───────────────────────────────────────────
export function OrderPipeline() {
  return (
    <div className="dash-section">
      <SectionTitle label="Order Pipeline" dotColor="#6366f1" />
      <Link href="/admin/orders" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="dash-pipeline-card clickable-card">
          <div className="dash-pipeline-track">
            {ORDER_PIPELINE.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <div className="dash-pipeline-stage">
                  <div
                    className="dash-pipeline-count"
                    style={{ background: stage.bgColor, color: stage.color }}
                  >
                    {stage.count}
                  </div>
                  <div className="dash-pipeline-label">{stage.label}</div>
                </div>
                {idx < ORDER_PIPELINE.length - 1 && (
                  <div className="dash-pipeline-arrow">
                    <ChevronRight size={18} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
