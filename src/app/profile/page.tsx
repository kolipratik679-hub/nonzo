"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Phone,
  Info,
  MessageSquare,
  Plus,
  ChevronDown,
  ChevronUp,
  Send,
  Lock,
  Shield,
  Bell,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Hash,
  Building2,
  Smartphone,
  Loader2,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

// ── Accordion Row helper ────────────────────────────────────────────
function AccordionSection({
  id,
  icon: Icon,
  label,
  active,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-gray bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wider text-foreground hover:bg-light-gray/50 transition-all"
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-brand-red" />
          {label}
        </span>
        {active ? (
          <ChevronUp className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
      </button>
      {active && (
        <div className="px-4 pb-5 pt-2 border-t border-border-gray/50 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Logout Confirmation Modal ───────────────────────────────────────
function LogoutModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-col items-center p-7 text-center space-y-4">
          <div className="rounded-full bg-red-50 border border-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-brand-red" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">
              Log Out?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-xs mx-auto">
              You will be returned to the home screen. Your cart and saved
              data will be cleared from this session.
            </p>
          </div>
          <div className="w-full space-y-2.5 pt-2">
            <button
              onClick={onConfirm}
              className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale"
            >
              Yes, Log Out
            </button>
            <button
              onClick={onCancel}
              className="w-full rounded-xl border border-border-gray py-3 text-xs font-bold text-zinc-600 hover:bg-light-gray active-scale"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Profile Page ───────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user, login: authLogin, logout: authLogout, sendOtp, verifyOtp } = useAuth();
  
  const [activeAccordion, setActiveAccordion] = useState<string | null>("personal");
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Profile | NONZO";
  }, []);

  // Personal info state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMobile, setEditMobile] = useState("");

  // OTP login form state
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

  // Address Manager
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddressData, setEditAddressData] = useState<any>(null);

  const [newAddress, setNewAddress] = useState({
    tag: "Home",
    fullName: "",
    flat: "",
    area: "Ulwe Sector 17",
    city: "Navi Mumbai",
    pincode: "410206",
    phone: "",
    landmark: "",
  });

  // User-scoped orders
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Synchronize profile changes and load addresses / orders
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email || "");
      setEditMobile(user.mobile);

      // Load user specific addresses
      const addressKey = `nonzo_addresses_${user.mobile}`;
      const savedAddrs = localStorage.getItem(addressKey);
      if (savedAddrs) {
        try {
          setAddresses(JSON.parse(savedAddrs));
        } catch (e) {
          console.error("Failed to parse addresses", e);
        }
      } else {
        setAddresses([]);
      }

      // Load user specific orders
      const ordersKey = `nonzo_orders_${user.mobile}`;
      const savedOrders = localStorage.getItem(ordersKey);
      if (savedOrders) {
        try {
          setUserOrders(JSON.parse(savedOrders));
        } catch (e) {
          console.error("Failed to parse orders", e);
        }
      } else {
        setUserOrders([]);
      }
    } else {
      setAddresses([]);
      setUserOrders([]);
    }
  }, [user]);

  // Support Ticket Form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authLogin(editName, editMobile, editEmail);
    setIsEditingProfile(false);
  };

  // OTP Login Flow Form Handlers
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

    authLogin(authName, authMobile, authEmail);

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

  // Address Manager functions
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
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, added];
    setAddresses(updated);
    setIsAddingAddress(false);
    
    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updated));
    }

    setNewAddress({
      tag: "Home",
      fullName: user ? user.name : "",
      flat: "",
      area: "Ulwe Sector 17",
      city: "Navi Mumbai",
      pincode: "410206",
      phone: user ? user.mobile : "",
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

    const updated = addresses.map((a) =>
      a.id === editAddressData.id ? { ...editAddressData } : a
    );
    setAddresses(updated);
    setEditingAddressId(null);
    setEditAddressData(null);

    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updated));
    }
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);

    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updated));
    }
  };

  const handleSetDefaultAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`nonzo_addresses_${user.mobile}`, JSON.stringify(updated));
    }
  };

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSuccess(true);
    setTicketSubject("");
    setTicketMessage("");
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nonzo_cart");
      sessionStorage.clear();
    }
    authLogout();
    setShowLogoutModal(false);
    router.push("/");
  };

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <div className="space-y-5 pt-4 pb-16">
        {!user ? (
          /* Step by Step OTP Simulation Gating View */
          <div className="rounded-2xl border border-border-gray bg-white p-6 space-y-4 shadow-md max-w-md mx-auto animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-brand-red/10 flex items-center justify-center">
                <User className="h-6 w-6 text-brand-red" />
              </div>
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                {authStep === "mobile" && "Login / Register"}
                {authStep === "otp" && "Verify OTP"}
                {authStep === "profile" && "Complete Profile"}
                {authStep === "address" && "Complete Address"}
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {authStep === "mobile" && "Verify your number with OTP to view your orders, addresses, and premium settings."}
                {authStep === "otp" && `Type the verification code we sent to +91 ${authMobile}.`}
                {authStep === "profile" && "Let us know your details to set up your fresh account."}
                {authStep === "address" && "Please share your default delivery coordinates."}
              </p>
            </div>

            {authError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-brand-red font-bold flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            
            {authStep === "mobile" && (
              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 block uppercase">
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
                  Next: Complete Address Setup
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

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

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block uppercase">
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
                  className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale shadow-md"
                >
                  Create Account &amp; Log In
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Profile Header card */}
            <div className="rounded-2xl bg-neutral-950 p-6 text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Welcome Back
                </span>
                <h1 className="text-lg font-black mt-0.5">{user.name}</h1>
                <p className="text-[11px] text-zinc-400 mt-1">
                  +91 {user.mobile} &bull; {user.email || "No email provided"}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-brand-red flex items-center justify-center text-xl font-black tracking-wide border-2 border-white/20 shrink-0">
                {user.name.charAt(0)}
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {/* 1. Personal Information */}
              <AccordionSection
                id="personal"
                icon={User}
                label="Personal Information"
                active={activeAccordion === "personal"}
                onToggle={toggleAccordion}
              >
                {!isEditingProfile ? (
                  <div className="space-y-3.5 text-xs">
                    {[
                      { label: "Full Name", value: user.name },
                      { label: "Mobile Number", value: `+91 ${user.mobile}` },
                      { label: "Email Address", value: user.email || "Not Provided" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center border-b border-border-gray/30 pb-2"
                      >
                        <span className="text-zinc-500 font-medium">{row.label}</span>
                        <span className="font-extrabold text-foreground">{row.value}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setEditName(user.name);
                        setEditEmail(user.email || "");
                        setEditMobile(user.mobile);
                        setIsEditingProfile(true);
                      }}
                      className="w-full rounded-xl border border-border-gray py-2.5 font-bold text-zinc-700 hover:bg-light-gray transition-all active-scale"
                    >
                      Edit Details
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    {[
                      { label: "Name", type: "text", value: editName, onChange: setEditName },
                      { label: "Mobile", type: "tel", value: editMobile, onChange: setEditMobile },
                      { label: "Email", type: "email", value: editEmail, onChange: setEditEmail },
                    ].map((field) => (
                      <div key={field.label} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          required
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 rounded-xl border border-border-gray py-2.5 text-xs font-bold text-zinc-600 hover:bg-light-gray"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-brand-red py-2.5 text-xs font-bold text-white hover:bg-red-700 active-scale"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </AccordionSection>

              {/* 2. Account & Security */}
              <AccordionSection
                id="account"
                icon={Shield}
                label="Account &amp; Security"
                active={activeAccordion === "account"}
                onToggle={toggleAccordion}
              >
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-border-gray bg-light-gray/50 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <Lock className="h-4 w-4 text-zinc-400" />
                      <div>
                        <span className="font-bold text-foreground block">Mobile OTP Login</span>
                        <span className="text-[10px] text-zinc-400">Linked: +91 {user.mobile}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 uppercase">
                      Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border-gray bg-light-gray/50 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 text-zinc-400" />
                      <div>
                        <span className="font-bold text-foreground block">Push Notifications</span>
                        <span className="text-[10px] text-zinc-400">Order status &amp; offers</span>
                      </div>
                    </div>
                    <div className="relative h-5 w-9 rounded-full bg-brand-red cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border-gray bg-light-gray/50 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="h-4 w-4 text-zinc-400" />
                      <div>
                        <span className="font-bold text-foreground block">WhatsApp Alerts</span>
                        <span className="text-[10px] text-zinc-400">Order confirmation &amp; tracking</span>
                      </div>
                    </div>
                    <div className="relative h-5 w-9 rounded-full bg-brand-red cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>

                  {/* ADMIN BACKDOOR PORTAL */}
                  <Link
                    href="/admin"
                    className="flex items-center justify-between rounded-xl border border-brand-red bg-brand-red/5 hover:bg-brand-red/10 p-3.5 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-brand-red" />
                      <div>
                        <span className="font-extrabold text-brand-red block">System Control Panel</span>
                        <span className="text-[9px] text-zinc-400">Logistics slots, banners &amp; orders admin</span>
                      </div>
                    </div>
                    <span className="text-brand-red font-black">Open Panel &rarr;</span>
                  </Link>
                </div>
              </AccordionSection>

              {/* 3. Saved Addresses */}
              <AccordionSection
                id="addresses"
                icon={MapPin}
                label="Saved Addresses"
                active={activeAccordion === "addresses"}
                onToggle={toggleAccordion}
              >
                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase">
                    Address Manager
                  </span>
                  <button
                    onClick={() => { setIsAddingAddress(!isAddingAddress); setEditingAddressId(null); }}
                    className="text-xs font-bold text-brand-red flex items-center gap-0.5"
                  >
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                </div>

                {isAddingAddress && !editingAddressId && (
                  <form
                    onSubmit={handleAddAddress}
                    className="border border-dashed border-border-gray rounded-xl p-3.5 space-y-3 animate-fade-in"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Flat / House / Wing"
                      value={newAddress.flat}
                      onChange={(e) => setNewAddress({ ...newAddress, flat: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <select
                      value={newAddress.area}
                      onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    >
                      <option value="Ulwe Sector 5">Ulwe Sector 5</option>
                      <option value="Ulwe Sector 8">Ulwe Sector 8</option>
                      <option value="Ulwe Sector 17">Ulwe Sector 17</option>
                      <option value="Ulwe Sector 24">Ulwe Sector 24</option>
                    </select>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Landmark (Optional)"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Contact"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <div className="flex gap-2">
                      {["Home", "Office", "Other"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, tag })}
                          className={`rounded px-3 py-1 text-[10px] font-bold border transition-all ${
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
                      className="w-full rounded-xl bg-brand-red py-2.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      Save Address
                    </button>
                  </form>
                )}

                {editingAddressId && editAddressData && (
                  <form
                    onSubmit={handleSaveEditAddress}
                    className="border border-brand-red rounded-xl p-3.5 space-y-3 bg-brand-red/5 animate-fade-in"
                  >
                    <h4 className="text-xs font-bold text-brand-red">Edit Address</h4>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={editAddressData.fullName}
                      onChange={(e) => setEditAddressData({ ...editAddressData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Flat / House / Wing"
                      value={editAddressData.flat}
                      onChange={(e) => setEditAddressData({ ...editAddressData, flat: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <select
                      value={editAddressData.area}
                      onChange={(e) => setEditAddressData({ ...editAddressData, area: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    >
                      <option value="Ulwe Sector 5">Ulwe Sector 5</option>
                      <option value="Ulwe Sector 8">Ulwe Sector 8</option>
                      <option value="Ulwe Sector 17">Ulwe Sector 17</option>
                      <option value="Ulwe Sector 24">Ulwe Sector 24</option>
                    </select>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Pincode"
                      value={editAddressData.pincode}
                      onChange={(e) => setEditAddressData({ ...editAddressData, pincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Landmark (Optional)"
                      value={editAddressData.landmark || ""}
                      onChange={(e) => setEditAddressData({ ...editAddressData, landmark: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Contact"
                      value={editAddressData.phone}
                      onChange={(e) => setEditAddressData({ ...editAddressData, phone: e.target.value })}
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <div className="flex gap-2">
                      {["Home", "Office", "Other"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setEditAddressData({ ...editAddressData, tag })}
                          className={`rounded px-3 py-1 text-[10px] font-bold border transition-all ${
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
                        className="flex-grow rounded-xl border border-border-gray py-2 text-xs font-bold text-zinc-500 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-grow rounded-xl bg-brand-red py-2 text-xs font-bold text-white hover:bg-red-700"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {addresses.length === 0 && (
                    <p className="text-xs text-zinc-400 py-3 text-center">No saved addresses found. Complete your profile details.</p>
                  )}

                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-xl border border-border-gray p-3.5 space-y-1 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {addr.fullName}
                          </span>
                          <span className="rounded bg-light-gray border border-border-gray/30 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                            {addr.tag}
                          </span>
                          {addr.isDefault && (
                            <span className="rounded bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>
                        
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
                      <p className="text-[11px] leading-relaxed text-zinc-500">
                        {addr.flat}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      {addr.landmark && (
                        <p className="text-[10px] text-zinc-400 font-medium">
                          Landmark: {addr.landmark}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              {/* 4. Order History */}
              <AccordionSection
                id="orders"
                icon={Package}
                label="Orders History"
                active={activeAccordion === "orders"}
                onToggle={toggleAccordion}
              >
                <div className="space-y-3.5">
                  {userOrders.length === 0 && (
                    <p className="text-xs text-zinc-400 py-3 text-center">No orders placed yet. Add some fish!</p>
                  )}

                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-xl border border-border-gray p-3.5 space-y-3 bg-white"
                    >
                      <div className="flex items-center justify-between border-b border-border-gray/30 pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-foreground block">
                            {ord.id}
                          </span>
                          <span className="text-[9px] text-zinc-400 mt-0.5 block font-medium">
                            {ord.date}
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">
                          {ord.status}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {ord.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-600 font-medium">
                                {item.name}{" "}
                                <strong className="text-foreground">
                                  ({item.weight} &bull; {item.cut} x {item.quantity})
                                </strong>
                              </span>
                              <span className="font-extrabold text-foreground">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                            {item.specialInstructions && item.cut === "Special Cut" && (
                              <div className="mt-1 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 italic">
                                <strong className="text-[8px] uppercase font-extrabold text-zinc-400 block tracking-wider not-italic mb-0.5">Cut Note:</strong>
                                &quot;{item.specialInstructions}&quot;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-border-gray/30 text-xs font-black">
                        <span className="text-zinc-400">Total Charged</span>
                        <span>₹{ord.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              {/* 5. Customer Support Panel */}
              <AccordionSection
                id="support"
                icon={Phone}
                label="Support Center"
                active={activeAccordion === "support"}
                onToggle={toggleAccordion}
              >
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="tel:7788996454"
                    className="flex flex-col items-center justify-center rounded-xl border border-border-gray p-4 text-center hover:border-zinc-300 hover:shadow-sm transition-all active-scale bg-white"
                  >
                    <Phone className="h-6 w-6 text-brand-red mb-2" />
                    <span className="text-xs font-extrabold text-foreground">
                      Call Support
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      7788996454
                    </span>
                  </a>
                  <a
                    href="https://wa.me/917788996549"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center rounded-xl border border-border-gray p-4 text-center hover:border-zinc-300 hover:shadow-sm transition-all active-scale bg-white"
                  >
                    <MessageSquare className="h-6 w-6 text-emerald-600 mb-2" />
                    <span className="text-xs font-extrabold text-foreground">
                      WhatsApp Us
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      7788996549
                    </span>
                  </a>
                </div>

                <form
                  onSubmit={handleRaiseTicket}
                  className="border border-border-gray/50 rounded-xl p-4 space-y-3"
                >
                  <h3 className="text-xs font-bold text-foreground">
                    Raise a Support Ticket
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Subject (e.g. Refund, Packaging quality)"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain the issue in detail..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white resize-none"
                    />
                  </div>

                  {ticketSuccess ? (
                    <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-center py-2.5 rounded-xl text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Ticket raised! We will contact you within 2 hours.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-foreground py-2.5 text-xs font-extrabold text-white flex items-center justify-center gap-1.5 hover:bg-zinc-800 active-scale"
                    >
                      Send Ticket
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                </form>
              </AccordionSection>

              {/* 6. About NONZO */}
              <AccordionSection
                id="about"
                icon={Info}
                label="About NONZO"
                active={activeAccordion === "about"}
                onToggle={toggleAccordion}
              >
                <div className="space-y-4 text-xs leading-relaxed text-zinc-500">
                  <p>
                    <strong className="text-foreground">NONZO</strong> is a modern
                    commitment to coastal dining —{" "}
                    <strong className="text-foreground">
                      &quot;Eat Better. Live Better.&quot;
                    </strong>{" "}
                    We deliver 100% fresh, chemical-free and preservative-free
                    seafood directly from sustainable docks.
                  </p>
                  <p>
                    Our rigorous cold-chain processes guarantee fish are maintained
                    between 0°C and 4°C from dock to delivery, preserving flavor,
                    texture, and nutritive values.
                  </p>

                  <div className="space-y-3 border-t border-border-gray/30 pt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 text-zinc-400 font-medium">
                        <Hash className="h-3.5 w-3.5" /> App Version
                      </span>
                      <span className="font-bold text-foreground">
                        v1.0.0 &bull; freeze build
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 text-zinc-400 font-medium">
                        <Flag className="h-3.5 w-3.5" /> Made In
                      </span>
                      <span className="font-bold text-foreground">India</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 text-zinc-400 font-medium">
                        <Building2 className="h-3.5 w-3.5" /> Headquarters
                      </span>
                      <span className="font-bold text-foreground">
                        Ulwe, Navi Mumbai
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionSection>
            </div>
            
            {/* Logout button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 text-xs font-bold text-brand-red transition-all hover:bg-red-100 active-scale"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </>
        )}
      </div>
    </>
  );
}
