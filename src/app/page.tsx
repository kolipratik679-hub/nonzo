"use client";

import React, { useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import { PRODUCTS, CATEGORIES, WHY_NONZO } from "@/lib/mock-data";
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

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : PRODUCTS;

  const featuredProducts = PRODUCTS.filter((p) =>
    ["tiger-prawns", "silver-pomfret", "lobster", "rawas"].includes(p.id)
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
    <div className="space-y-8 pb-12 pt-4">
      {/* 1. Search Bar Trigger — primary search on mobile */}
      <div
        onClick={() => router.push("/search")}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border-gray bg-light-gray px-4 py-3.5 shadow-sm transition-all hover:bg-zinc-100/80 active-scale"
      >
        <Search className="h-4 w-4 shrink-0 text-zinc-400" />
        <span className="text-xs font-semibold text-zinc-400">
          Search fish, prawns, crabs, shellfish...
        </span>
      </div>

      {/* 2. Categories — Premium redesigned cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
            Shop by Category
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] font-bold text-brand-red active-scale"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Desktop: horizontal grid / Mobile: horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0">
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
                className={`group flex shrink-0 flex-col items-center gap-2.5 rounded-2xl border p-4 transition-all duration-200 active-scale md:p-5 ${
                  isSelected
                    ? `border-transparent bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-md`
                    : "border-border-gray bg-white hover:border-zinc-200 hover:shadow-sm"
                }`}
                style={{ minWidth: "100px" }}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 md:h-14 md:w-14 ${
                    isSelected
                      ? `${active.bg} shadow-md`
                      : `${gradient.iconBg} group-hover:brightness-95`
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 transition-colors md:h-7 md:w-7 ${
                      isSelected ? active.iconColor : gradient.iconColor
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold tracking-wide transition-colors md:text-xs ${
                    isSelected ? active.textColor : "text-zinc-600"
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
            <h3 className="text-sm font-bold text-foreground">
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

      {/* Main home sections when no filter */}
      {!selectedCategory && (
        <>
          {/* 3. Featured Products */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-foreground">
              <Award className="h-4 w-4 text-brand-red" />
              Featured Delicacies
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-[175px] shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Fresh Today */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-foreground">
              <Zap className="h-4 w-4 text-brand-red" />
              Landed Fresh Today
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {PRODUCTS.filter((p) => p.stockStatus !== "Out Of Stock")
                .slice(0, 6)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>

          {/* 5. Buy Again */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-foreground">
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
                        <span className="text-[10px] text-zinc-400">
                          Last: Whole Fish · {defaultOption.weight}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground">
                        ₹{defaultOption.price}
                      </span>
                      <span className="rounded-lg border border-brand-red/10 bg-brand-red/5 px-3 py-1.5 text-[10px] font-bold text-brand-red">
                        Reorder
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Why NONZO */}
          <div className="space-y-4 pt-2">
            <h2 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-foreground">
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
