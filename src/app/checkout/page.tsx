"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  Banknote,
  CreditCard,
  Loader2,
  AlertTriangle,
  User,
  X,
  ShieldCheck,
  Edit2,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useLocation } from "@/context/location-context";
import { useAuth } from "@/context/auth-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryFee, promoDiscount, finalTotal, clearCart, deliverySettings } = useCart();

  useEffect(() => {
    document.title = "Checkout | NONZO";
  }, []);

  const savings = cart.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const { selectedLocation } = useLocation();
  const { user, isLoggedIn, login, sendOtp, verifyOtp } = useAuth();

  // Address list selection state
  const [localAddresses, setLocalAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Gating Auth State Flow for Non-logged in checkout view
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

  // Address Forms state
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    tag: "Home",
    fullName: "",
    flat: "",
    area: selectedLocation || "Ulwe Sector 17",
    city: "Navi Mumbai",
    pincode: "410206",
    phone: "",
    landmark: "",
  });

  const [editAddressData, setEditAddressData] = useState<any>(null);

  // Synchronize user and addresses
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        const addressKey = `nonzo_addresses_${user.mobile}`;
        const saved = localStorage.getItem(addressKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
              setLocalAddresses(parsed);
              const defaultAddr = parsed.find((a: any) => a.isDefault) || parsed[0];
              setSelectedAddressId(defaultAddr.id);
              return;
            }
          } catch (e) {
            console.error("Failed to parse saved addresses", e);
          }
        }
        setLocalAddresses([]);
        setSelectedAddressId("");
      } else {
        setLocalAddresses([]);
        setSelectedAddressId("");
      }
    }
  }, [user]);

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

  const [deliveryDate, setDeliveryDate] = useState<string>("Tomorrow"); 

  const activeSlots = (deliverySettings?.slots || [
    { id: "slot-1", time: "8 AM – 10 AM", enabled: true, maxOrders: 15 },
    { id: "slot-2", time: "10 AM – 12 PM", enabled: true, maxOrders: 15 },
    { id: "slot-3", time: "5 PM – 9 PM", enabled: true, maxOrders: 15 }
  ]).filter((s: any) => s.enabled);

  const [deliverySlot, setDeliverySlot] = useState<string>(
    activeSlots[0]?.time || "8 AM – 10 AM"
  );
  
  // Razorpay payment integration state
  const [paymentMethod, setPaymentMethod] = useState<string>("online"); 
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStatusText, setPaymentStatusText] = useState<string>("Launching Secure Checkout...");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Delivery Date Selection constraint alert
  const [sameDayAlert, setSameDayAlert] = useState<boolean>(false);

  // Order Placement state
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>("");

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
      setAuthError("Failed to send verification code");
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
          // Logged in successfully, loads saved user specific data automatically
          setAuthError(null);
        } else {
          setAuthStep("profile");
        }
      } else {
        setAuthError("Incorrect code. Try 123456.");
      }
    } catch (err) {
      setAuthError("Verification failed.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim()) {
      setAuthError("Please enter your full name");
      return;
    }
    setAuthError(null);
    setAuthStep("address");
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authFlat.trim() || !authPincode.trim()) {
      setAuthError("Please fill out flat details and pincode");
      return;
    }
    setAuthError(null);

    login(authName, authMobile, authEmail);

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
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.flat || !newAddress.phone) return;

    const id = `addr-${Date.now()}`;
    const added = {
      ...newAddress,
      id,
      landmark: newAddress.landmark || "",
      latitude: null,
      longitude: null,
      isDefault: localAddresses.length === 0,
    };
    const updatedList = [...localAddresses, added];
    setLocalAddresses(updatedList);
    setSelectedAddressId(id);
    setIsAddingAddress(false);

    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updatedList));
    }

    // Reset form
    setNewAddress({
      tag: "Home",
      fullName: "",
      flat: "",
      area: selectedLocation || "Ulwe Sector 17",
      city: "Navi Mumbai",
      pincode: "410206",
      phone: "",
      landmark: "",
    });
  };

  const handleEditAddressStart = (addr: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setEditAddressData({ ...addr });
  };

  const handleSaveEditAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAddressData.fullName || !editAddressData.flat || !editAddressData.phone) return;

    const updatedList = localAddresses.map((a) =>
      a.id === editAddressData.id ? { ...editAddressData } : a
    );
    setLocalAddresses(updatedList);
    setEditingAddressId(null);
    setEditAddressData(null);

    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updatedList));
    }
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = localAddresses.filter((a) => a.id !== id);
    setLocalAddresses(updatedList);

    if (selectedAddressId === id) {
      if (updatedList.length > 0) {
        const defaultAddr = updatedList.find((a) => a.isDefault) || updatedList[0];
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId("");
      }
    }

    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updatedList));
    }
  };

  const handleSetDefaultAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = localAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setLocalAddresses(updatedList);
    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updatedList));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createConfirmedOrder = (paymentId?: string, rzpOrderId?: string, paymentStatus?: string) => {
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
        price: item.price,
        specialInstructions: item.specialInstructions || ""
      })),
      total: finalTotal,
      paymentMethod: paymentMethod === "online" ? "Online Payment (Razorpay)" : "Cash On Delivery",
      paymentStatus: paymentStatus || (paymentMethod === "online" ? "Paid" : "Pending"),
      paymentId: paymentId || null,
      razorpayOrderId: rzpOrderId || null,
      deliveryAddress: selectedAddress
        ? `${selectedAddress.flat}, ${selectedAddress.area}, ${selectedAddress.city} - ${selectedAddress.pincode}`
        : selectedLocation || "Ulwe, Navi Mumbai"
    };

    // Save to user specific order history
    if (user && typeof window !== "undefined") {
      try {
        const orderKey = `nonzo_orders_${user.mobile}`;
        const existing = localStorage.getItem(orderKey);
        const orderList = existing ? JSON.parse(existing) : [];
        orderList.unshift(newOrder);
        localStorage.setItem(orderKey, JSON.stringify(orderList));

        // Save globally for Admin View
        const globalExisting = localStorage.getItem("nonzo_placed_orders");
        const globalOrderList = globalExisting ? JSON.parse(globalExisting) : [];
        globalOrderList.unshift({ ...newOrder, userMobile: user.mobile, userName: user.name });
        localStorage.setItem("nonzo_placed_orders", JSON.stringify(globalOrderList));
      } catch (e) {
        console.error("Failed to save order to localStorage", e);
      }
    }

    setPlacedOrderId(orderId);
    setIsOrderPlaced(true);
    clearCart();
  };

  const handlePlaceOrder = async () => {
    setPaymentError(null);

    if (paymentMethod === "cod") {
      createConfirmedOrder();
      return;
    }

    // Online payment via Razorpay
    setIsProcessingPayment(true);
    setPaymentStatusText("Creating secure order on payment server...");

    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to create order on payment server");
      }

      const rzpOrder = await orderRes.json();

      setPaymentStatusText("Launching secure checkout interface...");

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay checkout script. Check your internet connection.");
      }

      const selectedAddress = localAddresses.find((a) => a.id === selectedAddressId);
      const formattedAddress = selectedAddress
        ? `${selectedAddress.flat}, ${selectedAddress.area}, ${selectedAddress.city} - ${selectedAddress.pincode}`
        : selectedLocation || "Ulwe, Navi Mumbai";

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SwESWXTwV4F46I",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "NONZO Seafoods",
        description: "Secure Order Payment",
        image: "https://nonzo.vercel.app/NONZO-LOGO.png",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          setPaymentStatusText("Verifying payment transaction signature...");
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json();
              throw new Error(verifyData.error || "Payment signature verification failed");
            }

            setIsProcessingPayment(false);
            createConfirmedOrder(response.razorpay_payment_id, response.razorpay_order_id, "Paid");
          } catch (verifyError: any) {
            setIsProcessingPayment(false);
            setPaymentError(verifyError.message || "Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: user?.name || selectedAddress?.fullName || "",
          email: user?.email || "",
          contact: user?.mobile || selectedAddress?.phone || ""
        },
        notes: {
          address: formattedAddress
        },
        theme: {
          color: "#C8102E"
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentError("Payment verification cancelled. You can retry or complete order via COD.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setIsProcessingPayment(false);
      setPaymentError(`Could not initiate transaction: ${e.message || e}`);
    }
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
            className="w-full flex h-14 items-center justify-center rounded-2xl bg-brand-red py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(200,16,46,0.3)] transition-all hover:bg-red-700 active-scale"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="w-full h-14 rounded-2xl border border-border-gray bg-white py-3 text-xs font-bold text-zinc-700 transition-all hover:bg-light-gray active-scale flex items-center justify-center"
          >
            Track Order Status
          </button>
        </div>
      </div>
    );
  }

  // Not Logged In Checkout Gating OTP View
  if (!isLoggedIn) {
    return (
      <div className="space-y-6 pt-4 pb-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-black text-foreground uppercase tracking-wider">
              Secure Checkout
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Authenticate to complete your order.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border-gray bg-white p-6 space-y-4 shadow-md max-w-md mx-auto">
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
              {authStep === "mobile" && "Enter your 10-digit mobile number to verify and proceed."}
              {authStep === "otp" && `Enter the 6-digit code sent to +91 ${authMobile}.`}
              {authStep === "profile" && "Please complete your profile to register."}
              {authStep === "address" && "Please share your default delivery coordinates."}
            </p>
          </div>

          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-brand-red font-bold flex items-center gap-2.5 animate-fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authStep === "mobile" && (
            <form onSubmit={handleSendOtpSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                  Mobile Number <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">+91</span>
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
                {isAuthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Verification OTP"}
              </button>
            </form>
          )}

          {authStep === "otp" && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
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
                  Demo: Use code <strong className="text-zinc-600">123456</strong> or <strong className="text-zinc-600">1234</strong>.
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => { setAuthStep("mobile"); setAuthError(null); }}
                  className="flex-1 rounded-xl border border-border-gray py-3 text-xs font-bold text-zinc-600 hover:bg-light-gray"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isAuthLoading || authOtp.length < 4}
                  className="flex-1 rounded-xl bg-brand-red py-3 text-xs font-bold text-white hover:bg-red-700 active-scale disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center"
                >
                  {isAuthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                </button>
              </div>
            </form>
          )}

          {authStep === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
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

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. rohan@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale flex items-center justify-center gap-1"
              >
                Next: Complete Address
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {authStep === "address" && (
            <form onSubmit={handleAddressSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                  Flat / House No. / Building <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sea Breeze Heights"
                  value={authFlat}
                  onChange={(e) => setAuthFlat(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                    Area Sector <span className="text-brand-red">*</span>
                  </label>
                  <select
                    value={authArea}
                    onChange={(e) => setAuthArea(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white font-bold"
                  >
                    <option value="Ulwe Sector 5">Ulwe Sector 5</option>
                    <option value="Ulwe Sector 8">Ulwe Sector 8</option>
                    <option value="Ulwe Sector 17">Ulwe Sector 17</option>
                    <option value="Ulwe Sector 24">Ulwe Sector 24</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
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

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
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
                className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale shadow-md"
              >
                Register &amp; Proceed to Checkout
              </button>
            </form>
          )}
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
  const isSameDayEnabled = deliverySettings?.sameDayDelivery ?? false;
  const availableDates = [
    { label: "Today", value: "Today", dateObj: today, enabled: isSameDayEnabled },
    { label: "Tomorrow", value: "Tomorrow", dateObj: tomorrow, enabled: true },
    { label: "Day +2", value: "Day +2", dateObj: day2, enabled: true },
    { label: "Day +3", value: "Day +3", dateObj: day3, enabled: true },
  ];

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
            onClick={() => { setIsAddingAddress(!isAddingAddress); setEditingAddressId(null); }}
            className="text-xs font-bold text-brand-red hover:underline"
          >
            {isAddingAddress ? "Cancel" : "+ Add New Address"}
          </button>
        </div>

        {/* Add Address Form */}
        {isAddingAddress && !editingAddressId && (
          <form
            onSubmit={handleAddAddress}
            className="rounded-2xl border border-border-gray bg-white p-4 space-y-3.5 shadow-sm animate-fade-in"
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
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })}
                className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <input
                type="text"
                required
                placeholder="Landmark / Directions (Optional)"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
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
              Save Address &amp; Select
            </button>
          </form>
        )}

        {/* Edit Address Form */}
        {editingAddressId && editAddressData && (
          <form
            onSubmit={handleSaveEditAddress}
            className="rounded-2xl border border-brand-red bg-white p-4 space-y-3.5 shadow-sm animate-fade-in"
          >
            <h3 className="text-xs font-bold text-brand-red">Edit Address</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={editAddressData.fullName}
                onChange={(e) => setEditAddressData({ ...editAddressData, fullName: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <input
                type="text"
                required
                placeholder="Flat / House No. / Building"
                value={editAddressData.flat}
                onChange={(e) => setEditAddressData({ ...editAddressData, flat: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <select
                value={editAddressData.area}
                onChange={(e) => setEditAddressData({ ...editAddressData, area: e.target.value })}
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
                value={editAddressData.pincode}
                onChange={(e) => setEditAddressData({ ...editAddressData, pincode: e.target.value.replace(/\D/g, "") })}
                className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <input
                type="text"
                placeholder="Landmark / Directions (Optional)"
                value={editAddressData.landmark || ""}
                onChange={(e) => setEditAddressData({ ...editAddressData, landmark: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
              <input
                type="tel"
                required
                placeholder="Mobile Number"
                value={editAddressData.phone}
                onChange={(e) => setEditAddressData({ ...editAddressData, phone: e.target.value })}
                className="col-span-2 w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex gap-2">
              {["Home", "Office", "Other"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setEditAddressData({ ...editAddressData, tag })}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold border transition-all ${
                    editAddressData.tag === tag
                      ? "bg-foreground text-white border-foreground"
                      : "bg-white text-zinc-500 border-border-gray"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setEditingAddressId(null); setEditAddressData(null); }}
                className="flex-1 rounded-xl border border-border-gray py-2.5 text-xs font-bold text-zinc-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand-red py-2.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2.5">
          {localAddresses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border-gray bg-white p-6 text-center text-zinc-400 text-xs font-medium">
              No saved addresses found. Please add a new address to proceed.
            </div>
          )}

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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{addr.fullName}</span>
                      <span className="rounded bg-light-gray border border-border-gray/30 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                          Default
                        </span>
                      )}
                    </div>
                    
                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1.5">
                      {!addr.isDefault && (
                        <button
                          onClick={(e) => handleSetDefaultAddress(addr.id, e)}
                          className="text-[9px] font-bold text-emerald-600 hover:underline px-1 py-0.5 rounded"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={(e) => handleEditAddressStart(addr, e)}
                        className="text-zinc-400 hover:text-zinc-600 p-1 active-scale"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        className="text-brand-red hover:text-red-700 p-1 active-scale"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                    {addr.flat}, {addr.area}, {addr.city} - {addr.pincode}
                  </p>
                  {addr.landmark && (
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                      Landmark: {addr.landmark}
                    </p>
                  )}
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
          Delivery Date &amp; Slot
        </h2>
        
        {/* Date Selector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-brand-red" /> Select Date
          </span>
          <div className="grid grid-cols-4 gap-2.5">
            {availableDates.map((d) => {
              const isSelected = deliveryDate === d.value;
              const isDisabledToday = d.value === "Today" && !d.enabled;

              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => {
                    if (isDisabledToday) {
                      setSameDayAlert(true);
                    } else {
                      setDeliveryDate(d.value);
                      setSameDayAlert(false);
                    }
                  }}
                  className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                    isDisabledToday
                      ? "border-zinc-200 bg-zinc-50/70 text-zinc-400 opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "border-brand-red bg-brand-red/5 text-brand-red active-scale"
                      : "border-border-gray bg-white text-zinc-500 hover:border-zinc-300 active-scale"
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

          {sameDayAlert && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-brand-red font-bold flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-brand-red">Same-day delivery is currently unavailable.</p>
                <p className="mt-1 text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  Please select tomorrow or a future delivery date.
                </p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                  For urgent orders contact: <a href="tel:7788996549" className="text-brand-red font-black underline">7788996549</a>
                </p>
              </div>
            </div>
          )}
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

      {/* 3. Checkout Confidence Block */}
      {selectedAddressId && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3 animate-fade-in">
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
          {/* Online Payment (Razorpay) */}
          <div
            onClick={() => setPaymentMethod("online")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
              paymentMethod === "online" ? "border-brand-red bg-brand-red/5" : "border-border-gray bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-gray">
                <CreditCard className="h-4.5 w-4.5 text-brand-red" />
              </span>
              <div>
                <span className="text-xs font-extrabold text-foreground block">Online Payment (Razorpay)</span>
                <span className="text-[10px] text-zinc-400">Cards, UPI, Netbanking, Wallets</span>
              </div>
            </div>
            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
              paymentMethod === "online" ? "border-brand-red bg-brand-red text-white" : "border-border-gray"
            }`}>
              {paymentMethod === "online" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
          </div>

          {/* COD */}
          <div
            onClick={() => setPaymentMethod("cod")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
              paymentMethod === "cod" ? "border-brand-red bg-brand-red/5" : "border-border-gray bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-gray">
                <Banknote className="h-4.5 w-4.5 text-zinc-600" />
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
        </div>

        {paymentError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-brand-red font-bold flex items-start gap-2.5 animate-fade-in mt-3">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div>
              <p>Payment Transaction Error</p>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{paymentError}</p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Order Summary — cleaning fee omitted */}
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
              <div key={item.id} className="flex flex-col text-xs border-b border-zinc-50 pb-2.5 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-extrabold text-foreground">{item.name}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {item.weight} &bull; {item.cutName} x {item.quantity}
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
                {item.specialInstructions && item._cutType?.id === "special-cut" && (
                  <div className="mt-1 text-[10px] text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg p-2 italic">
                    <strong className="text-[8px] uppercase font-extrabold text-zinc-400 block tracking-wider not-italic mb-0.5">Cut Request Note:</strong>
                    &quot;{item.specialInstructions}&quot;
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-gray/50 pt-3 space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Product Total</span>
            <span className="font-bold text-foreground">₹{subtotal}</span>
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
            <span>Grand Total</span>
            <span>₹{finalTotal}</span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Place Order — styled consistently */}
      <div className="fixed bottom-[57px] left-0 right-0 z-45 border-t border-border-gray bg-white py-3.5 px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] md:relative md:bottom-auto md:border-t-0 md:shadow-none md:p-0 md:bg-transparent safe-bottom animate-fade-in">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden md:block">
            <span className="text-[10px] text-zinc-400 block font-semibold">Grand Total</span>
            <span className="text-base font-black text-foreground">₹{finalTotal}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={localAddresses.length === 0}
            className="w-full flex items-center justify-between rounded-2xl bg-brand-red px-6 py-4 shadow-[0_4px_20px_rgba(200,16,46,0.3)] transition-all hover:bg-red-700 active-scale text-white md:w-auto md:min-w-[320px] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none disabled:cursor-not-allowed"
            style={{ height: "56px" }}
          >
            <div className="text-left">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-white/75 block">Place Order</span>
              <span className="text-xs font-black text-white">
                {paymentMethod === "online" ? "Online Payment (Razorpay)" : "Cash On Delivery"}
              </span>
            </div>
            <div className="flex items-center gap-1 font-extrabold text-white text-xs">
              <span>Pay ₹{finalTotal}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Secure Payment Processing Loader Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 space-y-6 shadow-2xl max-w-xs w-full text-center border border-border-gray/30">
            <div className="relative mx-auto h-16 w-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100 border-t-brand-red animate-spin" />
              <ShieldCheck className="h-7 w-7 text-brand-red animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Secure Payment Processing
              </h3>
              <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                {paymentStatusText}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-zinc-400 bg-zinc-50 py-2 rounded-xl border border-zinc-100">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              <span>PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
