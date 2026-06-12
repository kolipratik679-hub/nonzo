"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  RotateCcw,
  Award,
  Zap,
  ShieldCheck,
  Fish,
  Waves,
  Shell,
  Anchor,
  Compass,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, WHY_NONZO, Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/cart-context";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Fish,
  Waves,
  Shell,
  Anchor,
  Compass,
};

const CATEGORY_GRADIENTS: Record<string, { from: string; to: string; iconBg: string; iconColor: string }> = {
  fish:     { from: "from-sky-50",    to: "to-sky-100/60",    iconBg: "bg-sky-100",    iconColor: "text-sky-600" },
  prawns:   { from: "from-orange-50", to: "to-orange-100/60", iconBg: "bg-orange-100", iconColor: "text-orange-500" },
  crabs:    { from: "from-red-50",    to: "to-red-100/60",    iconBg: "bg-red-100",    iconColor: "text-red-600" },
  shellfish:{ from: "from-purple-50", to: "to-purple-100/60", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  seafood:  { from: "from-teal-50",   to: "to-teal-100/60",   iconBg: "bg-teal-100",   iconColor: "text-teal-600" },
};

export default function HomePage() {
  const router = useRouter();
  const { products } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Carousel states
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Recently Viewed state
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    // Dynamic page title branding
    document.title = "NONZO | Eat Better. Live Better.";

    // Load active banners from localStorage
    const savedBanners = localStorage.getItem("nonzo_admin_banners");
    if (savedBanners) {
      try {
        setBanners(JSON.parse(savedBanners).filter((b: any) => b.isActive));
      } catch (e) {
        console.error("Failed to load banners", e);
      }
    } else {
      const defaultBanners = [
        {
          id: "banner-1",
          title: "Colossal Tiger Prawns",
          subtitle: "Sweet, juicy freshwater giants caught today.",
          imageUrl: "/images/TIGER PRAWNS.jpg",
          destinationType: "product",
          destinationValue: "tiger-prawns",
          isActive: true,
        },
        {
          id: "banner-2",
          title: "Fresh Coast Landing",
          subtitle: "Delivered strictly between 0 and 4 degrees.",
          imageUrl: "/images/black pomfret.jpg",
          destinationType: "category",
          destinationValue: "Fish",
          isActive: true,
        },
        {
          id: "banner-3",
          title: "Premium Mud Crabs",
          subtitle: "Harvested fresh from mangrove farms daily.",
          imageUrl: "/images/mud crab.jpg",
          destinationType: "category",
          destinationValue: "Crabs",
          isActive: true,
        },
      ];
      setBanners(defaultBanners);
    }
  }, []);

  // Load recently viewed list after products are loaded/changed
  useEffect(() => {
    const savedRecent = localStorage.getItem("nonzo_recently_viewed");
    if (savedRecent && products && products.length > 0) {
      try {
        const ids: string[] = JSON.parse(savedRecent);
        const loaded = ids
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => !!p);
        setRecentlyViewed(loaded);
      } catch (e) {
        console.error("Failed to parse recently viewed", e);
      }
    }
  }, [products]);

  // Auto-cycle hero banner carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  const filteredProducts = selectedCategory
    ? products.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : products;

  // Filter sections
  const freshProducts = products.filter((p) => p.stockStatus !== "Out Of Stock").slice(0, 4);
  const bestSellers = products.filter((p) =>
    ["tiger-prawns", "silver-pomfret", "rawas", "black-pomfret"].includes(p.id)
  );
  const buyAgainProducts = products.filter((p) =>
    ["bombil", "black-pomfret"].includes(p.id)
  );

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory((prev) =>
      prev?.toLowerCase() === categoryName.toLowerCase() ? null : categoryName
    );
  };

  return (
    <div className="space-y-8 pb-16 pt-3 md:pt-4">
      {/* 1. Hero Banner Carousel */}
      {banners.length > 0 && (
        <div className="relative aspect-[16/9] md:aspect-[21/7] w-full overflow-hidden rounded-3xl border border-border-gray bg-light-gray shadow-sm group">
          {banners.map((banner, idx) => {
            const isCurrent = idx === currentSlide;
            return (
              <div
                key={banner.id}
                onClick={() => {
                  if (banner.destinationType === "product") {
                    router.push(`/product/${banner.destinationValue}`);
                  } else if (banner.destinationType === "category") {
                    setSelectedCategory(banner.destinationValue);
                  } else if (banner.destinationValue) {
                    router.push(banner.destinationValue);
                  }
                }}
                className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-in-out ${
                  isCurrent ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 flex flex-col justify-end p-5 md:p-8">
                  <div className="max-w-lg space-y-1.5 md:space-y-2.5">
                    <h2 className="text-sm font-black uppercase tracking-wider text-brand-red md:text-base">
                      {banner.title}
                    </h2>
                    <p className="text-white text-xs font-bold leading-relaxed md:text-sm">
                      {banner.subtitle}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur px-3.5 py-1 rounded-full active-scale transition-colors mt-2.5">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Prev/Next Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev + 1) % banners.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "bg-white w-6" : "bg-white/40 w-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Shop by Category — Premium image-based cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Shop by Category
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[10px] font-extrabold text-brand-red active-scale uppercase"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Premium category image cards */}
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar scroll-smooth snap-x md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory?.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                style={{ minWidth: "120px" }}
                className={`group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border transition-all duration-300 active-scale md:min-w-0 ${
                  isSelected
                    ? "border-brand-red shadow-lg shadow-brand-red/10 ring-2 ring-brand-red/20"
                    : "border-zinc-200 hover:border-brand-red/30 hover:shadow-md hover:shadow-zinc-200/80"
                }`}
              >
                {/* Image container */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 120px, 20vw"
                    className={`object-cover transition-all duration-500 ${
                      isSelected
                        ? "scale-105 brightness-90"
                        : "group-hover:scale-105"
                    }`}
                  />
                  {/* Active overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-brand-red/20 flex items-center justify-center">
                      <div className="rounded-full bg-brand-red p-1.5">
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                {/* Category title */}
                <div className={`w-full px-3 py-2.5 text-center transition-colors ${
                  isSelected ? "bg-brand-red/5" : "bg-white"
                }`}>
                  <span className={`text-[11px] font-extrabold tracking-wide transition-colors ${
                    isSelected ? "text-brand-red" : "text-zinc-700 group-hover:text-brand-red"
                  }`}>
                    {cat.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category-filtered product grid */}
      {selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-gray pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              {selectedCategory}
            </h3>
            <span className="text-[10px] font-semibold text-zinc-400">
              {filteredProducts.length} items
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Main Homepage Sections */}
      {!selectedCategory && (
        <>
          {/* 3. Fresh Today */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400">
              <Zap className="h-4 w-4 text-brand-red" />
              Landed Fresh Today
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {freshProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* 4. Best Sellers */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400">
              <Award className="h-4 w-4 text-brand-red" />
              Best Sellers
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* 5. Recently Viewed — only if user viewed products */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400">
                <RotateCcw className="h-4 w-4 text-brand-red" />
                Recently Viewed
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x">
                {recentlyViewed.map((product) => (
                  <div key={product.id} className="w-[175px] shrink-0 snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Buy Again — only for returning users (has recently viewed items) */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400">
                <RotateCcw className="h-4 w-4 text-brand-red" />
                Buy Again
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {buyAgainProducts.map((product) => {
                  const defaultOption = product.weightOptions[0];
                  const discountPct = Math.round(((defaultOption.originalPrice - defaultOption.price) / defaultOption.originalPrice) * 100);
                  return (
                    <div
                      key={product.id}
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="flex cursor-pointer items-center justify-between rounded-2xl border border-border-gray bg-white p-3.5 transition-all hover:border-zinc-300 hover:shadow-sm active-scale"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-light-gray">
                          <Image
                            src={product.mainImage || product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-zinc-400 mt-0.5 block">
                            Last: Whole Fish · {defaultOption.weight}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-black text-foreground block">
                            ₹{defaultOption.price}
                          </span>
                          {discountPct > 0 && (
                            <span className="text-[9px] font-bold text-brand-red">{discountPct}% OFF</span>
                          )}
                        </div>
                        <span className="rounded-lg border border-brand-red/10 bg-brand-red/5 px-3 py-1.5 text-[10px] font-bold text-brand-red uppercase">
                          Reorder
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Why NONZO */}
          <div className="space-y-4 pt-2">
            <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-brand-red" />
              Why NONZO?
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {WHY_NONZO.map((item, idx) => (
                <div
                  key={idx}
                  className="space-y-3 rounded-2xl border border-border-gray bg-white p-5 transition-all hover:shadow-sm"
                >
                  <div dangerouslySetInnerHTML={{ __html: item.iconSvg }} />
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
