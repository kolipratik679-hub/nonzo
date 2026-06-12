"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, ChevronDown, Search, Package, User, ShoppingBag } from "lucide-react";
import { useLocation } from "@/context/location-context";
import { useCart } from "@/context/cart-context";

export function AppHeader() {
  const { selectedLocation, skippedLocation, openLocationModal } = useLocation();
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [searchVal, setSearchVal] = useState("");

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const displayLocation = selectedLocation
    ? selectedLocation
    : skippedLocation
    ? "Select Location"
    : "Locating...";

  // Sync with URL query on mount and pathname change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("q") || "";
      setSearchVal(q);
    }
  }, [pathname]);

  // Listen for search updates from search page (e.g. clear search or popular searches)
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSearchVal(customEvent.detail || "");
    };
    window.addEventListener("syncSearchVal", handleSync);
    return () => window.removeEventListener("syncSearchVal", handleSync);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    if (pathname !== "/search") {
      router.push(`/search?q=${encodeURIComponent(val)}`);
    } else {
      const newUrl = val ? `/search?q=${encodeURIComponent(val)}` : `/search`;
      window.history.replaceState(null, "", newUrl);
      window.dispatchEvent(new CustomEvent("searchQueryChange", { detail: val }));
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full border-b border-zinc-800 bg-[#111111]/95 backdrop-blur-md">
      {/* Top row: Logo, Location, and Nav (Desktop) */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16 md:gap-4">
        {/* ── Brand Logo ── */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/" className="flex shrink-0 items-center active-scale">
            <Image
              src="/NONZO-LOGO.png"
              alt="NONZO Logo"
              width={120}
              height={80}
              className="h-9 w-auto object-contain md:h-10"
              priority
            />
          </Link>

          {/* ── Location Selector (Desktop) ── */}
          <button
            onClick={openLocationModal}
            className="hidden md:flex min-w-0 max-w-[200px] items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-left text-xs font-semibold text-white transition-all hover:bg-zinc-800 active-scale"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red" />
            <span className="truncate">{displayLocation}</span>
            <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-zinc-500" />
          </button>
        </div>

        {/* ── Location Selector (Mobile) ── */}
        <button
          onClick={openLocationModal}
          className="flex md:hidden min-w-0 max-w-[150px] items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-left text-[10px] font-semibold text-white transition-all hover:bg-zinc-800 active-scale"
        >
          <MapPin className="h-3 w-3 shrink-0 text-brand-red" />
          <span className="truncate">{displayLocation}</span>
          <ChevronDown className="ml-1 h-2.5 w-2.5 shrink-0 text-zinc-500" />
        </button>

        {/* ── Search Bar (Desktop) ── */}
        <div className="hidden md:block flex-1 max-w-md mx-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search fresh fish, prawns, crabs, shellfish..."
            value={searchVal}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-full bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-red focus:bg-black transition-all"
          />
        </div>

        {/* ── Desktop Nav Items (hidden on mobile) ── */}
        <nav className="hidden items-center gap-1 md:flex shrink-0">
          {/* Orders */}
          <Link
            href="/orders"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:bg-zinc-900 ${
              pathname === "/orders" ? "text-brand-red" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:bg-zinc-900 ${
              pathname === "/profile" ? "text-brand-red" : "text-zinc-300 hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Account</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-lg bg-brand-red/10 border border-brand-red/20 px-3 py-2 text-xs font-bold text-brand-red transition-all hover:bg-brand-red/20"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-red px-1 text-[9px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* ── Search Bar (Mobile Bottom Row) ── */}
      <div className="block md:hidden px-4 pb-3 pt-0.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search fresh fish, prawns, crabs..."
            value={searchVal}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-full bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-red focus:bg-black transition-all"
          />
        </div>
      </div>
    </header>
  );
}
