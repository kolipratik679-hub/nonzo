"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if splash was already shown in the current session
    const hasSeenSplash = sessionStorage.getItem("nonzo_splash_seen");
    if (!hasSeenSplash) {
      setShouldRender(true);
      setIsVisible(true);
      sessionStorage.setItem("nonzo_splash_seen", "true");

      // Total splash duration: 2.5s animation + 0.3s DOM removal buffer
      const timer = setTimeout(() => {
        setIsVisible(false);
        const removeTimer = setTimeout(() => {
          setShouldRender(false);
        }, 400);
        return () => clearTimeout(removeTimer);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black ${
        isVisible ? "animate-splash-bg" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Logo — displayed with transparency filter */}
        <div className="animate-splash-logo">
          <Image
            src="/NONZO-LOGO.png"
            alt="NONZO Logo"
            width={280}
            height={280}
            className="h-auto w-[180px] object-contain sm:w-[220px] md:w-[280px]"
            style={{ filter: "url(#remove-black-bg)" }}
            priority
          />
        </div>

        {/* Tagline */}
        <p className="animate-splash-tagline text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Eat Better. Live Better.
        </p>
      </div>
    </div>
  );
}
