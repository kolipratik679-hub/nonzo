"use client";
export const dynamic = "force-dynamic";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CutType, CUT_TYPES, PRODUCTS } from "@/lib/mock-data";

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
  products: Product[];
  cutTypes: CutType[];
  updateProducts: (products: Product[]) => void;
  updateCutTypes: (cutTypes: CutType[]) => void;
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
  // Delivery Settings
  deliverySettings: {
    sameDayDelivery: boolean;
    slots: { id: string; time: string; enabled: boolean; maxOrders: number }[];
    freeDeliveryThreshold: number;
    deliveryCharge: number;
  };
  updateDeliverySettings: (settings: {
    sameDayDelivery: boolean;
    slots: { id: string; time: string; enabled: boolean; maxOrders: number }[];
    freeDeliveryThreshold: number;
    deliveryCharge: number;
  }) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cutTypes, setCutTypes] = useState<CutType[]>(CUT_TYPES);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string>("");

  const [deliverySettings, setDeliverySettings] = useState({
    sameDayDelivery: true,
    slots: [
      { id: "slot-1", time: "8 AM – 10 AM", enabled: true, maxOrders: 15 },
      { id: "slot-2", time: "10 AM – 12 PM", enabled: true, maxOrders: 15 },
      { id: "slot-3", time: "5 PM – 9 PM", enabled: true, maxOrders: 15 }
    ],
    freeDeliveryThreshold: 499,
    deliveryCharge: 39
  });

  // Load cart and admin configurations on mount
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

    // Load dynamic products
    try {
      const savedProducts = localStorage.getItem("nonzo_admin_products");
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        localStorage.setItem("nonzo_admin_products", JSON.stringify(PRODUCTS));
      }
    } catch (e) {
      console.error("Failed to load products", e);
    }

    // Load dynamic cut types
    try {
      const savedCuts = localStorage.getItem("nonzo_cut_types");
      if (savedCuts) {
        setCutTypes(JSON.parse(savedCuts));
      } else {
        localStorage.setItem("nonzo_cut_types", JSON.stringify(CUT_TYPES));
      }
    } catch (e) {
      console.error("Failed to load cut types", e);
    }

    // Load delivery settings
    try {
      const savedDelivery = localStorage.getItem("nonzo_delivery_settings");
      if (savedDelivery) {
        const parsed = JSON.parse(savedDelivery);
        setDeliverySettings({
          sameDayDelivery: parsed.sameDayDelivery ?? true,
          slots: parsed.slots ?? [
            { id: "slot-1", time: "8 AM – 10 AM", enabled: true, maxOrders: 15 },
            { id: "slot-2", time: "10 AM – 12 PM", enabled: true, maxOrders: 15 },
            { id: "slot-3", time: "5 PM – 9 PM", enabled: true, maxOrders: 15 }
          ],
          freeDeliveryThreshold: parsed.freeDeliveryThreshold ?? 499,
          deliveryCharge: parsed.deliveryCharge ?? 39
        });
      } else {
        localStorage.setItem("nonzo_delivery_settings", JSON.stringify({
          sameDayDelivery: true,
          slots: [
            { id: "slot-1", time: "8 AM – 10 AM", enabled: true, maxOrders: 15 },
            { id: "slot-2", time: "10 AM – 12 PM", enabled: true, maxOrders: 15 },
            { id: "slot-3", time: "5 PM – 9 PM", enabled: true, maxOrders: 15 }
          ],
          freeDeliveryThreshold: 499,
          deliveryCharge: 39
        }));
      }
    } catch (e) {
      console.error("Failed to load delivery settings", e);
    }
  }, []);

  const updateDeliverySettings = (newSettings: typeof deliverySettings) => {
    setDeliverySettings(newSettings);
    localStorage.setItem("nonzo_delivery_settings", JSON.stringify(newSettings));
  };

  // Persist cart whenever it changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("nonzo_cart", JSON.stringify(newCart));
  };

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem("nonzo_admin_products", JSON.stringify(newProducts));
  };

  const updateCutTypes = (newCuts: CutType[]) => {
    setCutTypes(newCuts);
    localStorage.setItem("nonzo_cut_types", JSON.stringify(newCuts));
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
        image: product.mainImage || product.image,
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
      image: "/images/cuts/clean-blue-crab.png",
      status: "active" as const
    };

    const cutTypeObj = newCutId === "special-cut"
      ? SPECIAL_CUT_OBJ
      : cutTypes.find((c) => c.id === newCutId) || currentCutType;

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

  // Delivery fee: free above freeDeliveryThreshold or FREESHIP code
  const isFreeDelivery = subtotal >= deliverySettings.freeDeliveryThreshold || promoCode === "FREESHIP";
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : deliverySettings.deliveryCharge;

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
        products,
        cutTypes,
        updateProducts,
        updateCutTypes,
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
        deliverySettings,
        updateDeliverySettings,
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
