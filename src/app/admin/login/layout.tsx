"use client";

import React from "react";

/**
 * Login page uses a minimal layout — no sidebar or header.
 * The admin layout.tsx above still wraps this with AdminAuthProvider
 * and the full-viewport overlay, so the login page renders cleanly
 * on the black admin background.
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
