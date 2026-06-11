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
import { PRODUCTS, CATEGORIES, WHY_NONZO, Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";

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

const CATEGORY_ACTIVE: Record<string, { bg: string; iconColor: string; textColor: string }> = {
  fish:     { bg: "bg-sky-600",    iconColor: "text-white", textColor: "text-sky-700" },
  prawns:   { bg: "bg-orange-500", iconColor: "text-white", textColor: "text-orange-600" },
  crabs:    { bg: "bg-red-600",    iconColor: "text-white", textColor: "text-red-700" },
  shellfish:{ bg: "bg-purple-600", iconColor: "text-white", textColor: "text-purple-700" },
  seafood:  { bg: "bg-teal-600",   iconColor: "text-white", textColor: "text-teal-700" },
};

export default function HomePage() {
  const router = useRouter();
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
      ];
      setBanners(defaultBanners);
    }

    // Load recently viewed list
    const savedRecent = localStorage.getItem("nonzo_recently_viewed");
    if (savedRecent) {
      try {
        const ids: string[] = JSON.parse(savedRecent);
        const loaded = ids
          .map((id) => PRODUCTS.find((p) => p.id === id))
          .filter((p): p is Product => !!p);
        setRecentlyViewed(loaded);
      } catch (e) {
        console.error("Failed to parse recently viewed", e);
      }
    }
  }, []);

  // Auto-cycle hero banner carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : PRODUCTS;

  // Filter sections
  const freshProducts = PRODUCTS.filter((p) => p.stockStatus !== "Out Of Stock").slice(0, 4);
  const bestSellers = PRODUCTS.filter((p) =>
    ["tiger-prawns", "silver-pomfret", "rawas", "black-pomfret"].includes(p.id)
  );
  const buyAgainProducts = PRODUCTS.filter((p) =>
    ["bombil", "black-pomfret"].includes(p.id)
  );

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory((prev) =>
      prev?.toLowerCase() === categoryName.toLowerCase() ? null : categoryName
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Sticky Search Section */}
      <div className="sticky top-[56px] md:top-[64px] z-30 w-full bg-white/95 backdrop-blur-md py-3 border-b border-border-gray/50 -mx-3 px-3 md:-mx-4 md:px-4">
        <div
          onClick={() => router.push("/search")}
          className="mx-auto max-w-7xl flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border-gray bg-light-gray px-4 py-3 shadow-sm transition-all hover:bg-zinc-100/80 active-scale"
        >
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-400">
            Search fresh fish, prawns, crabs, shellfish...
          </span>
        </div>
      </div>

      {/* 2. Hero Banner Carousel */}
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

      {/* 3. Shop by Category — Upgraded horizontal list / grid */}
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

        {/* Upgraded Premium category cards */}
        <div className="flex gap-3.5 overflow-x-auto pb-3 no-scrollbar scroll-smooth snap-x md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory?.toLowerCase() === cat.name.toLowerCase();
            const Icon = CATEGORY_ICONS[cat.iconName] ?? Fish;
            const gradient = CATEGORY_GRADIENTS[cat.id];
            const active = CATEGORY_ACTIVE[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`group flex shrink-0 snap-start flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 active-scale md:p-6.5 ${
                  isSelected
                    ? `border-transparent bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-md ring-2 ring-brand-red/10`
                    : "border-zinc-200 bg-white hover:border-brand-red/20 hover:shadow-md"
                }`}
                style={{ minWidth: "125px" }}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 md:h-16 md:w-16 ${
                    isSelected
                      ? `${active.bg} shadow-md`
                      : `${gradient.iconBg} group-hover:brightness-95`
                  }`}
                >
                  <Icon
                    className={`h-7 w-7 transition-colors md:h-8 md:w-8 ${
                      isSelected ? active.iconColor : gradient.iconColor
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-extrabold tracking-wide transition-colors ${
                    isSelected ? active.textColor : "text-zinc-700 group-hover:text-brand-red"
                  }`}
                >
                  {cat.name}
                </span>
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
          {/* 4. Fresh Today */}
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

          {/* 5. Best Sellers */}
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

          {/* 6. Recently Viewed */}
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

          {/* 7. Buy Again */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400">
              <RotateCcw className="h-4 w-4 text-brand-red" />
              Buy Again
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {buyAgainProducts.map((product) => {
                const defaultOption = product.weightOptions[0];
                return (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-border-gray bg-white p-3.5 transition-all hover:border-zinc-300 hover:shadow-sm active-scale"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-light-gray">
                        <Image
                          src={product.image}
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
                      <span className="text-xs font-black text-foreground">
                        ₹{defaultOption.price}
                      </span>
                      <span className="rounded-lg border border-brand-red/10 bg-brand-red/5 px-3 py-1.5 text-[10px] font-bold text-brand-red uppercase">
                        Reorder
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8. Why NONZO */}
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
