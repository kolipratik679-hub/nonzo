"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function StickyCartBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, subtotal } = useCart();

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
          className="w-full flex items-center justify-between rounded-2xl bg-brand-red px-6 py-4 shadow-[0_4px_20px_rgba(200,16,46,0.3)] transition-all hover:bg-red-700 active-scale"
          style={{ height: "56px" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold leading-none text-white/85 uppercase tracking-wider">
                {totalItems} {totalItems === 1 ? "item" : "items"} &bull; View Cart
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white">₹{subtotal}</span>
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
          className="flex items-center gap-4 rounded-2xl bg-brand-red px-6 py-4 shadow-[0_4px_20px_rgba(200,16,46,0.3)] transition-all hover:bg-red-700 active-scale"
          style={{ height: "56px" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold leading-none text-white/80 uppercase tracking-wider">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
              <p className="mt-0.5 text-xs font-black leading-none text-white uppercase tracking-wider">
                ₹{subtotal}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
            <span className="text-xs font-bold uppercase tracking-wider text-white">View Cart</span>
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
        </button>
      </div>
    </>
  );
}
