"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  ArrowLeft,
  X,
  Fish,
  Waves,
  Shell,
  Anchor,
  Compass,
  Clock,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Fish,
  Waves,
  Shell,
  Anchor,
  Compass,
};

const POPULAR_SEARCHES = [
  "Pomfret",
  "Tiger Prawns",
  "Surmai",
  "Rawas",
  "Lobster",
  "Mud Crab",
];

export default function SearchPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleClearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleCategoryChipClick = (catName: string) => {
    setSelectedCategory((prev) =>
      prev?.toLowerCase() === catName.toLowerCase() ? null : catName
    );
  };

  // Live suggestions — match product names to query
  const suggestions = query.trim().length > 0
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
        .slice(0, 5)
        .map((p) => ({ text: p.name, id: p.id }))
    : [];

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesQuery =
      query.trim() === "" ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.tagline.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  const recommendations = PRODUCTS.slice(0, 4);
  const hasResults = filteredProducts.length > 0;

  return (
    <div className="space-y-5 pt-4 pb-12">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>

        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            ref={searchInputRef}
            placeholder="Search fresh fish, crabs, shellfish..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full rounded-2xl border border-border-gray bg-light-gray pl-10 pr-9 py-3 text-xs outline-none focus:border-brand-red focus:bg-white transition-all"
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-2xl border border-border-gray bg-white shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onMouseDown={() => {
                    setQuery(s.text);
                    setShowSuggestions(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-semibold text-foreground hover:bg-light-gray transition-colors border-b border-border-gray/30 last:border-b-0"
                >
                  <SearchIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  {s.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular searches (when no query) */}
      {query.trim() === "" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-red" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Popular Searches
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  setShowSuggestions(false);
                }}
                className="flex items-center gap-1.5 rounded-full border border-border-gray bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-zinc-300 hover:text-foreground transition-all active-scale"
              >
                <Clock className="h-3 w-3 text-zinc-400" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter chips — icon-based */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
          Filter by Category
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory?.toLowerCase() === cat.name.toLowerCase();
            const Icon = CATEGORY_ICONS[cat.iconName] ?? Fish;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChipClick(cat.name)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 active-scale ${
                  isSelected
                    ? "bg-brand-red text-white border-brand-red"
                    : "bg-white text-zinc-500 border-border-gray hover:border-zinc-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.name}
              </button>
            );
          })}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 rounded-full border border-border-gray px-3 py-1.5 text-xs font-bold text-zinc-400 hover:border-zinc-300 shrink-0"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        {hasResults ? (
          <div className="space-y-4">
            {(query.trim() !== "" || selectedCategory) && (
              <div className="flex justify-between items-center border-b border-border-gray pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {query.trim() !== "" ? `Results for "${query}"` : selectedCategory}
                </h2>
                <span className="text-[10px] text-zinc-400 font-semibold">
                  {filteredProducts.length} found
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 py-4">
            {/* No results state */}
            <div className="flex flex-col items-center text-center space-y-3 py-8 bg-light-gray/50 rounded-2xl border border-border-gray/50">
              <div className="rounded-full bg-white border border-border-gray p-4">
                <SearchIcon className="h-8 w-8 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  No results for &quot;{query}&quot;
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal max-w-xs mx-auto">
                  We don&apos;t currently stock this. Try a different name or
                  browse our categories.
                </p>
              </div>
              <button
                onClick={handleClearSearch}
                className="text-xs font-bold text-brand-red hover:underline"
              >
                Clear search
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {recommendations.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
