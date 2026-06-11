"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, CUT_TYPES } from "@/lib/mock-data";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();

  const defaultOption = product.weightOptions[0];
  const isOutOfStock = product.stockStatus === "Out Of Stock";
  const isLowStock = product.stockStatus === "Low Stock";

  // Check if this product (default config) is already in cart
  const defaultCut = CUT_TYPES.find((c) => product.allowedCuts.includes(c.id)) || CUT_TYPES[0];
  const cartItemId = `${product.id}-${defaultOption.weight}-${defaultCut.id}`;
  const cartItem = cart.find((item) => item.id === cartItemId);
  const cartQty = cartItem?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, defaultOption.weight, defaultCut, "");
  };

  const handleIncrement = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(cartItemId, cartQty + 1);
  };

  const handleDecrement = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(cartItemId, cartQty - 1);
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const discountPct = Math.round(
    ((defaultOption.originalPrice - defaultOption.price) / defaultOption.originalPrice) * 100
  );

  return (
    <div
      onClick={handleCardClick}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border-gray bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-md ${
        isOutOfStock ? "opacity-70" : ""
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-light-gray">
        <Image
          src={product.image || "/NONZO-LOGO.png"}
          alt={product.name || "Product image"}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {discountPct > 0 && !isOutOfStock && (
          <div className="absolute left-2 top-2 z-10">
            <span className="rounded-full bg-brand-red px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm">
              {discountPct}% off
            </span>
          </div>
        )}

        {/* Stock Badge */}
        {(isOutOfStock || isLowStock) && (
          <div className="absolute right-2 top-2 z-10">
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm ${
                isOutOfStock ? "bg-zinc-500" : "bg-amber-500"
              }`}
            >
              {isOutOfStock ? "Sold Out" : "Low Stock"}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
          {product.category}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-snug text-foreground transition-colors group-hover:text-brand-red sm:text-xs">
          {product.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[10px] leading-relaxed text-zinc-400">
          {product.tagline}
        </p>

        {/* Price + Action */}
        <div className="mt-auto flex items-center justify-between gap-1 pt-2">
          <div className="min-w-0">
            <span className="block truncate text-[9px] font-medium text-zinc-400">
              {defaultOption.weight} (min)
            </span>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="text-sm font-black text-foreground">
                ₹{defaultOption.price}
              </span>
              <span className="text-[9px] text-zinc-400 line-through">
                ₹{defaultOption.originalPrice}
              </span>
            </div>
          </div>

          {/* Action Area — stopPropagation wrapper prevents card click */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {isOutOfStock ? (
              <div className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[10px] font-bold text-zinc-400">
                Sold Out
              </div>
            ) : cartQty === 0 ? (
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1 rounded-lg border border-brand-red/20 bg-brand-red/5 px-2.5 py-1.5 text-[10px] font-bold text-brand-red transition-all hover:bg-brand-red hover:text-white active-scale"
                style={{ minHeight: "32px" }}
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-brand-red bg-brand-red px-1.5 py-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="flex h-5 w-5 items-center justify-center rounded text-white active-scale"
                >
                  <Minus className="h-2.5 w-2.5 stroke-[3]" />
                </button>
                <span className="w-3.5 text-center text-[11px] font-extrabold leading-none text-white">
                  {cartQty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="flex h-5 w-5 items-center justify-center rounded text-white active-scale"
                >
                  <Plus className="h-2.5 w-2.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
