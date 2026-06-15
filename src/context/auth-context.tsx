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
  }, []);

  const login = (name: string, mobile: string, email?: string) => {
    const newUser: UserProfile = {
      name,
      mobile,
      email,
      ...user // preserve address if they log in again
    };
    setUser(newUser);
    localStorage.setItem("nonzo_user", JSON.stringify(newUser));

    // Central registry for simulation
    try {
      const dbStr = localStorage.getItem("nonzo_users_db");
      const db = dbStr ? JSON.parse(dbStr) : {};
      db[mobile] = { ...db[mobile], ...newUser };
      localStorage.setItem("nonzo_users_db", JSON.stringify(db));
    } catch (e) {
      console.error("Failed to save user in registry", e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("nonzo_user");
  };

  const updateUserAddress = (address: UserProfile["address"]) => {
    if (!user) return;
    const updatedUser = { ...user, address };
    setUser(updatedUser);
    localStorage.setItem("nonzo_user", JSON.stringify(updatedUser));

    // Central registry update
    try {
      const dbStr = localStorage.getItem("nonzo_users_db");
      const db = dbStr ? JSON.parse(dbStr) : {};
      if (db[user.mobile]) {
        db[user.mobile].address = address;
        localStorage.setItem("nonzo_users_db", JSON.stringify(db));
      }
    } catch (e) {
      console.error("Failed to update user address in registry", e);
    }
  };

  const sendOtp = async (mobile: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`Simulated OTP 123456 sent to ${mobile}`);
    return true;
  };

  const verifyOtp = async (
    mobile: string,
    otp: string
  ): Promise<{ success: boolean; isExisting: boolean }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Support both 123456 and 1234 for testing convenience
    if (otp !== "123456" && otp !== "1234") {
      return { success: false, isExisting: false };
    }

    let isExisting = false;
    let existingProfile: UserProfile | null = null;

    try {
      const dbStr = localStorage.getItem("nonzo_users_db");
      if (dbStr) {
        const db = JSON.parse(dbStr);
        if (db && db[mobile]) {
          isExisting = true;
          existingProfile = db[mobile];
        }
      }
    } catch (e) {
      console.error("Failed to search central user registry", e);
    }

    if (isExisting && existingProfile) {
      setUser(existingProfile);
      localStorage.setItem("nonzo_user", JSON.stringify(existingProfile));
    }

    return { success: true, isExisting };
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
