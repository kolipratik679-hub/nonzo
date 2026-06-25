"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Calendar, MapPin, CheckCircle2, Clock, RotateCcw, AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

interface OrderItem {
  productId?: string;
  cutTypeId?: string;
  name: string;
  weight: string;
  cut: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  cancelReason?: string;
  cancelledAt?: string;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, products, cutTypes } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);

  // Cancellation modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [customReason, setCustomReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Orders | NONZO";
    
    if (user) {
      const fetchOrders = async () => {
        try {
          const res = await fetch("/api/orders");
          if (res.ok) {
            const data = await res.json();
            if (data.orders) {
              setOrders(data.orders);
              localStorage.setItem(`nonzo_orders_${user.mobile}`, JSON.stringify(data.orders));
              return;
            }
          }
        } catch (e) {
          console.error("Failed to fetch orders from DB:", e);
        }
        
        // Fallback
        const saved = localStorage.getItem(`nonzo_orders_${user.mobile}`);
        const localOrders = saved ? JSON.parse(saved) : [];
        setOrders(localOrders);
      };
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const handleReorder = (ord: Order) => {
    ord.items.forEach((item) => {
      // Find product matching item.productId or item.name
      let product = products.find((p) => p.id === item.productId);
      if (!product) {
        product = products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
      }

      // Find cutType matching item.cutTypeId or item.cut
      let cutType = cutTypes.find((c) => c.id === item.cutTypeId);
      if (!cutType) {
        cutType = cutTypes.find((c) => c.name.toLowerCase() === item.cut.toLowerCase());
      }

      if (!cutType && product) {
        // Fallback to first allowed cut
        const fallbackCutId = product.allowedCuts[0] || "whole";
        cutType = cutTypes.find((c) => c.id === fallbackCutId);
      }

      if (product && cutType) {
        addToCart(product, item.quantity, item.weight, cutType, item.specialInstructions || "");
      }
    });

    router.push("/cart");
  };

  const handleInitiateCancel = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelReason("Changed my mind");
    setCustomReason("");
    setCancelError(null);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;
    
    setIsSubmittingCancel(true);
    setCancelError(null);
    
    const finalReason = cancelReason === "Other" ? customReason.trim() : cancelReason;
    if (cancelReason === "Other" && !finalReason) {
      setCancelError("Please provide a cancellation reason.");
      setIsSubmittingCancel(false);
      return;
    }

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          reason: finalReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      // Update Local Storage for User Orders
      if (user) {
        const orderKey = `nonzo_orders_${user.mobile}`;
        const existing = localStorage.getItem(orderKey);
        if (existing) {
          const orderList = JSON.parse(existing);
          const updatedList = orderList.map((o: any) => {
            if (o.id === selectedOrderId) {
              return {
                ...o,
                status: "Cancelled",
                cancelReason: finalReason,
                cancelledAt: new Date().toISOString()
              };
            }
            return o;
          });
          localStorage.setItem(orderKey, JSON.stringify(updatedList));
          setOrders(updatedList);
        }

        // Update Local Storage for Global Placed Orders (Admin View compatibility)
        const globalExisting = localStorage.getItem("nonzo_placed_orders");
        if (globalExisting) {
          const globalOrderList = JSON.parse(globalExisting);
          const updatedGlobalList = globalOrderList.map((o: any) => {
            if (o.id === selectedOrderId) {
              return {
                ...o,
                status: "Cancelled",
                cancelReason: finalReason,
                cancelledAt: new Date().toISOString()
              };
            }
            return o;
          });
          localStorage.setItem("nonzo_placed_orders", JSON.stringify(updatedGlobalList));
        }
      }

      setShowCancelModal(false);
    } catch (err: any) {
      setCancelError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-16">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground uppercase tracking-wider">
            Your Orders
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Track and view details of all your seafood purchases.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <div className="rounded-full bg-light-gray p-6 border border-border-gray">
            <Package className="h-10 w-10 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">No orders yet</h3>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
              You haven&apos;t placed any seafood orders yet. Start exploring our ocean fresh catalog!
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-brand-red px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 active-scale"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isCancelled = ord.status === "CANCELLED";
            const isDelivered = ord.status === "DELIVERED";
            const isPacked = ["PACKED", "SHIPPED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(ord.status);
            const isCancellable = (ord.status === "CONFIRMED" || ord.status === "PREPARING") && !isCancelled;
            const showCancelDisabled = isPacked && !isCancelled;
            const showCancelBtn = isCancellable || showCancelDisabled;
            
            return (
              <div
                key={ord.id}
                className="rounded-2xl border border-border-gray bg-white p-4.5 space-y-4 shadow-sm"
              >
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-border-gray/50 pb-3">
                  <div>
                    <span className="text-xs font-black text-foreground block">
                      Order ID: {ord.id}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" />
                      {ord.date}
                    </span>
                  </div>
                  
                  {/* Status badge */}
                  <span
                    className={`rounded-full text-[9px] font-extrabold px-3 py-1 uppercase tracking-wide border ${
                      isDelivered
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                        : isCancelled
                        ? "bg-red-50 text-red-800 border-red-100"
                        : isPacked
                        ? "bg-orange-50 text-orange-800 border-orange-100"
                        : (ord.status === "CONFIRMED" || ord.status === "PREPARING")
                        ? "bg-blue-50 text-blue-800 border-blue-100"
                        : "bg-amber-50 text-amber-800 border-amber-100"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                {/* Items breakdown list */}
                <div className="space-y-3">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 text-xs border-b border-zinc-50 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-foreground block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5 font-medium">
                            Cut: {item.cut} &bull; Portion: {item.weight} x {item.quantity}
                          </span>
                        </div>
                        <span className="font-black text-foreground shrink-0">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                      {item.specialInstructions && item.cut === "Special Cut" && (
                        <div className="mt-1 text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 italic">
                          <strong className="text-[8px] uppercase font-extrabold text-zinc-400 block tracking-wider not-italic mb-0.5">Cut Preference Note:</strong>
                          &quot;{item.specialInstructions}&quot;
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-2.5 rounded-xl bg-light-gray/40 border border-border-gray/30 p-3 text-xs text-zinc-500">
                  <MapPin className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Delivery Destination</span>
                    <p className="mt-0.5 text-[11px] truncate leading-normal text-zinc-600 font-medium">
                      {ord.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Cancellation details if cancelled */}
                {isCancelled && ord.cancelReason && (
                  <div className="mt-1 text-[10px] text-red-700 bg-red-50 border border-red-100 rounded-lg p-2.5 italic">
                    <strong className="text-[8px] uppercase font-extrabold text-red-400 block tracking-wider not-italic mb-0.5">Cancellation Reason:</strong>
                    &quot;{ord.cancelReason}&quot;
                  </div>
                )}

                {/* Total and actions */}
                <div className="flex justify-between items-center pt-3 border-t border-border-gray/50 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                    {isCancelled ? (
                      <span className="flex items-center gap-1 text-zinc-400 font-semibold">
                        <AlertTriangle className="h-4 w-4 text-zinc-400" />
                        Order Cancelled
                      </span>
                    ) : isDelivered ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Delivered successfully
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-brand-red animate-pulse font-semibold">
                        <Clock className="h-4 w-4" />
                        Out for fresh delivery
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 font-semibold uppercase text-[9px] block">Total Charged</span>
                    <span className="text-sm font-black text-foreground">₹{ord.total}</span>
                  </div>
                </div>

                {/* Action buttons row */}
                <div className="flex gap-2 pt-3 border-t border-border-gray/50">
                  <button
                    onClick={() => handleReorder(ord)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active-scale transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reorder Items
                  </button>
                  
                  {showCancelBtn && (
                    <div className="flex-1 flex flex-col gap-1">
                      <button
                        disabled={showCancelDisabled}
                        onClick={() => isCancellable && handleInitiateCancel(ord.id)}
                        className={`w-full flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-colors ${
                          showCancelDisabled
                            ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            : "border-red-200 bg-red-50/50 text-brand-red hover:bg-red-50 active-scale"
                        }`}
                      >
                        Cancel Order
                      </button>
                      {showCancelDisabled && (
                        <p className="text-[9px] text-zinc-400 text-center leading-tight font-medium">
                          Your order has already been packed. It can no longer be cancelled.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up animate-fade-in">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1.5 pb-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
                <AlertTriangle className="h-6 w-6 text-brand-red" />
              </div>
              <h3 className="text-base font-black text-foreground uppercase tracking-wider">
                Cancel Order
              </h3>
              <p className="text-[11px] text-zinc-400 leading-normal max-w-xs mx-auto">
                We are sorry to see you cancel. Please let us know the reason so we can improve our service.
              </p>
            </div>

            {cancelError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-brand-red font-bold flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                  Select Reason
                </label>
                <div className="space-y-2">
                  {[
                    "Changed my mind",
                    "Ordered incorrect items",
                    "Delivery time is too long",
                    "Found a better deal elsewhere",
                    "Other"
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        cancelReason === reason
                          ? "border-brand-red bg-red-50/30 text-brand-red font-bold animate-pulse"
                          : "border-border-gray bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={() => setCancelReason(reason)}
                        className="h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300"
                      />
                      <span className="text-xs">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {cancelReason === "Other" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                    Custom Reason <span className="text-brand-red">*</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={150}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Describe why you want to cancel this order..."
                    className="w-full rounded-xl border border-border-gray bg-white p-3 text-xs outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red resize-none font-medium"
                  />
                  <div className="text-right text-[9px] text-zinc-400 font-semibold">
                    {customReason.length}/150 characters
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-xl border border-border-gray py-3 text-xs font-bold text-zinc-600 hover:bg-light-gray transition-colors"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={handleConfirmCancel}
                  className="flex-1 rounded-xl bg-brand-red py-3 text-xs font-bold text-white hover:bg-red-700 active-scale disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center transition-colors"
                >
                  {isSubmittingCancel ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    "Cancel Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
