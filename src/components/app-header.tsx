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
    <header className="sticky top-0 z-40 w-full border-b border-border-gray bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16 md:gap-4">
        {/* ── Brand Logo ── */}
        <Link href="/" className="flex shrink-0 items-center active-scale">
          <Image
            src="/NONZO-LOGO.png"
            alt="NONZO Logo"
            width={120}
            height={80}
            className="h-9 w-auto object-contain md:h-10"
            style={{ filter: "url(#remove-black-bg)" }}
            priority
          />
        </Link>

        {/* ── Location Selector ── */}
        <button
          onClick={openLocationModal}
          className="flex min-w-0 max-w-[160px] items-center gap-1.5 rounded-full border border-border-gray bg-light-gray px-3 py-1.5 text-left text-xs font-medium text-foreground transition-all hover:bg-zinc-100 active-scale md:max-w-[200px]"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red" />
          <span className="truncate">{displayLocation}</span>
          <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-zinc-400" />
        </button>

        {/* ── Desktop Search Bar (hidden on mobile) ── */}
        <button
          onClick={() => router.push("/search")}
          className="hidden flex-1 items-center gap-2.5 rounded-xl border border-border-gray bg-light-gray px-4 py-2 text-left transition-all hover:bg-zinc-100 md:flex"
        >
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-400">
            Search fresh fish, prawns, crabs...
          </span>
        </button>

        {/* ── Desktop Nav Items (hidden on mobile) ── */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* Orders */}
          <Link
            href="/profile"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:bg-light-gray ${
              pathname === "/profile" ? "text-brand-red" : "text-zinc-600"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:bg-light-gray ${
              pathname === "/profile" ? "text-brand-red" : "text-zinc-600"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Account</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-lg bg-brand-red/5 border border-brand-red/10 px-3 py-2 text-xs font-bold text-brand-red transition-all hover:bg-brand-red/10"
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
