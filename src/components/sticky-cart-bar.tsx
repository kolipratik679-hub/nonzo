"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function StickyCartBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, finalTotal } = useCart();

  // Hide on cart, checkout, product details, and admin pages
  const hiddenRoutes = ["/cart", "/checkout", "/product", "/admin"];
  if (hiddenRoutes.some((r) => pathname.startsWith(r))) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems === 0) return null;

  const uniqueItemCount = cart.length;

  return (
    <>
      {/* Mobile cart bar — above bottom nav */}
      <div className="fixed bottom-[57px] left-0 right-0 z-35 px-3 md:hidden">
        <button
          onClick={() => router.push("/cart")}
          className="flex w-full items-center justify-between rounded-xl bg-brand-red px-4 py-3 shadow-[0_4px_20px_rgba(200,16,46,0.35)] transition-all active-scale"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold leading-none text-white/80">
                {totalItems} {totalItems === 1 ? "item" : "items"} ({uniqueItemCount}{" "}
                {uniqueItemCount === 1 ? "product" : "products"})
              </p>
              <p className="mt-0.5 text-xs font-black leading-none text-white">
                View Cart
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">₹{finalTotal}</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Desktop cart bar — bottom center floating */}
      <div className="fixed bottom-6 left-1/2 z-35 hidden -translate-x-1/2 md:block">
        <button
          onClick={() => router.push("/cart")}
          className="flex items-center gap-4 rounded-2xl bg-brand-red px-6 py-3.5 shadow-[0_8px_32px_rgba(200,16,46,0.3)] transition-all hover:shadow-[0_8px_40px_rgba(200,16,46,0.45)] active-scale"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold leading-none text-white/80">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
              <p className="mt-0.5 text-xs font-black leading-none text-white">
                ₹{finalTotal}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
            <span className="text-xs font-bold text-white">View Cart</span>
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
        </button>
      </div>
    </>
  );
}
