"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  mobile: string;
  email?: string;
  address?: {
    flat: string;
    area: string;
    city: string;
    pincode: string;
    phone: string;
    tag: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (name: string, mobile: string, email?: string) => void;
  logout: () => void;
  updateUserAddress: (address: UserProfile["address"]) => void;
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        updateUserAddress,
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
