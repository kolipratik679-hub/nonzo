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
  Image as ImageIcon,
  Send,
  Lock,
  Shield,
  Bell,
  Building2,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Hash,
  Settings,
} from "lucide-react";
import { MOCK_SAVED_ADDRESSES, MOCK_ORDERS } from "@/lib/mock-data";

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
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "personal"
  );
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Profile | NONZO";
  }, []);

  // Personal info state
  const [profile, setProfile] = useState({
    name: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    mobile: "9876543210",
  });
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editMobile, setEditMobile] = useState(profile.mobile);

  // Business info state
  const [businessInfo, setBusinessInfo] = useState({
    gstNumber: "",
    businessName: "",
    businessAddress: "",
  });
  const [isEditingBusiness, setIsEditingBusiness] = useState<boolean>(false);

  // Address Manager
  const [addresses, setAddresses] = useState(MOCK_SAVED_ADDRESSES);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState({
    tag: "Home",
    fullName: "Rohan Sharma",
    flat: "",
    area: "Ulwe Sector 17",
    city: "Navi Mumbai",
    pincode: "410206",
    phone: "9876543210",
  });

  // Support Ticket Form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ name: editName, email: editEmail, mobile: editMobile });
    setIsEditingProfile(false);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.flat) return;
    const id = `addr-${Date.now()}`;
    setAddresses([...addresses, { ...newAddress, id, isDefault: false }]);
    setIsAddingAddress(false);
    setNewAddress({
      tag: "Home",
      fullName: "Rohan Sharma",
      flat: "",
      area: "Ulwe Sector 17",
      city: "Navi Mumbai",
      pincode: "410206",
      phone: "9876543210",
    });
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
    // Clear local storage (cart etc.)
    if (typeof window !== "undefined") {
      localStorage.removeItem("nonzo_cart");
      sessionStorage.clear();
    }
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
        {/* Profile Header card */}
        <div className="rounded-2xl bg-neutral-950 p-6 text-white flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Welcome Back
            </span>
            <h1 className="text-lg font-black mt-0.5">{profile.name}</h1>
            <p className="text-[11px] text-zinc-400 mt-1">
              {profile.mobile} · {profile.email}
            </p>
          </div>
          <div className="h-14 w-14 rounded-full bg-brand-red flex items-center justify-center text-xl font-black tracking-wide border-2 border-white/20 shrink-0">
            {profile.name.charAt(0)}
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
                  { label: "Full Name", value: profile.name },
                  { label: "Mobile Number", value: profile.mobile },
                  { label: "Email Address", value: profile.email },
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
                    setEditName(profile.name);
                    setEditEmail(profile.email);
                    setEditMobile(profile.mobile);
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
                  {
                    label: "Name",
                    type: "text",
                    value: editName,
                    onChange: setEditName,
                  },
                  {
                    label: "Mobile",
                    type: "tel",
                    value: editMobile,
                    onChange: setEditMobile,
                  },
                  {
                    label: "Email",
                    type: "email",
                    value: editEmail,
                    onChange: setEditEmail,
                  },
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

          {/* 2. Account Section */}
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
                    <span className="text-[10px] text-zinc-400">Linked: +91 {profile.mobile}</span>
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
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">
                Address List
              </span>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-xs font-bold text-brand-red flex items-center gap-0.5"
              >
                <Plus className="h-4 w-4" /> Add New
              </button>
            </div>

            {isAddingAddress && (
              <form
                onSubmit={handleAddAddress}
                className="border border-dashed border-border-gray rounded-xl p-3.5 space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Flat / House / Wing"
                  value={newAddress.flat}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, flat: e.target.value })
                  }
                  className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                />
                <select
                  value={newAddress.area}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, area: e.target.value })
                  }
                  className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red bg-white"
                >
                  <option value="Ulwe Sector 5">Ulwe Sector 5</option>
                  <option value="Ulwe Sector 8">Ulwe Sector 8</option>
                  <option value="Ulwe Sector 17">Ulwe Sector 17</option>
                  <option value="Ulwe Sector 24">Ulwe Sector 24</option>
                </select>
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
                  className="w-full rounded-xl bg-brand-red py-2.5 text-xs font-bold text-white"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-xl border border-border-gray p-3.5 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {addr.fullName}
                    </span>
                    <span className="rounded bg-light-gray border border-border-gray/30 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                      {addr.tag}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    {addr.flat}, {addr.area}, {addr.city} - {addr.pincode}
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
              {MOCK_ORDERS.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-xl border border-border-gray p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-border-gray/30 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-foreground block">
                        {ord.id}
                      </span>
                      <span className="text-[9px] text-zinc-400 mt-0.5 block">
                        {ord.date}
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-zinc-600 font-medium">
                          {item.name}{" "}
                          <strong className="text-foreground">
                            ({item.weight} · {item.cut} x {item.quantity})
                          </strong>
                        </span>
                        <span className="font-extrabold text-foreground">
                          ₹{item.price}
                        </span>
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

          {/* 5. Business Information */}
          <AccordionSection
            id="business"
            icon={Building2}
            label="Business Information"
            active={activeAccordion === "business"}
            onToggle={toggleAccordion}
          >
            {!isEditingBusiness ? (
              <div className="space-y-3.5 text-xs">
                {[
                  {
                    label: "Business Name",
                    value: businessInfo.businessName || "Not set",
                  },
                  {
                    label: "GST Number",
                    value: businessInfo.gstNumber || "Not set",
                  },
                  {
                    label: "Business Address",
                    value: businessInfo.businessAddress || "Not set",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center border-b border-border-gray/30 pb-2"
                  >
                    <span className="text-zinc-500 font-medium">{row.label}</span>
                    <span
                      className={`font-extrabold ${
                        row.value === "Not set"
                          ? "text-zinc-300"
                          : "text-foreground"
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => setIsEditingBusiness(true)}
                  className="w-full rounded-xl border border-border-gray py-2.5 font-bold text-zinc-700 hover:bg-light-gray transition-all active-scale"
                >
                  Add / Edit Business Details
                </button>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Adding a GST number enables you to download GST-compliant invoices for every order.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsEditingBusiness(false);
                }}
                className="space-y-3"
              >
                {[
                  {
                    label: "Business Name",
                    key: "businessName",
                    placeholder: "e.g. Sharma Enterprises",
                  },
                  {
                    label: "GST Number",
                    key: "gstNumber",
                    placeholder: "e.g. 27AAPFU0939F1ZV",
                  },
                  {
                    label: "Business Address",
                    key: "businessAddress",
                    placeholder: "Registered business address",
                  },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block uppercase">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={businessInfo[field.key as keyof typeof businessInfo]}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                    />
                  </div>
                ))}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingBusiness(false)}
                    className="flex-1 rounded-xl border border-border-gray py-2.5 text-xs font-bold text-zinc-600 hover:bg-light-gray"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-brand-red py-2.5 text-xs font-bold text-white hover:bg-red-700 active-scale"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </AccordionSection>

          {/* 6. Customer Support Panel */}
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

            {/* Support Ticket Submission Form */}
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

          {/* 7. About NONZO */}
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

              {/* App Version & Build */}
              <div className="space-y-3 border-t border-border-gray/30 pt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-2 text-zinc-400 font-medium">
                    <Hash className="h-3.5 w-3.5" /> App Version
                  </span>
                  <span className="font-bold text-foreground">
                    v1.0.0 · Phase 1 Build
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

        {/* Admin Dashboard Control Panel card */}
        <Link
          href="/admin"
          className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 hover:bg-zinc-100 hover:border-zinc-300 transition-all active-scale"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white border border-zinc-200 p-2.5">
              <Settings className="h-5 w-5 text-brand-red" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Admin Dashboard Control Panel
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Manage delivery slots, settings, and homepage hero banner carousels.
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-400 -rotate-90" />
        </Link>

        {/* Logout button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 text-xs font-bold text-brand-red transition-all hover:bg-red-100 active-scale"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </>
  );
}
