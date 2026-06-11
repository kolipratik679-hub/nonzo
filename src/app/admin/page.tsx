"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  Clock,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Link2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";

interface SlotSetting {
  id: string;
  time: string;
  enabled: boolean;
  maxOrders: number;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  destinationType: "product" | "category" | "custom";
  destinationValue: string;
  isActive: boolean;
  order: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tabs: 'delivery' | 'banners' | 'assets'
  const [activeTab, setActiveTab] = useState<"delivery" | "banners">("delivery");
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Delivery slot states
  const [sameDayDelivery, setSameDayDelivery] = useState<boolean>(true);
  const [slots, setSlots] = useState<SlotSetting[]>([]);

  // 2. Banner states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerSubtitle, setNewBannerSubtitle] = useState("");
  const [newBannerImage, setNewBannerImage] = useState<string | null>(null);
  const [newBannerDestType, setNewBannerDestType] = useState<"product" | "category" | "custom">("product");
  const [newBannerDestVal, setNewBannerDestVal] = useState(PRODUCTS[0]?.id || "");
  const [dragActive, setDragActive] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    document.title = "Admin Panel | NONZO";

    // Load delivery settings
    const savedDelivery = localStorage.getItem("nonzo_delivery_settings");
    if (savedDelivery) {
      try {
        const parsed = JSON.parse(savedDelivery);
        setSameDayDelivery(parsed.sameDayDelivery);
        setSlots(parsed.slots);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Defaults
      const defaultSlots = [
        { id: "slot-1", time: "8 AM – 10 AM", enabled: true, maxOrders: 15 },
        { id: "slot-2", time: "10 AM – 12 PM", enabled: true, maxOrders: 15 },
        { id: "slot-3", time: "5 PM – 9 PM", enabled: true, maxOrders: 15 },
      ];
      setSlots(defaultSlots);
      localStorage.setItem(
        "nonzo_delivery_settings",
        JSON.stringify({ sameDayDelivery: true, slots: defaultSlots })
      );
    }

    // Load banners
    const savedBanners = localStorage.getItem("nonzo_admin_banners");
    if (savedBanners) {
      try {
        setBanners(JSON.parse(savedBanners));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default banners
      const defaultBanners: Banner[] = [
        {
          id: "banner-1",
          title: "Colossal Tiger Prawns",
          subtitle: "Sweet, juicy freshwater giants caught today.",
          imageUrl: "/images/TIGER PRAWNS.jpg",
          destinationType: "product",
          destinationValue: "tiger-prawns",
          isActive: true,
          order: 1,
        },
        {
          id: "banner-2",
          title: "Fresh Coast Landing",
          subtitle: "Delivered strictly between 0 and 4 degrees.",
          imageUrl: "/images/black pomfret.jpg",
          destinationType: "category",
          destinationValue: "Fish",
          isActive: true,
          order: 2,
        },
      ];
      setBanners(defaultBanners);
      localStorage.setItem("nonzo_admin_banners", JSON.stringify(defaultBanners));
    }
  }, []);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Save Delivery Settings ──
  const handleSaveDelivery = () => {
    const data = { sameDayDelivery, slots };
    localStorage.setItem("nonzo_delivery_settings", JSON.stringify(data));
    triggerNotification("Delivery configurations updated successfully!");
  };

