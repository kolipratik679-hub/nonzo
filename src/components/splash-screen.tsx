"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("nonzo_splash_seen");
    if (hasSeenSplash === "true") return;

    setShouldRender(true);
    setIsVisible(true);

    let removeTimer: ReturnType<typeof setTimeout>;

    const timer = setTimeout(() => {
      setIsVisible(false);
      removeTimer = setTimeout(() => {
        setShouldRender(false);
        try {
          sessionStorage.setItem("nonzo_splash_seen", "true");
          // Dispatch a custom event to notify location-context
          window.dispatchEvent(new Event("nonzoSplashFinished"));
        } catch (e) {
          console.error("sessionStorage write failed", e);
        }
      }, 400);
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (removeTimer) clearTimeout(removeTimer);
    };
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
