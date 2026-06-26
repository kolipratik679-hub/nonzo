"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// ─── Types ───────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "MANAGER" | "VIEWER";
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  adminLogin: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
}

// ─── Hardcoded Credentials (to be replaced with DB in future) ───
const ADMIN_CREDENTIALS = [
  {
    email: "admin@nonzo.in",
    password: "admin123",
    user: {
      id: "admin-001",
      name: "NONZO Admin",
      email: "admin@nonzo.in",
      role: "SUPER_ADMIN" as const,
    },
  },
];

const STORAGE_KEY = "nonzo_admin_auth";
const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin";

// ─── Context ─────────────────────────────────────────────
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AdminUser;
        if (parsed && parsed.id && parsed.email) {
          setAdminUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  // Redirect logic — runs after loading is complete
  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === LOGIN_PATH;
    const isAdminRoute = pathname.startsWith("/admin");

    if (isAdminRoute && !isLoginPage && !adminUser) {
      // Not logged in → redirect to login
      router.replace(LOGIN_PATH);
    } else if (isLoginPage && adminUser) {
      // Already logged in → redirect to dashboard
      router.replace(DASHBOARD_PATH);
    }
  }, [isLoading, adminUser, pathname, router]);

  const adminLogin = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean
    ): Promise<{ success: boolean; error?: string }> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const match = ADMIN_CREDENTIALS.find(
        (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );

      if (!match) {
        return { success: false, error: "Invalid email or password" };
      }

      setAdminUser(match.user);

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(match.user));
      } else {
        // Store in sessionStorage-like behavior by using localStorage
        // but clearing on provider unmount is complex; for now store always
        localStorage.setItem(STORAGE_KEY, JSON.stringify(match.user));
      }

      return { success: true };
    },
    []
  );

  const adminLogout = useCallback(() => {
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.replace(LOGIN_PATH);
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminLoggedIn: !!adminUser,
        isLoading,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
