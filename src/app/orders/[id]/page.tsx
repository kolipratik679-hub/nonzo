"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Package,
  CreditCard,
  Truck,
  HelpCircle,
  X,
  Info
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  weight: string;
  cutTypeId?: string | null;
  cutName: string;
  cutExtraCharge: number;
  unitPrice: number;
  unitOriginalPrice: number;
  quantity: number;
  lineTotal: number;
  specialInstructions?: string | null;
}

interface StatusHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  note: string | null;
  date: string;
  time: string;
}

interface OrderDetails {
  id: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  promoCode?: string | null;
  promoDiscount: number;
  total: number;
  deliveryAddressSnapshot: string;
  deliveryDate: string;
  deliverySlot: string;
  notes?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  statusHistory: StatusHistoryEntry[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, products, cutTypes } = useCart();
  const { id } = use(params);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customer cancellation states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [customReason, setCustomReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load order details.");
      }
      setOrder(data.order);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = `Order Details ${id} | NONZO`;
    if (user) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const handleReorder = () => {
    if (!order) return;
    order.items.forEach((item) => {
      let product = products.find((p) => p.id === item.productId);
      if (!product) {
        product = products.find((p) => p.name.toLowerCase() === item.productName.toLowerCase());
      }

      let cutType = cutTypes.find((c) => c.id === item.cutTypeId);
      if (!cutType) {
        cutType = cutTypes.find((c) => c.name.toLowerCase() === item.cutName.toLowerCase());
      }

      if (!cutType && product) {
        const fallbackCutId = product.allowedCuts[0] || "whole";
        cutType = cutTypes.find((c) => c.id === fallbackCutId);
      }

      if (product && cutType) {
        addToCart(product, item.quantity, item.weight, cutType, item.specialInstructions || "");
      }
    });

    router.push("/cart");
  };