  const handleUpdateSlotTime = (id: string, time: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, time } : s)));
  };

  const handleToggleSlot = (id: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleUpdateSlotMaxOrders = (id: string, maxOrders: number) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, maxOrders } : s)));
  };

  // ── Drag & Drop Banner Upload ──
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewBannerImage(reader.result);
        triggerNotification(`Banner preview loaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Add New Banner ──
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle || !newBannerImage) {
      triggerNotification("Please fill in the title and upload a banner image.");
      return;
    }

    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: newBannerTitle,
      subtitle: newBannerSubtitle,
      imageUrl: newBannerImage,
      destinationType: newBannerDestType,
      destinationValue: newBannerDestVal,
      isActive: true,
      order: banners.length + 1,
    };

    const updated = [...banners, newBanner];
    setBanners(updated);
    localStorage.setItem("nonzo_admin_banners", JSON.stringify(updated));

    // Clear form
    setNewBannerTitle("");
    setNewBannerSubtitle("");
    setNewBannerImage(null);
    triggerNotification("New hero banner added!");
  };

  // ── Delete Banner ──
  const handleDeleteBanner = (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    localStorage.setItem("nonzo_admin_banners", JSON.stringify(updated));
    triggerNotification("Hero banner removed.");
  };

  // ── Toggle Banner Active ──
  const handleToggleBannerActive = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    setBanners(updated);
    localStorage.setItem("nonzo_admin_banners", JSON.stringify(updated));
    triggerNotification("Banner status updated.");
  };

  // ── Change Banner Order ──
  const handleMoveBanner = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === banners.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate order values
    const sequenced = updated.map((b, idx) => ({ ...b, order: idx + 1 }));
    setBanners(sequenced);
    localStorage.setItem("nonzo_admin_banners", JSON.stringify(sequenced));
    triggerNotification("Carousel order modified.");
  };

  return (
    <div className="space-y-6 pt-4 pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profile")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-black text-foreground uppercase tracking-wider">
              Control Panel
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage delivery slots, timings, and hero banner carousels.
            </p>
          </div>
        </div>
        
        {/* Toggle to Image portal */}
        <button
          onClick={() => router.push("/admin/images")}
          className="rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-600 transition-all active-scale"
        >
          Image Assets Catalog
        </button>
      </div>

      {/* Notification popup */}
      {notification && (
        <div className="rounded-xl bg-neutral-900 text-white px-4 py-3.5 text-xs flex items-center justify-between shadow-md animate-fade-in z-50">
          <span>{notification}</span>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-border-gray/50 pb-px">
        <button
          onClick={() => setActiveTab("delivery")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide ${
            activeTab === "delivery"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Settings className="h-4 w-4" />
          Slots &amp; Delivery
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide ${
            activeTab === "banners"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Homepage Banners
        </button>
      </div>

      {/* ── TAB 1: DELIVERY SLOTS SETTINGS ── */}
      {activeTab === "delivery" && (
        <div className="space-y-5">
          {/* General delivery config */}
          <div className="rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              General Logistics
            </h3>
            
            <div className="flex items-center justify-between py-1.5">
              <div>
                <span className="text-xs font-bold text-foreground block">Same Day Delivery</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Allows customers to select Today for orders if enabled</span>
              </div>
              <button
                type="button"
                onClick={() => setSameDayDelivery(!sameDayDelivery)}
                className="focus:outline-none"
              >
                {sameDayDelivery ? (
                  <ToggleRight className="h-9 w-9 text-brand-red" />
                ) : (
                  <ToggleLeft className="h-9 w-9 text-zinc-300" />
                )}
              </button>
            </div>
          </div>

          {/* Slots timing management */}
          <div className="rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Delivery Slots Timings &amp; Limits
            </h3>
            
            <div className="space-y-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                    slot.enabled ? "border-zinc-200 bg-white" : "border-border-gray bg-zinc-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <input
                        type="text"
                        value={slot.time}
                        onChange={(e) => handleUpdateSlotTime(slot.id, e.target.value)}
                        placeholder="Slot Timing"
                        className="text-xs font-bold text-foreground bg-transparent border-b border-transparent focus:border-zinc-300 outline-none w-36"
                      />
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Edit slot display timing</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 justify-between sm:justify-end">
                    {/* Max Orders */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Limit:</span>
                      <input
                        type="number"
                        value={slot.maxOrders}
                        onChange={(e) => handleUpdateSlotMaxOrders(slot.id, parseInt(e.target.value) || 0)}
                        className="w-14 rounded-lg border border-border-gray px-2 py-1 text-center text-xs font-bold outline-none focus:border-brand-red"
                      />
                    </div>

                    {/* Enable Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSlot(slot.id)}
                      className="focus:outline-none"
                    >
                      {slot.enabled ? (
                        <span className="rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-extrabold px-3 py-1 uppercase">Active</span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 border border-zinc-200 text-zinc-400 text-[10px] font-extrabold px-3 py-1 uppercase">Disabled</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveDelivery}
            className="w-full rounded-xl bg-brand-red py-4 text-xs font-extrabold text-white transition-all hover:bg-red-700 active-scale shadow-md"
          >
            Save Logistics Configurations
          </button>
        </div>
      )}

      {/* ── TAB 2: HOMEPAGE HERO BANNERS CAROUSEL ── */}
      {activeTab === "banners" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Form to add new banner */}
          <div className="md:col-span-1 rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
              Add Hero Banner
            </h3>

            <form onSubmit={handleAddBanner} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Landed Fresh Today"
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Banner Subtitle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 100% preservative free pomfrets"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                />
              </div>

              {/* Destination settings */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Link Target Type</label>
                  <select
                    value={newBannerDestType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewBannerDestType(val);
                      if (val === "product") setNewBannerDestVal(PRODUCTS[0]?.id || "");
                      else if (val === "category") setNewBannerDestVal(CATEGORIES[0]?.name || "Fish");
                      else setNewBannerDestVal("");
                    }}
                    className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                  >
                    <option value="product">Link to Product details</option>
                    <option value="category">Link to Category listing</option>
                    <option value="custom">Custom URL path</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Select Target Destination</label>
                  {newBannerDestType === "product" && (
                    <select
                      value={newBannerDestVal}
                      onChange={(e) => setNewBannerDestVal(e.target.value)}
                      className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                    >
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}

                  {newBannerDestType === "category" && (
                    <select
                      value={newBannerDestVal}
                      onChange={(e) => setNewBannerDestVal(e.target.value)}
                      className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  )}

                  {newBannerDestType === "custom" && (
                    <input
                      type="text"
                      required
                      placeholder="e.g. /search?q=prawns"
                      value={newBannerDestVal}
                      onChange={(e) => setNewBannerDestVal(e.target.value)}
                      className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                    />
                  )}
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Banner Image</label>
                
                {newBannerImage ? (
                  <div className="relative aspect-[3/1.2] w-full rounded-xl overflow-hidden border border-border-gray group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={newBannerImage}
                      alt="Banner Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewBannerImage(null)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 active-scale transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-brand-red bg-brand-red/5"
                        : "border-border-gray bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300"
                    }`}
                  >
                    <Upload className="h-7 w-7 text-zinc-400 mb-2" />
                    <span className="text-[11px] font-semibold text-zinc-600 block">Drag &amp; Drop Image Here</span>
                    <span className="text-[9px] text-zinc-400 mt-1 block">Click to upload catalog file</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-red py-3 text-xs font-bold text-white transition-all hover:bg-red-700 active-scale shadow-sm mt-2 flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add to Carousel
              </button>
            </form>
          </div>

          {/* Right Columns: Banner List management */}
          <div className="md:col-span-2 rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
              Active Banner Queue ({banners.length})
            </h3>

            {banners.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs font-medium">
                No hero banners configured. Please create one on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`flex items-center gap-3.5 border rounded-2xl p-3 bg-white transition-all ${
                      banner.isActive ? "border-zinc-200" : "border-border-gray bg-zinc-50/50 opacity-60"
                    }`}
                  >
                    {/* Reordering Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveBanner(index, "up")}
                        disabled={index === 0}
                        className="text-zinc-400 hover:text-foreground disabled:opacity-30 disabled:hover:text-zinc-400 active-scale p-1"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveBanner(index, "down")}
                        disabled={index === banners.length - 1}
                        className="text-zinc-400 hover:text-foreground disabled:opacity-30 disabled:hover:text-zinc-400 active-scale p-1"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="relative aspect-[3/1.2] w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-border-gray">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{banner.title}</h4>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{banner.subtitle}</p>
                      
                      <span className="inline-flex items-center gap-1 rounded bg-zinc-100 border border-border-gray/30 px-1.5 py-0.5 text-[8px] font-bold text-zinc-500 mt-2 uppercase tracking-wide">
                        <Link2 className="h-2 w-2" />
                        Link: {banner.destinationType === "custom" ? banner.destinationValue : `${banner.destinationType}:${banner.destinationValue}`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleBannerActive(banner.id)}
                        className={`rounded-lg px-2.5 py-1.5 text-[9px] font-extrabold uppercase transition-all active-scale ${
                          banner.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                        }`}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </button>

                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 hover:bg-brand-red border border-red-100 hover:border-transparent text-brand-red hover:text-white transition-all active-scale"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
