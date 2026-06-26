"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, Lock } from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";

// ─── Component ───────────────────────────────────────────
export default function AdminLoginPage() {
  const { adminLogin, isAdminLoggedIn, isLoading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setForgotMessage("");

      if (!email.trim()) {
        setError("Please enter your email address");
        return;
      }
      if (!password.trim()) {
        setError("Please enter your password");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await adminLogin(email.trim(), password, rememberMe);
        if (!result.success) {
          setError(result.error || "Login failed");
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, rememberMe, adminLogin]
  );

  const handleForgotPassword = useCallback(() => {
    setForgotMessage("Password reset is not available yet. Please contact the system administrator.");
    setTimeout(() => setForgotMessage(""), 5000);
  }, []);

  // Show loading or redirect spinner
  if (isLoading || isAdminLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#C8102E" }} />
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo */}
        <div className="admin-login-logo">
          <Image
            src="/NONZO-LOGO.png"
            alt="NONZO"
            width={64}
            height={64}
            style={{ borderRadius: 12 }}
            priority
          />
          <span className="admin-login-logo-badge">Admin Panel</span>
        </div>

        {/* Title */}
        <h1 className="admin-login-title">Welcome Back</h1>
        <p className="admin-login-subtitle">Sign in to your admin account</p>

        {/* Error */}
        {error && (
          <div className="admin-login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot password message */}
        {forgotMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(245, 158, 11, 0.1)",
              color: "#d97706",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            <Lock size={16} />
            <span>{forgotMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              className={`admin-form-input ${error && !email.trim() ? "error" : ""}`}
              placeholder="admin@nonzo.in"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-password">
              Password
            </label>
            <div className="admin-form-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className={`admin-form-input ${error && !password.trim() ? "error" : ""}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                style={{ width: "100%", paddingRight: 44 }}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot */}
          <div className="admin-form-row">
            <label className="admin-remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="admin-forgot-link"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="admin-login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="admin-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
