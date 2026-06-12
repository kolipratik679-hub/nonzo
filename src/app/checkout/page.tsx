"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle2, Truck, Banknote, Smartphone, CreditCard } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useLocation } from "@/context/location-context";
import { MOCK_SAVED_ADDRESSES } from "@/lib/mock-data";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, cleaningFee, deliveryFee, promoDiscount, finalTotal, clearCart } = useCart();

  useEffect(() => {
    document.title = "Checkout | NONZO";
  }, []);

  const savings = cart.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const { selectedLocation } = useLocation();

  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    MOCK_SAVED_ADDRESSES[0]?.id || ""
  );
  
  // New address form state
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState({
    tag: "Home",
    fullName: "",
    flat: "",
    area: selectedLocation || "Ulwe Sector 17",
    city: "Navi Mumbai",
    pincode: "410206",
    phone: ""
  });
  const [localAddresses, setLocalAddresses] = useState(MOCK_SAVED_ADDRESSES);

  // Load settings from localStorage with fallback defaults
  const [adminSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nonzo_delivery_settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse delivery settings", e);
        }
      }
    }
    return {
      sameDayDelivery: true,
      slots: [
        { id: "slot-1", time: "8 AM – 10 AM", enabled: true, maxOrders: 15 },
        { id: "slot-2", time: "10 AM – 12 PM", enabled: true, maxOrders: 15 },
        { id: "slot-3", time: "5 PM – 9 PM", enabled: true, maxOrders: 15 }
      ]
    };
  });

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day2 = new Date();
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date();
  day3.setDate(day3.getDate() + 3);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  };

  // Default date Tomorrow is automatically selected
  const [deliveryDate, setDeliveryDate] = useState<string>("Tomorrow"); 

  const activeSlots = adminSettings.slots.filter((s: any) => s.enabled);
  const [deliverySlot, setDeliverySlot] = useState<string>(
    activeSlots[0]?.time || "8 AM – 10 AM"
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("cod"); // "cod" | "upi" | "card"

  // Order Placement state
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>("");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.flat || !newAddress.phone) return;

    const id = `addr-${Date.now()}`;
    const added = { ...newAddress, id, isDefault: false };
    setLocalAddresses([...localAddresses, added]);
    setSelectedAddressId(id);
    setIsAddingAddress(false);
    // Reset form
    setNewAddress({
      tag: "Home",
      fullName: "",
      flat: "",
      area: selectedLocation || "Ulwe Sector 17",
      city: "Navi Mumbai",
      pincode: "410206",
      phone: ""
    });
  };

  const handlePlaceOrder = () => {
    // Generate a random mock order ID
    const orderId = `NZ-${Math.floor(10000 + Math.random() * 90000)}-${new Date()
      .getFullYear()
      .toString()
      .slice(-2)}`;
    
    const selectedAddress = localAddresses.find((a) => a.id === selectedAddressId);
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      status: "Confirmed & Preparing",
      items: cart.map((item) => ({
        name: item.name,
        weight: item.weight,
        cut: item.cutName,
        quantity: item.quantity,
        price: item.price
      })),
      total: finalTotal,
      deliveryAddress: selectedAddress
        ? `${selectedAddress.flat}, ${selectedAddress.area}, ${selectedAddress.city} - ${selectedAddress.pincode}`
        : selectedLocation || "Ulwe, Navi Mumbai"
    };

    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        const existing = localStorage.getItem("nonzo_placed_orders");
        const orderList = existing ? JSON.parse(existing) : [];
        orderList.unshift(newOrder);
        localStorage.setItem("nonzo_placed_orders", JSON.stringify(orderList));
      } catch (e) {
        console.error("Failed to save order to localStorage", e);
      }
    }

    setPlacedOrderId(orderId);
    setIsOrderPlaced(true);
    
    // Clear global cart state
    clearCart();
  };

  if (isOrderPlaced) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-6 text-center pt-8 pb-12">
        <div className="rounded-full bg-emerald-50 p-6 border border-emerald-100 animate-[bounce_1s_ease-in-out_1]">
          <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        </div>
        
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            Order Placed Successfully!
          </span>
          <h2 className="text-xl font-black text-foreground">
            Thank you for eating better!
          </h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Your fresh seafood order <strong className="text-foreground">{placedOrderId}</strong> is confirmed. Our temperature-controlled cold-chain logistics team is preparing it now.
          </p>
        </div>

        <div className="rounded-2xl border border-border-gray bg-white p-5 w-full max-w-md text-left space-y-4 shadow-sm">
          <div className="flex gap-3 border-b border-border-gray/50 pb-3">
            <Truck className="h-5 w-5 text-brand-red shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Delivery Scheduled</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Date: {deliveryDate} ({
                  deliveryDate === "Today" ? formatDate(today) :
                  deliveryDate === "Tomorrow" ? formatDate(tomorrow) :
                  deliveryDate === "Day +2" ? formatDate(day2) :
                  formatDate(day3)
                })
              </p>
              <p className="text-[11px] text-zinc-500">
                Slot: {deliverySlot}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-brand-red shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Delivery Address</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {localAddresses.find((a) => a.id === selectedAddressId)?.flat},{" "}
                {localAddresses.find((a) => a.id === selectedAddressId)?.area}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3 w-full max-w-md">
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl bg-brand-red py-4 text-xs font-extrabold text-white transition-all hover:bg-red-700 active-scale shadow-md shadow-brand-red/10"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="w-full rounded-xl border border-border-gray bg-white py-4 text-xs font-extrabold text-zinc-700 transition-all hover:bg-light-gray active-scale"
          >
            Track Order Status
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-base font-bold text-foreground">No items to checkout</h2>
        <Link href="/" className="rounded-xl bg-brand-red px-5 py-3 text-xs font-bold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  // Calculate dynamic dates list
  const availableDates = [];
  if (adminSettings.sameDayDelivery) {
    availableDates.push({ label: "Today", value: "Today", dateObj: today });
  }
  availableDates.push({ label: "Tomorrow", value: "Tomorrow", dateObj: tomorrow });
  availableDates.push({ label: "Day +2", value: "Day +2", dateObj: day2 });
  availableDates.push({ label: "Day +3", value: "Day +3", dateObj: day3 });

  return (
    <div className="space-y-6 pt-4 pb-36 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground uppercase tracking-wider">
            Checkout Details
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Complete your delivery arrangements.
          </p>
        </div>
      </div>

      {/* 1. Address Selector Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Select Delivery Address
          </h2>
          <button
            onClick={() => setIsAddingAddress(!isAddingAddress)}
            className="text-xs font-bold text-brand-red hover:underline"
          >
            {isAddingAddress ? "Cancel" : "+ Add New Address"}
          </button>
        </div>

        {isAddingAddress && (
          <form
            onSubmit={handleAddAddress}
            className="rounded-2xl border border-border-gray bg-white p-4 space-y-3.5 shadow-sm"
          >
            <h3 className="text-xs font-bold text-foreground">Add New Address</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <input
                type="text"
                required
                placeholder="Flat / House No. / Building"
                value={newAddress.flat}
                onChange={(e) => setNewAddress({ ...newAddress, flat: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <select
                value={newAddress.area}
                onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white"
              >
                <option value="Ulwe Sector 5">Ulwe Sector 5</option>
                <option value="Ulwe Sector 8">Ulwe Sector 8</option>
                <option value="Ulwe Sector 17">Ulwe Sector 17</option>
                <option value="Ulwe Sector 24">Ulwe Sector 24</option>
              </select>
              <input
                type="text"
                required
                placeholder="Pincode"
                maxLength={6}
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <input
                type="tel"
                required
                placeholder="Mobile Number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex gap-2">
              {["Home", "Office", "Other"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNewAddress({ ...newAddress, tag })}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold border transition-all ${
                    newAddress.tag === tag
                      ? "bg-foreground text-white border-foreground"
                      : "bg-white text-zinc-500 border-border-gray"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-red py-3 text-xs font-bold text-white transition-all hover:bg-red-700 active-scale"
            >
              Save Address & Select
            </button>
          </form>
        )}

        <div className="space-y-2.5">
          {localAddresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all hover:shadow-sm ${
                  isSelected ? "border-brand-red bg-brand-red/5" : "border-border-gray bg-white"
                }`}
              >
                <MapPin className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${isSelected ? "text-brand-red" : "text-zinc-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{addr.fullName}</span>
                    <span className="rounded bg-light-gray border border-border-gray/30 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                      {addr.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                    {addr.flat}, {addr.area}, {addr.city} - {addr.pincode}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400 font-semibold">
                    Phone: {addr.phone}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Delivery Date & Slots */}
      <div className="rounded-2xl border border-border-gray bg-white p-4 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Delivery Date & Slot
        </h2>
        
        {/* Date Selector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-brand-red" /> Select Date
          </span>
          <div className={`grid gap-2.5 ${adminSettings.sameDayDelivery ? "grid-cols-4" : "grid-cols-3"}`}>
            {availableDates.map((d) => {
              const isSelected = deliveryDate === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDeliveryDate(d.value)}
                  className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all active-scale ${
                    isSelected
                      ? "border-brand-red bg-brand-red/5 text-brand-red"
                      : "border-border-gray bg-white text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  {d.label}
                  <span className="block text-[9px] font-medium text-zinc-400 mt-0.5">
                    {formatDate(d.dateObj)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot Selector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-brand-red" /> Select Time Slot
          </span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {activeSlots.map((slot: any) => {
              const isSelected = deliverySlot === slot.time;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setDeliverySlot(slot.time)}
                  className={`rounded-xl border p-3.5 text-center text-xs font-bold transition-all active-scale ${
                    isSelected
                      ? "border-brand-red bg-brand-red/5 text-brand-red"
                      : "border-border-gray bg-white text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  {slot.time}
                  <span className="block text-[9px] font-medium text-zinc-400 mt-0.5">
                    Max Orders: {slot.maxOrders || 15}
                  </span>
                </button>
              );
            })}
            {activeSlots.length === 0 && (
              <p className="text-xs text-zinc-400 col-span-full py-2">No active slots available. Please contact support.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Checkout Confidence Block — summary before payment */}
      {selectedAddressId && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Delivering To
          </h2>
          <div className="space-y-2">
            {(() => {
              const addr = localAddresses.find((a) => a.id === selectedAddressId);
              return addr ? (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{addr.fullName}</span>
                    <span className="text-[11px] text-zinc-500">{addr.flat}, {addr.area}, {addr.city} – {addr.pincode}</span>
                  </div>
                </div>
              ) : null;
            })()}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-xs text-zinc-600 font-semibold">
                {deliveryDate} &bull; {deliverySlot}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Payment Method UI */}

      <div className="rounded-2xl border border-border-gray bg-white p-4 space-y-3.5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Payment Method
        </h2>

        <div className="space-y-2">
          {/* COD */}
          <div
            onClick={() => setPaymentMethod("cod")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
              paymentMethod === "cod" ? "border-brand-red bg-brand-red/5" : "border-border-gray"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-gray">
                <Banknote className="h-4 w-4 text-zinc-600" />
              </span>
              <div>
                <span className="text-xs font-extrabold text-foreground block">Cash On Delivery</span>
                <span className="text-[10px] text-zinc-400">Pay cash or scan QR at delivery</span>
              </div>
            </div>
            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
              paymentMethod === "cod" ? "border-brand-red bg-brand-red text-white" : "border-border-gray"
            }`}>
              {paymentMethod === "cod" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
          </div>

          {/* UPI */}
          <div
            onClick={() => setPaymentMethod("upi")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
              paymentMethod === "upi" ? "border-brand-red bg-brand-red/5" : "border-border-gray"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-gray">
                <Smartphone className="h-4 w-4 text-violet-600" />
              </span>
              <div>
                <span className="text-xs font-extrabold text-foreground block">UPI (GPay / PhonePe)</span>
                <span className="text-[10px] text-zinc-400">Instant checkout via active apps</span>
              </div>
            </div>
            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
              paymentMethod === "upi" ? "border-brand-red bg-brand-red text-white" : "border-border-gray"
            }`}>
              {paymentMethod === "upi" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
          </div>

          {/* Cards */}
          <div
            onClick={() => setPaymentMethod("card")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
              paymentMethod === "card" ? "border-brand-red bg-brand-red/5" : "border-border-gray"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-gray">
                <CreditCard className="h-4 w-4 text-sky-600" />
              </span>
              <div>
                <span className="text-xs font-extrabold text-foreground block">Credit / Debit Card</span>
                <span className="text-[10px] text-zinc-400">Visa, Mastercard, RuPay</span>
              </div>
            </div>
            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
              paymentMethod === "card" ? "border-brand-red bg-brand-red text-white" : "border-border-gray"
            }`}>
              {paymentMethod === "card" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Order Summary */}
      <div className="rounded-2xl border border-border-gray bg-white p-4 space-y-3 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Order Summary
        </h2>
        
        <div className="space-y-3">
          {cart.map((item) => {
            const itemDiscountPct = Math.round(
              ((item.originalPrice - item.price) / item.originalPrice) * 100
            );
            return (
              <div key={item.id} className="flex justify-between items-start gap-2 text-xs">
                <div>
                  <span className="font-extrabold text-foreground">{item.name}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {item.weight} • {item.cutName} x {item.quantity}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground">
                    ₹{item.price * item.quantity}
                  </span>
                  {itemDiscountPct > 0 && (
                    <span className="block text-[9px] font-extrabold text-brand-red mt-0.5">
                      ({itemDiscountPct}% OFF)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-gray/50 pt-3 space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Subtotal</span>
            <span className="font-bold text-foreground">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Cleaning & Handling</span>
            <span className={`font-bold ${cleaningFee === 0 ? "text-emerald-600" : "text-foreground"}`}>
              {cleaningFee > 0 ? `₹${cleaningFee}` : "FREE"}
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Delivery Fee</span>
            <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-600" : "text-foreground"}`}>
              {deliveryFee > 0 ? `₹${deliveryFee}` : "FREE"}
            </span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600">
              <span>Promo Discount</span>
              <span className="font-bold">−₹{promoDiscount}</span>
            </div>
          )}
          {savings > 0 && (
            <div className="flex justify-between text-xs text-emerald-600">
              <span>You&apos;re saving</span>
              <span className="font-bold">₹{savings}</span>
            </div>
          )}
          <div className="border-t border-border-gray pt-2.5 flex justify-between text-sm font-black text-foreground">
            <span>Total</span>
            <span>₹{finalTotal}</span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Place Order */}
      <div className="fixed bottom-[57px] left-0 right-0 z-45 border-t border-border-gray bg-white py-3 px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] md:relative md:bottom-auto md:border-t-0 md:shadow-none md:p-0 md:bg-transparent safe-bottom">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden md:block">
            <span className="text-[10px] text-zinc-400 block font-semibold">Grand Total</span>
            <span className="text-base font-black text-foreground">₹{finalTotal}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full md:w-auto md:px-20 rounded-xl bg-brand-red py-3.5 text-xs font-extrabold text-white transition-all hover:bg-red-700 active-scale shadow-md shadow-brand-red/10 flex items-center justify-center gap-1.5"
          >
            Place Order • ₹{finalTotal}
          </button>
        </div>
      </div>
    </div>
  );
}
