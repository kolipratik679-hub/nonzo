"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import {
  ShoppingBag,
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
} from "lucide-react";

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
  } = useCart();
  const router = useRouter();
  const [promoInput, setPromoInput] = useState<string>("");
  const [promoTouched, setPromoTouched] = useState<boolean>(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 space-y-6">
        <div className="rounded-full bg-light-gray border border-border-gray p-6">
          <ShoppingBag className="h-12 w-12 text-zinc-300" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-black text-foreground">
            Your cart is empty
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Add some fresh seafood to get started — no preservatives, straight
            from the water.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 text-xs font-bold text-white hover:bg-red-700 active-scale"
        >
          <ArrowLeft className="h-4 w-4" />
          Start Shopping
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
            {totalItems} {totalItems === 1 ? "item" : "items"} ·{" "}
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
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3.5 rounded-2xl border border-border-gray bg-white p-3.5"
          >
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
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="rounded-full bg-light-gray px-2 py-0.5 text-[9px] font-semibold text-zinc-500">
                  {item.weight}
                </span>
                <span className="rounded-full bg-light-gray px-2 py-0.5 text-[9px] font-semibold text-zinc-500">
                  {item.cutName}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                {/* Price */}
                <div>
                  <span className="text-sm font-black text-foreground">
                    ₹{item.price * item.quantity}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="ml-1.5 text-[9px] text-zinc-400 line-through">
                      ₹{item.originalPrice * item.quantity}
                    </span>
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
        ))}
      </div>

      {/* Promo code */}
      <div className="rounded-2xl border border-border-gray bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-brand-red" />
          <span className="text-xs font-bold text-foreground">
            Promo Code
          </span>
        </div>

        {promoCode && promoDiscount > 0 ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  {promoCode} applied!
                </span>
                <p className="text-[10px] text-emerald-600 font-medium">
                  You save ₹{promoDiscount}
                </p>
              </div>
            </div>
            <button
              onClick={removePromoCode}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors"
            >
              <X className="h-3 w-3 text-emerald-700" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
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
                className="rounded-xl bg-brand-red px-4 py-2.5 text-xs font-bold text-white disabled:bg-zinc-200 disabled:text-zinc-400 hover:bg-red-700 transition-all active-scale"
              >
                Apply
              </button>
            </div>
            {promoTouched && promoError && (
              <p className="text-[10px] font-semibold text-brand-red ml-1">
                {promoError}
              </p>
            )}
            <div className="flex items-center gap-1.5 ml-1">
              <Gift className="h-3 w-3 text-zinc-400" />
              <span className="text-[10px] text-zinc-400">
                Try <span className="font-bold text-foreground">NONZO10</span> for 10% off
              </span>
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
          { label: "Subtotal", value: `₹${subtotal}` },
          { label: "Cleaning & Handling", value: cleaningFee > 0 ? `₹${cleaningFee}` : "FREE" },
          { label: "Delivery Fee", value: deliveryFee > 0 ? `₹${deliveryFee}` : "FREE" },
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
              −₹{promoDiscount}
            </span>
          </div>
        )}

        {savings > 0 && (
          <div className="flex justify-between border-t border-border-gray/50 pt-2">
            <span className="text-xs text-emerald-600">You&apos;re saving</span>
            <span className="text-xs font-bold text-emerald-600">₹{savings}</span>
          </div>
        )}

        <div className="border-t border-border-gray pt-2.5 flex justify-between">
          <span className="text-sm font-black text-foreground">Total</span>
          <span className="text-sm font-black text-foreground">₹{finalTotal}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: ShieldCheck, label: "Safe Checkout" },
          { icon: Clock, label: "Same-day Delivery" },
          { icon: CheckCircle2, label: "Freshness Guaranteed" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-light-gray border border-border-gray/40 p-3 text-center"
          >
            <Icon className="h-4 w-4 text-brand-red" />
            <span className="text-[9px] font-bold text-zinc-500 leading-tight">
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
            <span className="text-sm font-black text-white">₹{finalTotal}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-4 w-4 text-white" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
