"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Calendar, MapPin, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";

interface OrderItem {
  name: string;
  weight: string;
  cut: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    document.title = "Orders | NONZO";
    
    // Load placed orders from localStorage and merge with MOCK_ORDERS
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nonzo_placed_orders");
      const localOrders = saved ? JSON.parse(saved) : [];
      setOrders([...localOrders, ...MOCK_ORDERS]);
    } else {
      setOrders(MOCK_ORDERS);
    }
  }, []);

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
            const isDelivered = ord.status === "Delivered";
            const isConfirmed = ord.status === "Confirmed" || ord.status === "Confirmed & Preparing";
            
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
                  
                  {/* Status tags */}
                  <span
                    className={`rounded-full text-[9px] font-extrabold px-3 py-1 uppercase tracking-wide border ${
                      isDelivered
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                        : isConfirmed
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
                    <div key={idx} className="flex justify-between items-start gap-4 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-foreground block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5 font-medium">
                          Cut: {item.cut} · Portion: {item.weight} x {item.quantity}
                        </span>
                      </div>
                      <span className="font-black text-foreground shrink-0">
                        ₹{item.price * item.quantity}
                      </span>
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

                {/* Total and actions */}
                <div className="flex justify-between items-center pt-3 border-t border-border-gray/50 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                    {isDelivered ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Delivered successfully
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-brand-red animate-pulse">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
