"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CutType } from "@/lib/mock-data";

// ── CartItem: flat shape for easy rendering ────────────────────────
export interface CartItem {
  id: string;           // `${productId}-${weight}-${cutTypeId}`
  // flat display fields
  name: string;
  image: string;
  weight: string;
  cutName: string;
  price: number;        // per-unit total (weight price + cut charge)
  originalPrice: number;// original per-unit (before discount)
  quantity: number;
  specialInstructions: string;
  // raw refs kept for addToCart convenience
  _product: Product;
  _cutType: CutType;
}

// ── Promo codes ────────────────────────────────────────────────────
const PROMO_CODES: Record<string, { minOrder: number; type: "flat" | "pct" | "freeship"; value: number }> = {
  NONZO10:    { minOrder: 0,   type: "pct",     value: 10  },
  NONZO50:    { minOrder: 399, type: "flat",    value: 50  },
  FREESHIP:   { minOrder: 200, type: "freeship",value: 0   },
  EATBETTER:  { minOrder: 599, type: "pct",     value: 15  },
};

// ── Context shape ──────────────────────────────────────────────────
interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity: number,
    weight: string,
    cutType: CutType,
    specialInstructions: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  // Computed totals
  subtotal: number;
  cleaningFee: number;
  deliveryFee: number;
  promoDiscount: number;
  finalTotal: number;
  // Promo
  promoCode: string | null;
  promoError: string;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
  setPromoCode: (code: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string>("");

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("nonzo_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const validCart = parsed.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.price === "number"
          );
          setTimeout(() => setCart(validCart), 0);
        } else {
          localStorage.removeItem("nonzo_cart");
        }
      }
    } catch (e) {
      console.error("Failed to parse cart", e);
      localStorage.removeItem("nonzo_cart");
    }
  }, []);

  // Persist cart whenever it changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("nonzo_cart", JSON.stringify(newCart));
  };

  // ── Add to cart ──────────────────────────────────────────────────
  const addToCart = (
    product: Product,
    quantity: number,
    weight: string,
    cutType: CutType,
    specialInstructions: string
  ) => {
    const weightOption =
      product.weightOptions.find((o) => o.weight === weight) ||
      product.weightOptions[0];
    const price = weightOption.price + cutType.extraCharge;
    const originalPrice = weightOption.originalPrice + cutType.extraCharge;
    const cartItemId = `${product.id}-${weight}-${cutType.id}`;

    const existingIndex = cart.findIndex((item) => item.id === cartItemId);
    const newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
      newCart[existingIndex].specialInstructions = specialInstructions;
    } else {
      newCart.push({
        id: cartItemId,
        name: product.name,
        image: product.image,
        weight,
        cutName: cutType.name,
        price,
        originalPrice,
        quantity,
        specialInstructions,
        _product: product,
        _cutType: cutType,
      });
    }
    saveCart(newCart);
  };

  const removeFromCart = (cartItemId: string) => {
    saveCart(cart.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    saveCart(
      cart.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    saveCart([]);
    setPromoCode(null);
    setPromoError("");
  };

  // ── Promo ────────────────────────────────────────────────────────
  const applyPromoCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    const promo = PROMO_CODES[upper];
    if (!promo) {
      setPromoError("Invalid promo code. Try NONZO10.");
      return;
    }
    if (subtotal < promo.minOrder) {
      setPromoError(
        `Minimum order of ₹${promo.minOrder} required for ${upper}.`
      );
      return;
    }
    setPromoCode(upper);
    setPromoError("");
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setPromoError("");
  };

  // ── Computed values ──────────────────────────────────────────────
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Cleaning fee: ₹30 flat, waived for orders > ₹999
  const cleaningFee = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 30;

  // Delivery fee: free above ₹499 or FREESHIP code
  const isFreeDelivery = subtotal > 499 || promoCode === "FREESHIP";
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : 39;

  // Promo discount
  let promoDiscount = 0;
  if (promoCode && PROMO_CODES[promoCode]) {
    const promo = PROMO_CODES[promoCode];
    if (promo.type === "flat") promoDiscount = promo.value;
    else if (promo.type === "pct")
      promoDiscount = Math.round((subtotal * promo.value) / 100);
    else if (promo.type === "freeship") promoDiscount = deliveryFee; // effectively 0 since delivery is free
  }

  const finalTotal = Math.max(
    0,
    subtotal + cleaningFee + deliveryFee - promoDiscount
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        cleaningFee,
        deliveryFee,
        promoDiscount,
        finalTotal,
        promoCode,
        promoError,
        applyPromoCode,
        removePromoCode,
        setPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
