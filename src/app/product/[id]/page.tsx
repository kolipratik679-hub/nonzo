"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldAlert, ShoppingBag } from "lucide-react";
import { PRODUCTS, CUT_TYPES, CutType } from "@/lib/mock-data";
import { useCart } from "@/context/cart-context";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { addToCart } = useCart();

  const product = PRODUCTS.find((p) => p.id === id);

  // Weight options to display: 250g, 500g, 1kg, 2kg
  const availableWeights = ["250g", "500g", "1kg", "2kg"];
  const [selectedWeight, setSelectedWeight] = useState<string>("500g");

  // Get active cut types allowed for this specific fish
  const allowedCuts = product ? CUT_TYPES.filter((cut) => product.allowedCuts.includes(cut.id)) : [];
  const [selectedCut, setSelectedCut] = useState<CutType>(allowedCuts[0] || CUT_TYPES[0]);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [addedMessage, setAddedMessage] = useState<boolean>(false);

  // Fallback if product not found
  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <ShieldAlert className="h-12 w-12 text-brand-red animate-bounce" />
        <h2 className="text-lg font-bold">Product Not Found</h2>
        <p className="text-xs text-zinc-500">The product you are looking for does not exist or has been removed.</p>
        <Link href="/" className="rounded-xl bg-brand-red px-5 py-3 text-xs font-bold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const parseWeightToGrams = (w: string): number => {
    const val = parseFloat(w);
    if (w.toLowerCase().includes("kg")) {
      return val * 1000;
    }
    return val;
  };

  // Compute live price based on selected weight
  const getWeightPrice = (weight: string): number => {
    // 1. Try to find the exact match in mock data
    const exactMatch = product.weightOptions.find((o) => o.weight === weight);
    if (exactMatch) return exactMatch.price;

    // 2. Proportional scale based on the first available weight option
    const baseOpt = product.weightOptions[0];
    const baseWeightVal = parseWeightToGrams(baseOpt.weight);
    const targetWeightVal = parseWeightToGrams(weight);

    const ratio = targetWeightVal / baseWeightVal;
    
    // Scale discount: heavier gets a slightly lower rate per gram
    let scaleModifier = 1.0;
    if (ratio > 1) scaleModifier = 0.92; // 8% bulk discount
    if (ratio < 1) scaleModifier = 1.05; // 5% small portion mark-up

    return Math.round(baseOpt.price * ratio * scaleModifier);
  };

  const getWeightOriginalPrice = (weight: string): number => {
    const exactMatch = product.weightOptions.find((o) => o.weight === weight);
    if (exactMatch) return exactMatch.originalPrice;

    // Estimate based on 20% mark-up
    return Math.round(getWeightPrice(weight) * 1.2);
  };

  const currentWeightPrice = getWeightPrice(selectedWeight);
  const currentWeightOriginalPrice = getWeightOriginalPrice(selectedWeight);
  
  // Total line price: weight price + extra charge for cut type
  const unitPrice = currentWeightPrice + selectedCut.extraCharge;
  const originalUnitPrice = currentWeightOriginalPrice + selectedCut.extraCharge;

  const handleAddToCart = () => {
    addToCart(product, 1, selectedWeight, selectedCut, specialInstructions);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2500);
  };

  const isOutOfStock = product.stockStatus === "Out Of Stock";

  return (
    <div className="space-y-6 pt-4 pb-24">
      {/* Back Button Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Product Details
        </span>
        <button
          onClick={() => router.push("/cart")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ShoppingBag className="h-4.5 w-4.5 text-foreground" />
        </button>
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Side: Images Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border-gray bg-light-gray shadow-sm">
            <img
              src={product.images[activeImageIdx] || product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-all"
            />
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all active-scale ${
                    activeImageIdx === idx ? "border-brand-red" : "border-border-gray hover:border-zinc-300"
                  }`}
                >
                  <img src={imgUrl} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details info */}
        <div className="space-y-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red bg-red-50 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="mt-2.5 text-xl font-black text-foreground md:text-2xl">
              {product.name}
            </h1>
            <p className="mt-1 text-xs text-zinc-400 italic font-medium">
              &quot;{product.tagline}&quot;
            </p>
          </div>

          <div className="border-t border-b border-border-gray/50 py-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Freshness & Sourcing
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
              {product.freshnessInfo}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Product Description
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
              {product.description}
            </p>
          </div>

          {/* Weight Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Select Weight Portion
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {availableWeights.map((weight) => {
                const isSelected = selectedWeight === weight;
                const price = getWeightPrice(weight);

                return (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => setSelectedWeight(weight)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all active-scale ${
                      isSelected
                        ? "border-brand-red bg-brand-red/5 text-brand-red font-bold"
                        : "border-border-gray hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <span className="text-xs font-bold">{weight}</span>
                    <span className="text-[10px] mt-0.5 text-zinc-500 font-medium">₹{price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cut Type Selection System */}
      <div className="space-y-3.5 border-t border-border-gray/50 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Select Custom Cut Type
        </h3>
        <div className="space-y-2.5">
          {allowedCuts.map((cut) => {
            const isSelected = selectedCut.id === cut.id;
            return (
              <div
                key={cut.id}
                onClick={() => setSelectedCut(cut)}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-sm active-scale ${
                  isSelected
                    ? "border-brand-red bg-brand-red/5"
                    : "border-border-gray bg-white hover:border-zinc-300"
                }`}
              >
                {/* Visual Cut Icon/Image */}
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-white p-1.5 transition-all ${
                    isSelected ? "border-brand-red text-brand-red" : "border-border-gray text-zinc-400"
                  }`}
                  dangerouslySetInnerHTML={{ __html: cut.iconSvg }}
                />

                {/* Cut Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${isSelected ? "text-brand-red" : "text-foreground"}`}>
                      {cut.name}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cut.extraCharge > 0 ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {cut.extraCharge === 0 ? "Free Cut" : `+₹${cut.extraCharge}`}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                    {cut.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Cut Instructions Box */}
      <div className="space-y-2.5 border-t border-border-gray/50 pt-5">
        <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 block">
          Special Prep Instructions (Optional)
        </label>
        <textarea
          rows={2}
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Cut into very small pieces, remove fins, pack separately..."
          className="w-full rounded-2xl border border-border-gray bg-white p-3.5 text-xs outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
        />
      </div>

      {/* Sticky Add To Cart Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-gray bg-white py-3 px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] md:relative md:border-t-0 md:shadow-none md:p-0 md:bg-transparent">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 md:max-w-none md:justify-end md:gap-6">
          {/* Live Price Summary */}
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold block">Total Price</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-foreground">
                ₹{unitPrice}
              </span>
              <span className="text-[11px] text-zinc-400 line-through">
                ₹{originalUnitPrice}
              </span>
            </div>
          </div>

          {/* Sticky CTA Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="flex-1 md:flex-none md:w-48 rounded-xl bg-zinc-200 py-3.5 text-xs font-extrabold text-zinc-400 cursor-not-allowed text-center"
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex-grow md:flex-initial md:px-12 rounded-xl bg-brand-red py-3.5 text-xs font-extrabold text-white transition-all hover:bg-red-700 active-scale shadow-md shadow-brand-red/10 flex items-center justify-center gap-1.5"
            >
              {addedMessage ? (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5 animate-pulse" />
                  Added to Cart!
                </>
              ) : (
                <>
                  Add to Cart • {selectedWeight}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