  const handleInitiateCancel = () => {
    setCancelReason("Changed my mind");
    setCustomReason("");
    setCancelError(null);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!order) return;

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
          orderId: order.id,
          reason: finalReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      setShowCancelModal(false);
      // Refresh order details after cancellation
      fetchOrderDetails();
    } catch (err: any) {
      setCancelError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-zinc-500 text-xs font-bold">Please log in to view order details.</p>
        <button
          onClick={() => router.push("/profile")}
          className="rounded-xl bg-brand-red px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 active-scale"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <span className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Fetching ocean fresh details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-sm mx-auto">
        <div className="rounded-full bg-red-50 p-4 border border-red-100">
          <AlertTriangle className="h-8 w-8 text-brand-red" />
        </div>
        <div>
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Unable to load details</h3>
          <p className="text-[11px] text-zinc-400 mt-1">{error || "Order not found."}</p>
        </div>
        <button
          onClick={() => router.push("/orders")}
          className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active-scale"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";
  // Cancellable statuses: PENDING, CONFIRMED, PREPARING
  const isCancellable = (order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "PREPARING") && !isCancelled;
  const isPackedOrLater = ["PACKED", "SHIPPED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);
  const showCancelDisabled = isPackedOrLater && !isCancelled;
  const showCancelBtn = isCancellable || showCancelDisabled;

  // Timeline Steps Configuration
  const timelineSteps = [
    { key: "PENDING", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PREPARING", label: "Preparing" },
    { key: "PACKED", label: "Packed" },
    { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  // Helper to get historical timestamp for a step
  const getStepCompletion = (statusKey: string) => {
    return order.statusHistory.find((h) => h.toStatus === statusKey);
  };

  return (
    <div className="space-y-6 pt-4 pb-16 max-w-2xl mx-auto px-4">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/orders")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground uppercase tracking-wider">
            Order Details
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Details, tracking history, and invoice details.
          </p>
        </div>
      </div>

      {/* Main Order Header Status Card */}
      <div className={`rounded-2xl border p-5 shadow-sm space-y-3.5 relative overflow-hidden bg-white ${
        isCancelled ? "border-red-100" : isDelivered ? "border-emerald-100" : "border-zinc-200"
      }`}>
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Order ID</span>
            <h2 className="text-sm font-black text-zinc-800 tracking-wide">{order.id}</h2>
          </div>
          <span className={`rounded-full text-[9px] font-black px-3.5 py-1 uppercase tracking-wide border ${
            isDelivered
              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
              : isCancelled
              ? "bg-red-50 text-red-800 border-red-100 animate-pulse"
              : "bg-blue-50 text-blue-800 border-blue-100 animate-pulse"
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-zinc-100/50">
          <div>
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Placed On</span>
            <span className="font-semibold text-zinc-700 mt-0.5 block flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              {order.createdAt}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Payment Method</span>
            <span className="font-semibold text-zinc-700 mt-0.5 block flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
              {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Cancellation Alert Banner */}
        {isCancelled && (
          <div className="mt-2.5 rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-brand-red font-black text-xs uppercase tracking-wider">
              <AlertTriangle className="h-4.5 w-4.5" />
              <span>Cancelled by {order.cancelledBy || "CUSTOMER"}</span>
            </div>
            <p className="text-[11px] font-medium text-red-700">
              <strong className="font-bold">Reason:</strong> &quot;{order.cancelReason || "No reason specified."}&quot;
            </p>
            {order.cancelledAt && (
              <p className="text-[10px] text-red-400 font-semibold uppercase">
                At: {order.cancelledAt}
              </p>
            )}
          </div>
        )}
      </div>

      {/* TRACKING TIMELINE */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground pb-2 border-b border-zinc-100">
          Order Tracking
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-zinc-100">
          {timelineSteps.map((step, idx) => {
            const completion = getStepCompletion(step.key);
            const isCompleted = !!completion;
            
            // Check if this step is the current state
            const isCurrent = order.status === step.key;

            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Visual bullet indicator */}
                <span className={`absolute -left-[22px] top-1 h-[14px] w-[14px] rounded-full border-2 transition-all flex items-center justify-center ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isCurrent
                    ? "bg-white border-brand-red animate-pulse scale-125"
                    : "bg-white border-zinc-300"
                }`}>
                  {isCompleted && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                  {isCurrent && !isCompleted && (
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-3">
                    <span className={`text-xs font-bold block ${
                      isCompleted ? "text-emerald-700" : isCurrent ? "text-brand-red font-black" : "text-zinc-400"
                    }`}>
                      {step.label}
                    </span>
                    {isCompleted && completion && (
                      <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100/50 rounded-md px-1.5 py-0.5">
                        Completed
                      </span>
                    )}
                  </div>

                  {isCompleted && completion ? (
                    <p className="text-[10px] text-zinc-400 mt-1 font-semibold flex items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      {completion.date} at {completion.time}
                    </p>
                  ) : isCurrent ? (
                    <p className="text-[10px] text-brand-red mt-1 font-semibold flex items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0 animate-spin" />
                      In progress...
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-300 mt-1 font-medium">Pending progress</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ITEMS BREAKDOWN */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground pb-2 border-b border-zinc-100">
          Items Ordered ({order.items.length})
        </h3>

        <div className="divide-y divide-zinc-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
              {/* Product Thumbnail image */}
              <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-border-gray bg-zinc-50">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              {/* Product info details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground truncate block">{item.productName}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-100 rounded-md px-1.5 py-0.5">
                      {item.weight}
                    </span>
                    <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-100 rounded-md px-1.5 py-0.5">
                      Cut: {item.cutName}
                    </span>
                    <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-100 rounded-md px-1.5 py-0.5">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>

                {item.specialInstructions && (
                  <div className="mt-2 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 italic">
                    <span className="text-[8px] uppercase font-extrabold text-zinc-400 block tracking-wider not-italic mb-0.5">Note:</span>
                    &quot;{item.specialInstructions}&quot;
                  </div>
                )}
              </div>

              {/* Price calculation */}
              <div className="text-right shrink-0 flex flex-col justify-center">
                <span className="text-xs font-black text-foreground block">₹{item.lineTotal}</span>
                <span className="text-[9px] text-zinc-400 font-semibold mt-0.5 block">₹{item.unitPrice}/unit</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADDRESS & LOGISTICS */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground pb-2 border-b border-zinc-100">
          Delivery Details
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="h-4.5 w-4.5 text-brand-red shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase block">Delivery Address</span>
              <p className="text-zinc-600 font-medium leading-relaxed">{order.deliveryAddressSnapshot}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-3">
            <div className="flex items-start gap-2.5">
              <Clock className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase block">Delivery Slot</span>
                <span className="text-zinc-600 font-bold mt-0.5 block">{order.deliverySlot}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Truck className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase block">Delivery Date</span>
                <span className="text-zinc-600 font-bold mt-0.5 block">{order.deliveryDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BILLING SUMMARY */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground pb-2 border-b border-zinc-100">
          Payment &amp; Invoice
        </h3>

        <div className="space-y-2.5 text-xs text-zinc-600">
          <div className="flex justify-between font-medium">
            <span>Item Subtotal</span>
            <span className="font-semibold text-foreground">₹{order.subtotal}</span>
          </div>

          <div className="flex justify-between font-medium">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
          </div>

          {order.promoDiscount > 0 && (
            <div className="flex justify-between font-medium text-emerald-600 bg-emerald-50/50 border border-emerald-100/30 rounded-lg p-2">
              <span className="flex items-center gap-1">
                Promo Discount {order.promoCode ? `(${order.promoCode})` : ""}
              </span>
              <span className="font-bold">-₹{order.promoDiscount}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-zinc-100 text-sm">
            <span className="font-black text-foreground uppercase tracking-wide">Total Paid</span>
            <span className="text-base font-black text-brand-red">₹{order.total}</span>
          </div>

          <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100/50 text-[10px] text-zinc-400 font-bold">
            <span className="uppercase">Payment Status</span>
            <span className={`uppercase font-extrabold rounded-full px-2 py-0.5 border ${
              order.paymentStatus === "PAID"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS ROW */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleReorder}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active-scale transition-colors shadow-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Reorder Items
        </button>

        {showCancelBtn && (
          <div className="flex-1 flex flex-col gap-1.5">
            <button
              disabled={showCancelDisabled}
              onClick={() => isCancellable && handleInitiateCancel()}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border py-3.5 text-xs font-bold transition-all shadow-sm ${
                showCancelDisabled
                  ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "border-red-200 bg-red-50/50 text-brand-red hover:bg-red-50 active-scale"
              }`}
            >
              <X className="h-4 w-4" />
              Cancel Order
            </button>
            {showCancelDisabled && (
              <p className="text-[10px] text-zinc-400 text-center leading-tight font-bold flex items-center justify-center gap-1">
                <Info className="h-3 w-3" />
                Your order has already been packed and can no longer be cancelled.
              </p>
            )}
          </div>
        )}
      </div>

      {/* CANCELLATION MODAL */}
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
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-brand-red font-bold flex items-center gap-2.5 animate-pulse">
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
                    "Ordered by mistake",
                    "Changed my mind",
                    "Delivery taking too long",
                    "Found a better price",
                    "Other"
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        cancelReason === reason
                          ? "border-brand-red bg-red-50/30 text-brand-red font-bold"
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
                  className="flex-1 rounded-xl border border-border-gray py-3.5 text-xs font-bold text-zinc-600 hover:bg-light-gray transition-colors"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={handleConfirmCancel}
                  className="flex-1 rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center transition-colors"
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
