"use client";

import React from "react";
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

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const displayLocation = selectedLocation
    ? selectedLocation
    : skippedLocation
    ? "Select Location"
    : "Locating...";

  return (
    <header className="sticky top-0 z-45 w-full border-b border-zinc-800 bg-[#111111]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16 md:gap-4">
        {/* ── Brand Logo ── */}
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

        {/* ── Location Selector ── */}
        <button
          onClick={openLocationModal}
          className="flex min-w-0 max-w-[160px] items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-left text-xs font-semibold text-white transition-all hover:bg-zinc-800 active-scale md:max-w-[200px]"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red" />
          <span className="truncate">{displayLocation}</span>
          <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-zinc-500" />
        </button>

        {/* ── Desktop Nav Items (hidden on mobile) ── */}
        <nav className="hidden items-center gap-1 md:flex">
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
    </header>
  );
}
