"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function BottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();

  // Hide on product details pages to avoid overlap with product page CTA
  if (pathname.startsWith("/product/")) return null;

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const tabs = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      customIcon: false,
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
      customIcon: false,
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      customIcon: false,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      customIcon: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-45 border-t border-zinc-800 bg-[#111111] shadow-[0_-4px_12px_rgba(0,0,0,0.3)] md:hidden safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === "/" 
            ? pathname === "/" 
            : tab.href === "/profile"
            ? pathname.startsWith("/profile") || pathname.startsWith("/orders")
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center px-3 py-1 transition-colors active-scale ${
                isActive
                  ? "font-semibold text-brand-red"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              style={{ minWidth: "48px", minHeight: "44px" }}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "stroke-[2.5]" : "stroke-[2]"
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-red px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] tracking-wide">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
