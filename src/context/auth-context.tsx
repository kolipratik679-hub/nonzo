"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserAddress {
  flat: string;
  area: string;
  city: string;
  pincode: string;
  phone: string;
  tag: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UserProfile {
  name: string;
  mobile: string;
  email?: string;
  address?: UserAddress;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (name: string, mobile: string, email?: string) => void;
  logout: () => void;
  updateUserAddress: (address: UserProfile["address"]) => void;
  sendOtp: (mobile: string) => Promise<boolean>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ success: boolean; isExisting: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("nonzo_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse nonzo_user from localStorage", e);
      }
    }

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("nonzo_user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("nonzo_user");
        }
      } catch (e) {
        console.error("Failed to check active session from API:", e);
      }
    };
    checkSession();
  }, []);

  const login = async (name: string, mobile: string, email?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("nonzo_user", JSON.stringify(data.user));
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Profile completion failed");
      }
    } catch (e) {
      console.error("Failed to save user in registry", e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error logging out from server:", e);
    }
    setUser(null);
    localStorage.removeItem("nonzo_user");
  };

  const updateUserAddress = async (address: UserProfile["address"]) => {
    if (!user) return;
    const updatedUser = { ...user, address };
    setUser(updatedUser);
    localStorage.setItem("nonzo_user", JSON.stringify(updatedUser));

    if (address) {
      try {
        await fetch("/api/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tag: address.tag,
            fullName: user.name,
            flat: address.flat,
            area: address.area,
            city: address.city,
            pincode: address.pincode,
            phone: address.phone,
            landmark: address.landmark || "",
            isDefault: true
          })
        });
      } catch (e) {
        console.error("Failed to update user address in DB:", e);
      }
    }
  };

  const sendOtp = async (mobile: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send OTP");
      }
      return true;
    } catch (e) {
      console.error("Error in sendOtp API:", e);
      throw e;
    }
  };

  const verifyOtp = async (
    mobile: string,
    otp: string
  ): Promise<{ success: boolean; isExisting: boolean }> => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "OTP verification failed");
      }
      const data = await res.json();
      if (data.success) {
        if (data.isExisting && data.user) {
          setUser(data.user);
          localStorage.setItem("nonzo_user", JSON.stringify(data.user));
        }
        return { success: true, isExisting: data.isExisting };
      }
      return { success: false, isExisting: false };
    } catch (e) {
      console.error("Error in verifyOtp API:", e);
      return { success: false, isExisting: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        updateUserAddress,
        sendOtp,
        verifyOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
