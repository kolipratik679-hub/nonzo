"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Clock,
  BadgePercent,
  X,
  CheckCircle2,
  Gift,
  ChevronDown,
  PackageOpen,
} from "lucide-react";
import { CUT_TYPES } from "@/lib/mock-data";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    promoCode,
    applyPromoCode,
    promoDiscount,
    removePromoCode,
    subtotal,
    deliveryFee,
    cleaningFee,
    finalTotal,
    promoError,
    updateCartItemWeight,
    updateCartItemCut,
  } = useCart();
  const router = useRouter();
  const [promoInput, setPromoInput] = useState<string>("");
  const [promoTouched, setPromoTouched] = useState<boolean>(false);
  const [isPromoExpanded, setIsPromoExpanded] = useState<boolean>(!!promoCode);

  useEffect(() => {
    document.title = "Cart | NONZO";
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 space-y-6">
        {/* Seafood illustration */}
        <div className="relative">
          <div className="rounded-full bg-light-gray border border-border-gray p-8">
            <svg className="h-16 w-16 text-zinc-300" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 40C22 22 44 16 62 30C68 34 72 40 76 40C72 40 68 46 62 50C44 64 22 58 10 40Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 40C24 30 36 28 48 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
              <circle cx="64" cy="34" r="2.5" fill="currentColor"/>
              <path d="M12 40L6 30V50L12 40Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M50 25C47 32 47 48 50 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-brand-red p-1.5">
            <PackageOpen className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-base font-black text-foreground">
            Your Cart Is Empty
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Add some fresh seafood to get started — no preservatives, straight from the water.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 text-xs font-bold text-white hover:bg-red-700 active-scale"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-4 pb-32 md:pb-12">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-foreground">Your Cart</h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {totalItems} {totalItems === 1 ? "item" : "items"} \u00b7{" "}
            {cart.length} {cart.length === 1 ? "product" : "products"}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-[10px] font-bold text-zinc-400 border border-border-gray rounded-full px-3 py-1.5 hover:border-zinc-400 hover:text-foreground transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {cart.map((item) => {
          const allowedCuts = item._product?.allowedCuts || [];
          const allowedCutObjects = CUT_TYPES.filter((c) => allowedCuts.includes(c.id));
          const currentCutId = item._cutType?.id || "whole";

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border-gray bg-white p-3.5 space-y-3"
            >
              {/* Top row: image + info + remove */}
              <div className="flex items-start gap-3.5">
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-light-gray">
                  <Image
                    src={item.image || "/NONZO-LOGO.png"}
                    alt={item.name || "Product image"}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-foreground leading-tight truncate">
                    {item.name}
                  </h3>

                  {/* Weight selector */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <div className="relative inline-flex items-center">
                      <select
                        value={item.weight}
                        onChange={(e) => updateCartItemWeight(item.id, e.target.value)}
                        className="appearance-none rounded-full bg-zinc-50 hover:bg-zinc-100/80 px-2.5 pr-6 py-1 text-[9px] font-bold text-zinc-600 outline-none border border-border-gray focus:border-brand-red cursor-pointer transition-all"
                      >
                        {["250g", "500g", "1kg", "2kg"].map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 h-2.5 w-2.5 text-zinc-400 stroke-[3]" />
                    </div>

                    {/* Current cut label */}
                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">
                      {item._cutType?.name || "Whole Fish"}
                      {(item._cutType?.extraCharge ?? 0) > 0 && (
                        <span className="ml-1 text-amber-600">+\u20b9{item._cutType?.extraCharge}</span>
                      )}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Price */}
                    <div>
                      <span className="text-xs font-black text-foreground">
                        \u20b9{item.price * item.quantity}
                      </span>
                      {item.originalPrice > item.price && (
                        <>
                          <span className="ml-1.5 text-[9px] text-zinc-400 line-through">
                            \u20b9{item.originalPrice * item.quantity}
                          </span>
                          <span className="ml-1.5 text-[9px] font-extrabold text-brand-red">
                            ({Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Quantity control */}
                    <div className="flex items-center gap-2 rounded-lg border border-brand-red bg-brand-red/5 px-2.5 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-brand-red active-scale"
                      >
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="text-xs font-extrabold text-foreground w-3 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-brand-red active-scale"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 border border-red-100 text-brand-red transition-all hover:bg-brand-red hover:text-white active-scale"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Visual Cut Selector — horizontal scroll cards */}
              {allowedCutObjects.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Select Cut Type</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {allowedCutObjects.map((cut) => {
                      const isActive = currentCutId === cut.id;
                      return (
                        <button
                          key={cut.id}
                          onClick={() => updateCartItemCut(item.id, cut.id)}
                          className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border p-2 transition-all active-scale ${
                            isActive
                              ? "border-brand-red bg-brand-red/5 text-brand-red"
                              : "border-border-gray bg-white text-zinc-500 hover:border-zinc-300"
                          }`}
                          style={{ minWidth: "70px" }}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isActive ? "text-brand-red" : "text-zinc-400"
                            }`}
                            dangerouslySetInnerHTML={{ __html: cut.iconSvg.replace('class="w-12 h-12', 'class="w-8 h-8') }}
                          />
                          <span className={`text-[8px] font-bold leading-tight text-center ${isActive ? "text-brand-red" : "text-zinc-600"}`}>
                            {cut.name}
                          </span>
                          <span className={`text-[8px] font-extrabold rounded-full px-1.5 py-0.5 ${
                            cut.extraCharge > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {cut.extraCharge === 0 ? "Free" : `+\u20b9${cut.extraCharge}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Promo code */}
      <div className="rounded-2xl border border-border-gray bg-white p-4">
        {promoCode && promoDiscount > 0 ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-emerald-600 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  Coupon Applied!
                </span>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  You Saved \u20b9{promoDiscount}
                </p>
              </div>
            </div>
            <button
              onClick={removePromoCode}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors active-scale"
            >
              <X className="h-3 w-3 text-emerald-700" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setIsPromoExpanded(!isPromoExpanded)}
              className="flex w-full items-center justify-between text-left focus:outline-none"
            >
              <span className="text-xs font-extrabold text-brand-red flex items-center gap-1.5 hover:underline">
                <Tag className="h-3.5 w-3.5" />
                Have a promo code?
              </span>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${
                  isPromoExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                isPromoExpanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                  Promo Code
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. NONZO10)"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoTouched(true);
                    }}
                    className="flex-1 rounded-xl border border-border-gray bg-light-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red focus:bg-white transition-all"
                  />
                  <button
                    onClick={() => applyPromoCode(promoInput)}
                    disabled={!promoInput.trim()}
                    className="rounded-xl bg-brand-red px-5 py-2.5 text-xs font-bold text-white disabled:bg-zinc-200 disabled:text-zinc-400 hover:bg-red-700 transition-all active-scale"
                  >
                    Apply
                  </button>
                </div>
                {promoTouched && promoError && (
                  <p className="text-[10px] font-semibold text-brand-red ml-1">
                    {promoError}
                  </p>
                )}
                <div className="flex items-center gap-1.5 ml-1 pt-1">
                  <Gift className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400">
                    Try <span className="font-bold text-foreground">NONZO10</span> for 10% off
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="rounded-2xl border border-border-gray bg-white p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-foreground mb-3">
          Order Summary
        </h3>

        {[
          { label: "Subtotal", value: `\u20b9${subtotal}` },
          { label: "Cleaning & Handling", value: cleaningFee > 0 ? `\u20b9${cleaningFee}` : "FREE" },
          { label: "Delivery Fee", value: deliveryFee > 0 ? `\u20b9${deliveryFee}` : "FREE" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between">
            <span className="text-xs text-zinc-500">{row.label}</span>
            <span
              className={`text-xs font-bold ${
                row.value === "FREE" ? "text-emerald-600" : "text-foreground"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}

        {promoDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-xs text-emerald-600">Promo Discount</span>
            <span className="text-xs font-bold text-emerald-600">
              \u2212\u20b9{promoDiscount}
            </span>
          </div>
        )}

        {savings > 0 && (
          <div className="flex justify-between border-t border-border-gray/50 pt-2">
            <span className="text-xs text-emerald-600">You&apos;re saving</span>
            <span className="text-xs font-bold text-emerald-600">\u20b9{savings}</span>
          </div>
        )}

        <div className="border-t border-border-gray pt-2.5 flex justify-between">
          <span className="text-sm font-black text-foreground">Total</span>
          <span className="text-sm font-black text-foreground">\u20b9{finalTotal}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: ShieldCheck, label: "Safe Checkout" },
          { icon: Clock, label: "On-Time Delivery" },
          { icon: CheckCircle2, label: "Freshness Guaranteed" },
          { icon: BadgePercent, label: "Professional Cleaning" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-light-gray border border-border-gray/40 p-3 text-center"
          >
            <Icon className="h-4 w-4 text-brand-red" />
            <span className="text-[8px] font-bold text-zinc-500 leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Proceed to Checkout CTA */}
      <div className="fixed bottom-[57px] left-0 right-0 px-4 z-45 bg-white border-t border-border-gray pt-3 pb-2 md:static md:border-0 md:bg-transparent md:pt-0 md:pb-0 safe-bottom">
        <button
          onClick={() => router.push("/checkout")}
          className="flex w-full items-center justify-between rounded-2xl bg-brand-red px-5 py-4 shadow-[0_4px_20px_rgba(200,16,46,0.3)] transition-all active-scale hover:bg-red-700"
        >
          <div className="text-left">
            <p className="text-[10px] text-white/80 font-semibold">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
            <p className="text-sm font-black text-white leading-none">
              Proceed to Checkout
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">\u20b9{finalTotal}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-4 w-4 text-white" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
