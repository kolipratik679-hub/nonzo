"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/cart-context";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { products } = useCart();

  // Categories are stored lowercased in routes, map to matches in database
  const categoryName = id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
  
  const filteredProducts = products.filter(
    (p) => p.category.toLowerCase() === id.toLowerCase()
  );

  return (
    <div className="space-y-6 pt-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground uppercase tracking-wider">
            {categoryName} Category
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Discover our fresh selection of {categoryName.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-light-gray/50 rounded-2xl border border-dashed border-border-gray">
          <p className="text-sm font-bold text-foreground">No products found</p>
          <p className="text-xs text-zinc-400 max-w-xs leading-normal">
            There are currently no active products configured under the "{categoryName}" category.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-brand-red hover:underline"
          >
            Go back home
          </button>
        </div>
      )}
    </div>
  );
}
