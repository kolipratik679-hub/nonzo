"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CutType, CUT_TYPES } from "@/lib/mock-data";

// ── Weight Pricing Helpers (Dynamic Pricing) ──────────────────────
const parseWeightToGrams = (w: string): number => {
  const val = parseFloat(w);
  if (w.toLowerCase().includes("kg")) {
    return val * 1000;
  }
  return val;
};

export const getWeightPrice = (product: Product, weight: string): number => {
  const exactMatch = product.weightOptions.find((o) => o.weight === weight);
  if (exactMatch) return exactMatch.price;

  const baseOpt = product.weightOptions[0];
  const baseWeightVal = parseWeightToGrams(baseOpt.weight);
  const targetWeightVal = parseWeightToGrams(weight);

  const ratio = targetWeightVal / baseWeightVal;
  
  let scaleModifier = 1.0;
  if (ratio > 1) scaleModifier = 0.92; // 8% bulk discount
  if (ratio < 1) scaleModifier = 1.05; // 5% small portion mark-up

  return Math.round(baseOpt.price * ratio * scaleModifier);
};

export const getWeightOriginalPrice = (product: Product, weight: string): number => {
  const exactMatch = product.weightOptions.find((o) => o.weight === weight);
  if (exactMatch) return exactMatch.originalPrice;

  return Math.round(getWeightPrice(product, weight) * 1.2);
};

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
  updateCartItemWeight: (cartItemId: string, weight: string) => void;
  updateCartItemCut: (cartItemId: string, cutId: string) => void;
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
    const price = getWeightPrice(product, weight) + cutType.extraCharge;
    const originalPrice = getWeightOriginalPrice(product, weight) + cutType.extraCharge;
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

  const updateCartItemWeight = (cartItemId: string, newWeight: string) => {
    const item = cart.find((i) => i.id === cartItemId);
    if (!item) return;

    const product = item._product;
    const currentCutType = item._cutType;

    const newWeightPrice = getWeightPrice(product, newWeight);
    const newWeightOriginalPrice = getWeightOriginalPrice(product, newWeight);

    const price = newWeightPrice + currentCutType.extraCharge;
    const originalPrice = newWeightOriginalPrice + currentCutType.extraCharge;

    const newId = `${product.id}-${newWeight}-${currentCutType.id}`;

    const newCart = [...cart];
    const itemIndex = newCart.findIndex((i) => i.id === cartItemId);
    const existingIndex = newCart.findIndex((i) => i.id === newId);

    if (existingIndex > -1 && existingIndex !== itemIndex) {
      newCart[existingIndex].quantity += item.quantity;
      newCart.splice(itemIndex, 1);
    } else {
      newCart[itemIndex] = {
        ...newCart[itemIndex],
        id: newId,
        weight: newWeight,
        price,
        originalPrice,
      };
    }
    saveCart(newCart);
  };

  const updateCartItemCut = (cartItemId: string, newCutId: string) => {
    const item = cart.find((i) => i.id === cartItemId);
    if (!item) return;

    const product = item._product;
    const currentCutType = item._cutType;

    const SPECIAL_CUT_OBJ = {
      id: "special-cut",
      name: "Special Cut",
      description: "Custom specialty cut requested by customer.",
      extraCharge: 30,
      iconSvg: `<svg viewBox="0 0 64 64" class="w-12 h-12 stroke-current fill-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12L52 52M52 12L12 52" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    };

    const cutTypeObj = newCutId === "special-cut"
      ? SPECIAL_CUT_OBJ
      : CUT_TYPES.find((c) => c.id === newCutId) || currentCutType;

    const weightPrice = getWeightPrice(product, item.weight);
    const weightOriginalPrice = getWeightOriginalPrice(product, item.weight);

    const price = weightPrice + cutTypeObj.extraCharge;
    const originalPrice = weightOriginalPrice + cutTypeObj.extraCharge;

    const newId = `${product.id}-${item.weight}-${cutTypeObj.id}`;

    const newCart = [...cart];
    const itemIndex = newCart.findIndex((i) => i.id === cartItemId);
    const existingIndex = newCart.findIndex((i) => i.id === newId);

    if (existingIndex > -1 && existingIndex !== itemIndex) {
      newCart[existingIndex].quantity += item.quantity;
      newCart.splice(itemIndex, 1);
    } else {
      newCart[itemIndex] = {
        ...newCart[itemIndex],
        id: newId,
        cutName: cutTypeObj.name,
        price,
        originalPrice,
        _cutType: cutTypeObj,
      };
    }
    saveCart(newCart);
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
        updateCartItemWeight,
        updateCartItemCut,
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
