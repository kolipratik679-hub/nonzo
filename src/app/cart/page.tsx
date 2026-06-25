"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Clock,
  BadgePercent,
  X,
  CheckCircle2,
  Gift,
  ChevronDown,
  PackageOpen,
  User,
  Smartphone,
  ShieldAlert,
  Loader2,
  MapPin,
} from "lucide-react";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    promoCode,
    applyPromoCode,
    promoDiscount,
    removePromoCode,
    subtotal,
    deliveryFee,
    cleaningFee,
    finalTotal,
    promoError,
    updateCartItemWeight,
    updateCartItemCut,
    updateCartItemSpecialInstructions,
    cutTypes,
    deliverySettings,
  } = useCart();
  const router = useRouter();
  const [promoInput, setPromoInput] = useState<string>("");
  const [promoTouched, setPromoTouched] = useState<boolean>(false);
  const [isPromoExpanded, setIsPromoExpanded] = useState<boolean>(!!promoCode);

  useEffect(() => {
    document.title = "Cart | NONZO";
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );

  const { user, isLoggedIn, login, sendOtp, verifyOtp } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Gating Auth State Flow
  const [authStep, setAuthStep] = useState<"mobile" | "otp" | "profile" | "address">("mobile");
  const [authMobile, setAuthMobile] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authFlat, setAuthFlat] = useState("");
  const [authArea, setAuthArea] = useState("Ulwe Sector 17");
  const [authPincode, setAuthPincode] = useState("410206");
  const [authLandmark, setAuthLandmark] = useState("");

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authMobile || authMobile.length !== 10) {
      setAuthError("Please enter a valid 10-digit mobile number");
      return;
    }
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await sendOtp(authMobile);
      setAuthStep("otp");
    } catch (err) {
      setAuthError("Failed to send verification code. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp || authOtp.length < 4) {
      setAuthError("Please enter a valid OTP code");
      return;
    }
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const res = await verifyOtp(authMobile, authOtp);
      if (res.success) {
        if (res.isExisting) {
          // Logged in successfully, load addresses
          setShowAuthModal(false);
          router.push("/checkout");
        } else {
          // Redirect to complete profile
          setAuthStep("profile");
        }
      } else {
        setAuthError("Incorrect code. Try 123456.");
      }
    } catch (err) {
      setAuthError("Verification failed. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim()) {
      setAuthError("Please enter your full name");
      return;
    }
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await login(authName, authMobile, authEmail);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || "Failed to complete profile registration.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authFlat.trim() || !authPincode.trim()) {
      setAuthError("Please fill out flat details and pincode");
      return;
    }
    setAuthError(null);

    // Login (saves to registry)
    login(authName, authMobile, authEmail);

    // Save default address
    const savedAddressObj = {
      id: `addr-${Date.now()}`,
      tag: "Home",
      fullName: authName,
      flat: authFlat,
      area: authArea,
      city: "Navi Mumbai",
      pincode: authPincode,
      phone: authMobile,
      landmark: authLandmark || "",
      latitude: null,
      longitude: null,
      isDefault: true
    };

    localStorage.setItem(`nonzo_addresses_${authMobile}`, JSON.stringify([savedAddressObj]));

    setShowAuthModal(false);
    router.push("/checkout");
  };

  const threshold = deliverySettings?.freeDeliveryThreshold ?? 699;
  const neededForFree = threshold - subtotal;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 space-y-6">
        <div className="relative">
          <div className="rounded-full bg-light-gray border border-border-gray p-8">
            <svg className="h-16 w-16 text-zinc-300" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 40C22 22 44 16 62 30C68 34 72 40 76 40C72 40 68 46 62 50C44 64 22 58 10 40Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 40C24 30 36 28 48 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
              <circle cx="64" cy="34" r="2.5" fill="currentColor"/>
              <path d="M12 40L6 30V50L12 40Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M50 25C47 32 47 48 50 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-brand-red p-1.5">
            <PackageOpen className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-base font-black text-foreground">
            Your Cart Is Empty
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Add some fresh seafood to get started — no preservatives, straight from the water.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 text-xs font-bold text-white hover:bg-red-700 active-scale"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-3 pb-32 md:pb-12">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-foreground">Your Cart</h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {totalItems} {totalItems === 1 ? "item" : "items"} &bull;{" "}
            {cart.length} {cart.length === 1 ? "product" : "products"}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-[10px] font-bold text-zinc-400 border border-border-gray rounded-full px-3 py-1.5 hover:border-zinc-400 hover:text-foreground transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      {neededForFree > 0 ? (
        <div className="rounded-2xl border border-brand-red/10 bg-brand-red/5 p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-foreground">
              Add <span className="text-brand-red font-black">₹{neededForFree}</span> more to get <span className="text-brand-red font-black">FREE Delivery</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold">
              Threshold: ₹{threshold}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-grow bg-zinc-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-red h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
              />
            </div>
            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-brand-red px-3.5 py-1.5 text-[10px] font-black uppercase text-white hover:bg-red-700 active-scale shrink-0 shadow-sm shadow-brand-red/15 animate-pulse"
            >
              Add Fish
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-1 shadow-sm flex items-center gap-2">
          <div className="rounded-full bg-emerald-500 p-1 text-white flex items-center justify-center shrink-0">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-extrabold text-emerald-800">
            Congratulations! You are eligible for <span className="underline decoration-wavy decoration-emerald-500">FREE Delivery</span>
          </span>
        </div>
      )}

      {/* Cart items */}
      <div className="space-y-3">
        {cart.map((item) => {
          const allowedCuts = item._product?.allowedCuts || [];
          const currentCutId = item._cutType?.id || "whole";
          const allowedCutObjects = cutTypes.filter(
            (c) => allowedCuts.includes(c.id) && (c.status === "active" || c.id === currentCutId)
          );

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border-gray bg-white p-3.5 space-y-3"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-light-gray">
                  <Image
                    src={item.image || "/NONZO-LOGO.png"}
                    alt={item.name || "Product image"}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-foreground leading-tight truncate">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <div className="relative inline-flex items-center">
                      <select
                        value={item.weight}
                        onChange={(e) => updateCartItemWeight(item.id, e.target.value)}
                        className="appearance-none rounded-full bg-zinc-50 hover:bg-zinc-100/80 px-2.5 pr-6 py-1 text-[9px] font-bold text-zinc-600 outline-none border border-border-gray focus:border-brand-red cursor-pointer transition-all"
                      >
                        {["250g", "500g", "1kg", "2kg"].map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 h-2.5 w-2.5 text-zinc-400 stroke-[3]" />
                    </div>

                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">
                      {item._cutType?.name || "Whole Fish"}
                      {(item._cutType?.extraCharge ?? 0) > 0 && (
                        <span className="ml-1 text-amber-600">+₹{item._cutType?.extraCharge}</span>
                      )}
                    </span>
                  </div>


                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-foreground">
                        ₹{item.price * item.quantity}
                      </span>
                      {item.originalPrice > item.price && (
                        <>
                          <span className="ml-1.5 text-[9px] text-zinc-400 line-through">
                            ₹{item.originalPrice * item.quantity}
                          </span>
                          <span className="ml-1.5 text-[9px] font-extrabold text-brand-red">
                            ({Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF)
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-brand-red bg-brand-red/5 px-2.5 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-brand-red active-scale"
                      >
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="text-xs font-extrabold text-foreground w-3 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-brand-red active-scale"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 border border-red-100 text-brand-red transition-all hover:bg-brand-red hover:text-white active-scale"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {allowedCutObjects.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Select Cut Type</span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {allowedCutObjects.map((cut) => {
                      const isActive = currentCutId === cut.id;
                      return (
                        <button
                          key={cut.id}
                          onClick={() => updateCartItemCut(item.id, cut.id)}
                          className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl border p-1.5 transition-all active-scale ${
                            isActive
                              ? "border-brand-red bg-brand-red/5 text-brand-red"
                              : "border-border-gray bg-white text-zinc-500 hover:border-zinc-300"
                          }`}
                          style={{ minWidth: "62px" }}
                        >
                          <div className={`relative h-8 w-8 overflow-hidden rounded-lg border bg-white p-0.5 ${
                            isActive ? "border-brand-red" : "border-border-gray"
                          }`}>
                            <Image
                              src={cut.image}
                              alt={cut.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <span className={`text-[7.5px] font-bold leading-tight text-center ${isActive ? "text-brand-red" : "text-zinc-600"}`}>
                            {cut.name}
                          </span>
                          <span className={`text-[7.5px] font-extrabold rounded-full px-1 py-0.5 ${
                            cut.extraCharge > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {cut.extraCharge === 0 ? "Free" : `+₹${cut.extraCharge}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* FIX #1: Special Cut instructions textarea — shown & editable in cart */}
                  {currentCutId === "special-cut" && (
                    <div className="mt-2 space-y-1.5 animate-fade-in">
                      <label className="text-[9px] font-bold uppercase tracking-wide text-zinc-400 block">
                        Describe your cut preference
                      </label>
                      <textarea
                        rows={3}
                        maxLength={200}
                        value={item.specialInstructions || ""}
                        onChange={(e) =>
                          updateCartItemSpecialInstructions(item.id, e.target.value.slice(0, 200))
                        }
                        placeholder={"Thin slices for fry\nMedium curry pieces\nKeep head attached\nRemove skin"}
                        className="w-full rounded-xl border border-border-gray bg-white p-3 text-xs outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red resize-none"
                      />
                      <div className="text-right text-[9px] text-zinc-400 font-semibold">
                        {(item.specialInstructions || "").length}/200 characters
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Promo code */}
      <div className="rounded-2xl border border-border-gray bg-white p-4">
        {promoCode && promoDiscount > 0 ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-emerald-600 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  Coupon Applied!
                </span>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  You Saved ₹{promoDiscount}
                </p>
              </div>
            </div>
            <button
              onClick={removePromoCode}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors active-scale"
            >
              <X className="h-3 w-3 text-emerald-700" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setIsPromoExpanded(!isPromoExpanded)}
              className="flex w-full items-center justify-between text-left focus:outline-none"
            >
              <span className="text-xs font-extrabold text-brand-red flex items-center gap-1.5 hover:underline">
                <Tag className="h-3.5 w-3.5" />
                Have a promo code?
              </span>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${
                  isPromoExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                isPromoExpanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                  Promo Code
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. NONZO10)"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoTouched(true);
                    }}
                    className="flex-1 rounded-xl border border-border-gray bg-light-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red focus:bg-white transition-all"
                  />
                  <button
                    onClick={() => applyPromoCode(promoInput)}
                    disabled={!promoInput.trim()}
                    className="rounded-xl bg-brand-red px-5 py-2.5 text-xs font-bold text-white disabled:bg-zinc-200 disabled:text-zinc-400 hover:bg-red-700 transition-all active-scale"
                  >
                    Apply
                  </button>
                </div>
                {promoTouched && promoError && (
                  <p className="text-[10px] font-semibold text-brand-red ml-1">
                    {promoError}
                  </p>
                )}
                <div className="flex items-center gap-1.5 ml-1 pt-1">
                  <Gift className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400">
                    Try <span className="font-bold text-foreground">NONZO10</span> for 10% off
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order summary — cleaning fee removed */}
      <div className="rounded-2xl border border-border-gray bg-white p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-foreground mb-3">
          Order Summary
        </h3>

        {[
          { label: "Product Total", value: `₹${subtotal}` },
          { label: "Delivery Fee", value: deliveryFee > 0 ? `₹${deliveryFee}` : "FREE" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between">
            <span className="text-xs text-zinc-500">{row.label}</span>
            <span
              className={`text-xs font-bold ${
                row.value === "FREE" ? "text-emerald-600" : "text-foreground"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}

        {promoDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-xs text-emerald-600">Promo Discount</span>
            <span className="text-xs font-bold text-emerald-600">
              &minus;₹{promoDiscount}
            </span>
          </div>
        )}

        {savings > 0 && (
          <div className="flex justify-between border-t border-border-gray/50 pt-2">
            <span className="text-xs text-emerald-600">You&apos;re saving</span>
            <span className="text-xs font-bold text-emerald-600">₹{savings}</span>
          </div>
        )}

        <div className="border-t border-border-gray pt-2.5 flex justify-between">
          <span className="text-sm font-black text-foreground">Total</span>
          <span className="text-sm font-black text-foreground">₹{finalTotal}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: ShieldCheck, label: "Safe Checkout" },
          { icon: Clock, label: "On-Time Delivery" },
          { icon: CheckCircle2, label: "Freshness Guaranteed" },
          { icon: BadgePercent, label: "Professional Cleaning" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-light-gray border border-border-gray/40 p-3 text-center"
          >
            <Icon className="h-4 w-4 text-brand-red" />
            <span className="text-[8px] font-bold text-zinc-500 leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Proceed to Checkout CTA — styled consistently */}
      <div className="fixed bottom-[57px] left-0 right-0 px-4 z-45 bg-white border-t border-border-gray pt-3 pb-2 md:static md:border-0 md:bg-transparent md:pt-0 md:pb-0 safe-bottom animate-fade-in">
        <button
          onClick={() => {
            if (isLoggedIn) {
              router.push("/checkout");
            } else {
              setAuthStep("mobile");
              setAuthError(null);
              setShowAuthModal(true);
            }
          }}
          className="w-full flex items-center justify-between rounded-2xl bg-brand-red px-6 py-4 shadow-[0_4px_20px_rgba(200,16,46,0.3)] transition-all hover:bg-red-700 active-scale text-white"
          style={{ height: "56px" }}
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-white/75 block">
              Checkout
            </span>
            <span className="text-xs font-black text-white">
              Proceed to Checkout
            </span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-white text-xs">
            <span>Pay ₹{finalTotal}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Auth Modal Gating — Step-by-Step Simulated OTP flow */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1.5 pb-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-brand-red/10 flex items-center justify-center mb-1">
                <User className="h-6 w-6 text-brand-red" />
              </div>
              <h3 className="text-base font-black text-foreground uppercase tracking-wider">
                {authStep === "mobile" && "Login / Register"}
                {authStep === "otp" && "Verify OTP"}
                {authStep === "profile" && "Complete Profile"}
                {authStep === "address" && "Complete Address"}
              </h3>
              <p className="text-[11px] text-zinc-400 leading-normal max-w-xs mx-auto">
                {authStep === "mobile" && "Enter your mobile number to get started with OTP verification."}
                {authStep === "otp" && `Enter the 6-digit verification code sent to +91 ${authMobile}.`}
                {authStep === "profile" && "Let us know your details to set up your fresh account."}
                {authStep === "address" && "Please share your delivery coordinates for fast shipping."}
              </p>
            </div>

            {authError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-brand-red font-bold flex items-center gap-2.5 animate-fade-in">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Step 1: Mobile Form */}
            {authStep === "mobile" && (
              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                    Mobile Number <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10-digit number"
                      value={authMobile}
                      onChange={(e) => setAuthMobile(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-border-gray pl-12 pr-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading || authMobile.length !== 10}
                  className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale shadow-md disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center gap-1.5"
                >
                  {isAuthLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Verification OTP"
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Form */}
            {authStep === "otp" && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                    Verification OTP <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter code (Try: 123456)"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs text-center tracking-widest outline-none focus:border-brand-red bg-white font-bold"
                  />
                  <span className="text-[9px] text-zinc-400 block text-center mt-1">
                    Demo Mode: Use code <strong className="text-zinc-600">123456</strong> or <strong className="text-zinc-600">1234</strong> to simulate validation.
                  </span>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("mobile");
                      setAuthError(null);
                    }}
                    className="flex-1 rounded-xl border border-border-gray py-3 text-xs font-bold text-zinc-600 hover:bg-light-gray"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthLoading || authOtp.length < 4}
                    className="flex-1 rounded-xl bg-brand-red py-3 text-xs font-bold text-white hover:bg-red-700 active-scale disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Complete Profile */}
            {authStep === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                    Full Name <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rohan.sharma@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale flex items-center justify-center gap-1"
                >
                  Continue to Address Setup
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Step 4: Complete Address */}
            {authStep === "address" && (
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                    Flat / House No. / Building <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Flat 101, A Wing, Shell Manor"
                    value={authFlat}
                    onChange={(e) => setAuthFlat(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                      Area Sector <span className="text-brand-red">*</span>
                    </label>
                    <select
                      value={authArea}
                      onChange={(e) => setAuthArea(e.target.value)}
                      className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none focus:border-brand-red bg-white font-bold"
                    >
                      <option value="Ulwe Sector 5">Ulwe Sector 5</option>
                      <option value="Ulwe Sector 8">Ulwe Sector 8</option>
                      <option value="Ulwe Sector 17">Ulwe Sector 17</option>
                      <option value="Ulwe Sector 24">Ulwe Sector 24</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                      Pincode <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="410206"
                      value={authPincode}
                      onChange={(e) => setAuthPincode(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                    Landmark / Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Sector 17 Circle / Opposite DMart"
                    value={authLandmark}
                    onChange={(e) => setAuthLandmark(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale flex items-center justify-center gap-1.5 shadow-md"
                >
                  Create Account &amp; Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
