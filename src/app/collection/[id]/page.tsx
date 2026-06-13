"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/cart-context";

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { products } = useCart();

  let collectionTitle = "Premium Collection";
  let collectionDesc = "Selected premium seafood items.";
  let filteredProducts = products;

  const collectionId = id.toLowerCase();

  if (collectionId === "best-sellers") {
    collectionTitle = "Best Sellers";
    collectionDesc = "Our most popular, highly-rated seafood cuts.";
    filteredProducts = products.filter((p) =>
      ["tiger-prawns", "silver-pomfret", "rawas", "black-pomfret"].includes(p.id)
    );
  } else if (collectionId === "fresh-today" || collectionId === "landed-fresh") {
    collectionTitle = "Landed Fresh Today";
    collectionDesc = "Strictly 100% preservative-free catch landed in the last 12 hours.";
    filteredProducts = products.filter((p) => p.stockStatus !== "Out Of Stock");
  } else if (collectionId === "buy-again") {
    collectionTitle = "Buy Again favourites";
    collectionDesc = "Seafood options you love re-ordering.";
    filteredProducts = products.filter((p) =>
      ["bombil", "black-pomfret"].includes(p.id)
    );
  } else {
    // Treat as general ID
    collectionTitle = id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

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
            {collectionTitle}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {collectionDesc}
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
            There are currently no active products in the "{collectionTitle}" collection.
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
