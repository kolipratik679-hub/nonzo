"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  Scissors,
  ArrowLeftRight,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";
import { useCart } from "@/context/cart-context";
import { formatToIST } from "@/lib/date";

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
  destinationType: "product" | "category" | "collection" | "custom";
  destinationValue: string;
  isActive: boolean;
  order: number;
  offerBadge?: string;
  offerPrice?: number;
  originalPrice?: number;
  ctaText?: string;
  startDate?: string;
  endDate?: string;
}

const MOCK_COLLECTIONS = [
  { id: "best-sellers", name: "Best Sellers" },
  { id: "fresh-today", name: "Fresh Today" },
  { id: "limited-stock", name: "Limited Stock" },
  { id: "weekend-special", name: "Weekend Special" }
];

const AVAILABLE_CUT_IMAGES = [
  { label: "Whole Fish Image", value: "/images/cuts/whole-cut-fish.png" },
  { label: "Curry Cut Image", value: "/images/cuts/curry-cut-fish.png" },
  { label: "Steak Cut Image", value: "/images/cuts/steak-cut-fish.png" },
  { label: "Fillet Image", value: "/images/cuts/fillet-cut-fish.png" },
  { label: "Boneless Cubes/Prawns Image", value: "/images/cuts/cube-cut-prawns.png" },
  { label: "Clean Blue Crab Image", value: "/images/cuts/clean-blue-crab.png" },
  { label: "Clean Cut Lobster Image", value: "/images/cuts/clean-cut-lobster.png" },
  { label: "Completely Peeled Prawns Image", value: "/images/cuts/completerly-peeled-prawns.png" },
  { label: "Tail-On Round Prawns Image", value: "/images/cuts/tail-on-round-prawns.png" },
  { label: "Whole Lobster Image", value: "/images/cuts/whole-lobster.png" },
  { label: "Whole Prawns Image", value: "/images/cuts/whole-prawns.png" }
];

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { products, cutTypes, updateProducts, updateCutTypes, updateDeliverySettings } = useCart();
  
  // Tabs: 'delivery' | 'banners' | 'cuts' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState<"delivery" | "banners" | "cuts" | "products" | "orders">("delivery");
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Delivery slot states
  const [sameDayDelivery, setSameDayDelivery] = useState<boolean>(false);
  const [slots, setSlots] = useState<SlotSetting[]>([]);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(699);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(39);

  // 2. Banner states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerSubtitle, setNewBannerSubtitle] = useState("");
  const [newBannerImage, setNewBannerImage] = useState<string | null>(null);
  const [newBannerDestType, setNewBannerDestType] = useState<"product" | "category" | "collection" | "custom">("product");
  const [newBannerDestVal, setNewBannerDestVal] = useState(products[0]?.id || "");
  const [newBannerBadge, setNewBannerBadge] = useState("");
  const [newBannerOfferPrice, setNewBannerOfferPrice] = useState<string>("");
  const [newBannerOriginalPrice, setNewBannerOriginalPrice] = useState<string>("");
  const [newBannerCtaText, setNewBannerCtaText] = useState("Shop Now");
  const [newBannerStartDate, setNewBannerStartDate] = useState("");
  const [newBannerEndDate, setNewBannerEndDate] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // 3. Cut Type states
  const [newCutId, setNewCutId] = useState("");
  const [newCutName, setNewCutName] = useState("");
  const [newCutDesc, setNewCutDesc] = useState("");
  const [newCutCharge, setNewCutCharge] = useState<number>(0);
  const [newCutImage, setNewCutImage] = useState(AVAILABLE_CUT_IMAGES[0].value);
  const [newCutStatus, setNewCutStatus] = useState<"active" | "disabled">("active");

  const [editingCutId, setEditingCutId] = useState<string | null>(null);
  const [editCutName, setEditCutName] = useState("");
  const [editCutDesc, setEditCutDesc] = useState("");
  const [editCutCharge, setEditCutCharge] = useState<number>(0);
  const [editCutImage, setEditCutImage] = useState("");
  const [editCutStatus, setEditCutStatus] = useState<"active" | "disabled">("active");

  // 4. Product states
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newGalleryImgUrl, setNewGalleryImgUrl] = useState("");

  // 5. Placed orders state
  const [placedOrders, setPlacedOrders] = useState<any[]>([]);

  // Set default product ID once products are loaded
  useEffect(() => {
    if (products && products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Load from localStorage on mount
  useEffect(() => {
    document.title = "Admin Panel | NONZO";

    // Load delivery settings
    const savedDelivery = localStorage.getItem("nonzo_delivery_settings");
    if (savedDelivery) {
      try {
        const parsed = JSON.parse(savedDelivery);
        setSameDayDelivery(parsed.sameDayDelivery ?? false);
        setSlots(parsed.slots || []);
        setFreeDeliveryThreshold(parsed.freeDeliveryThreshold ?? 699);
        setDeliveryCharge(parsed.deliveryCharge ?? 39);
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
      setFreeDeliveryThreshold(699);
      setDeliveryCharge(39);
      localStorage.setItem(
        "nonzo_delivery_settings",
        JSON.stringify({ sameDayDelivery: false, slots: defaultSlots, freeDeliveryThreshold: 699, deliveryCharge: 39 })
      );
    }

    // Load placed orders
    const savedOrders = localStorage.getItem("nonzo_placed_orders");
    if (savedOrders) {
      try {
        setPlacedOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to parse orders on mount", e);
      }
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
    const data = { sameDayDelivery, slots, freeDeliveryThreshold, deliveryCharge };
    localStorage.setItem("nonzo_delivery_settings", JSON.stringify(data));
    updateDeliverySettings(data);
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
      offerBadge: newBannerBadge || undefined,
      offerPrice: newBannerOfferPrice ? parseInt(newBannerOfferPrice) : undefined,
      originalPrice: newBannerOriginalPrice ? parseInt(newBannerOriginalPrice) : undefined,
      ctaText: newBannerCtaText || "Shop Now",
      startDate: newBannerStartDate || undefined,
      endDate: newBannerEndDate || undefined,
    };

    const updated = [...banners, newBanner];
    setBanners(updated);
    localStorage.setItem("nonzo_admin_banners", JSON.stringify(updated));

    // Clear form
    setNewBannerTitle("");
    setNewBannerSubtitle("");
    setNewBannerImage(null);
    setNewBannerBadge("");
    setNewBannerOfferPrice("");
    setNewBannerOriginalPrice("");
    setNewBannerCtaText("Shop Now");
    setNewBannerStartDate("");
    setNewBannerEndDate("");
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

    const sequenced = updated.map((b, idx) => ({ ...b, order: idx + 1 }));
    setBanners(sequenced);
    localStorage.setItem("nonzo_admin_banners", JSON.stringify(sequenced));
    triggerNotification("Carousel order modified.");
  };

  // ── Manage Cut Types Handlers ──
  const handleAddCutType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCutId || !newCutName || !newCutDesc) {
      triggerNotification("Please fill in all fields.");
      return;
    }

    const exists = cutTypes.some((c) => c.id === newCutId);
    if (exists) {
      triggerNotification(`Cut ID "${newCutId}" already exists.`);
      return;
    }

    const newCut = {
      id: newCutId,
      name: newCutName,
      description: newCutDesc,
      extraCharge: newCutCharge,
      image: newCutImage,
      status: newCutStatus,
    };

    updateCutTypes([...cutTypes, newCut]);
    // reset form
    setNewCutId("");
    setNewCutName("");
    setNewCutDesc("");
    setNewCutCharge(0);
    setNewCutImage(AVAILABLE_CUT_IMAGES[0].value);
    triggerNotification(`Cut type "${newCutName}" added successfully!`);
  };

  const handleStartEditCut = (cut: any) => {
    setEditingCutId(cut.id);
    setEditCutName(cut.name);
    setEditCutDesc(cut.description);
    setEditCutCharge(cut.extraCharge);
    setEditCutImage(cut.image);
    setEditCutStatus(cut.status);
  };

  const handleSaveCutEdit = (id: string) => {
    if (!editCutName || !editCutDesc) {
      triggerNotification("Please enter cut name and description.");
      return;
    }

    const updated = cutTypes.map((c) =>
      c.id === id
        ? {
            ...c,
            name: editCutName,
            description: editCutDesc,
            extraCharge: editCutCharge,
            image: editCutImage,
            status: editCutStatus,
          }
        : c
    );

    updateCutTypes(updated);
    setEditingCutId(null);
    triggerNotification("Cut type details updated.");
  };

  const handleDeleteCutType = (id: string) => {
    if (id === "whole") {
      triggerNotification("Cannot delete Whole Fish cut type.");
      return;
    }
    const updated = cutTypes.filter((c) => c.id !== id);
    updateCutTypes(updated);
    triggerNotification("Cut type removed.");
  };

  const handleToggleCutStatus = (id: string) => {
    const updated = cutTypes.map((c) =>
      c.id === id ? { ...c, status: c.status === "active" ? "disabled" as const : "active" as const } : c
    );
    updateCutTypes(updated);
    triggerNotification("Cut status toggled.");
  };

  // ── Manage Product Gallery Handlers ──
  const activeProduct = products.find((p) => p.id === selectedProductId);

  const handleUpdateProductMainImage = (val: string) => {
    if (!activeProduct) return;
    const updated = products.map((p) =>
      p.id === activeProduct.id
        ? { ...p, mainImage: val, image: val } // update both fields for compatibility
        : p
    );
    updateProducts(updated);
    triggerNotification("Product main image updated!");
  };

  const handleAddGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !newGalleryImgUrl.trim()) return;

    const currentGallery = activeProduct.galleryImages || activeProduct.images || [];
    const updatedGallery = [...currentGallery, newGalleryImgUrl.trim()];

    const updated = products.map((p) =>
      p.id === activeProduct.id
        ? { ...p, galleryImages: updatedGallery, images: updatedGallery }
        : p
    );
    updateProducts(updated);
    setNewGalleryImgUrl("");
    triggerNotification("Gallery image added!");
  };

  const handleDeleteGalleryImage = (imgUrl: string) => {
    if (!activeProduct) return;

    const currentGallery = activeProduct.galleryImages || activeProduct.images || [];
    const updatedGallery = currentGallery.filter((url) => url !== imgUrl);

    const updated = products.map((p) =>
      p.id === activeProduct.id
        ? { ...p, galleryImages: updatedGallery, images: updatedGallery }
        : p
    );
    updateProducts(updated);
    triggerNotification("Gallery image deleted.");
  };

  const handleMoveGalleryImage = (idx: number, direction: "left" | "right") => {
    if (!activeProduct) return;

    const currentGallery = [...(activeProduct.galleryImages || activeProduct.images || [])];
    if (direction === "left" && idx === 0) return;
    if (direction === "right" && idx === currentGallery.length - 1) return;

    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    const temp = currentGallery[idx];
    currentGallery[idx] = currentGallery[targetIdx];
    currentGallery[targetIdx] = temp;

    const updated = products.map((p) =>
      p.id === activeProduct.id
        ? { ...p, galleryImages: currentGallery, images: currentGallery }
        : p
    );
    updateProducts(updated);
    triggerNotification("Gallery image reordered.");
  };

  return (
    <div className="space-y-6 pt-3 pb-16">
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
              Manage logistics, homepage banners, custom cut types, and gallery images.
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
      <div className="flex gap-2 border-b border-border-gray/50 pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("delivery")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide shrink-0 ${
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
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide shrink-0 ${
            activeTab === "banners"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Homepage Banners
        </button>
        <button
          onClick={() => setActiveTab("cuts")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide shrink-0 ${
            activeTab === "cuts"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Scissors className="h-4 w-4" />
          Manage Cut Types
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide shrink-0 ${
            activeTab === "products"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Product Gallery Admin
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide shrink-0 ${
            activeTab === "orders"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Clock className="h-4 w-4" />
          Customer Orders
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
            
            <div className="flex items-center justify-between py-1.5 pb-4">
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

            {/* Free Delivery Threshold & Charge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs font-bold outline-none focus:border-brand-red"
                />
                <span className="text-[9px] text-zinc-400 block leading-normal">
                  Orders equal to or above this amount will get free shipping.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Standard Delivery Charge (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs font-bold outline-none focus:border-brand-red"
                />
                <span className="text-[9px] text-zinc-400 block leading-normal">
                  Flat delivery fee applied to orders below the threshold.
                </span>
              </div>
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

              {/* Offer Badge Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Offer Badge</label>
                <select
                  value={newBannerBadge}
                  onChange={(e) => setNewBannerBadge(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                >
                  <option value="">No Badge</option>
                  <option value="Today Special Catch">Today Special Catch</option>
                  <option value="Best Deal">Best Deal</option>
                  <option value="Flash Sale">Flash Sale</option>
                  <option value="Fresh Arrival">Fresh Arrival</option>
                  <option value="Limited Stock">Limited Stock</option>
                  <option value="Weekend Offer">Weekend Offer</option>
                </select>
              </div>

              {/* Pricing row */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Offer Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 299"
                    value={newBannerOfferPrice}
                    onChange={(e) => setNewBannerOfferPrice(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 350"
                    value={newBannerOriginalPrice}
                    onChange={(e) => setNewBannerOriginalPrice(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* CTA Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">CTA Button Text</label>
                <input
                  type="text"
                  placeholder="e.g. Shop Now"
                  value={newBannerCtaText}
                  onChange={(e) => setNewBannerCtaText(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                />
              </div>

              {/* Schedule / Validity dates */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    value={newBannerStartDate}
                    onChange={(e) => setNewBannerStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">End Date</label>
                  <input
                    type="date"
                    value={newBannerEndDate}
                    onChange={(e) => setNewBannerEndDate(e.target.value)}
                    className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red bg-white"
                  />
                </div>
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
                      if (val === "product") setNewBannerDestVal(products[0]?.id || "");
                      else if (val === "category") setNewBannerDestVal(CATEGORIES[0]?.name || "Fish");
                      else if (val === "collection") setNewBannerDestVal(MOCK_COLLECTIONS[0]?.id || "best-sellers");
                      else setNewBannerDestVal("");
                    }}
                    className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                  >
                    <option value="product">Link to Product details</option>
                    <option value="category">Link to Category listing</option>
                    <option value="collection">Link to Collection listing</option>
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
                      {products.map((p) => (
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

                  {newBannerDestType === "collection" && (
                    <select
                      value={newBannerDestVal}
                      onChange={(e) => setNewBannerDestVal(e.target.value)}
                      className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                    >
                      {MOCK_COLLECTIONS.map((col) => (
                        <option key={col.id} value={col.id}>{col.name}</option>
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
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-foreground truncate">{banner.title}</h4>
                        {banner.offerBadge && (
                          <span className="rounded bg-brand-red text-white text-[7px] font-black uppercase px-1.5 py-0.5 tracking-wider">
                            {banner.offerBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">{banner.subtitle}</p>
                      
                      {banner.offerPrice && (
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="font-extrabold text-foreground">₹{banner.offerPrice}</span>
                          {banner.originalPrice && banner.originalPrice > banner.offerPrice && (
                            <>
                              <span className="text-zinc-400 line-through text-[9px]">₹{banner.originalPrice}</span>
                              <span className="text-emerald-600 font-extrabold text-[9px] bg-emerald-50 px-1 rounded">
                                {Math.round(((banner.originalPrice - banner.offerPrice) / banner.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 rounded bg-zinc-100 border border-border-gray/30 px-1.5 py-0.5 text-[8px] font-bold text-zinc-500 uppercase tracking-wide">
                          <Link2 className="h-2 w-2" />
                          Link: {banner.destinationType === "custom" ? banner.destinationValue : `${banner.destinationType}:${banner.destinationValue}`}
                        </span>

                        {banner.ctaText && (
                          <span className="inline-flex items-center gap-1 rounded bg-zinc-100 border border-border-gray/30 px-1.5 py-0.5 text-[8px] font-bold text-zinc-500 uppercase tracking-wide">
                            CTA: {banner.ctaText}
                          </span>
                        )}

                        {(banner.startDate || banner.endDate) && (
                          <span className="inline-flex items-center gap-1 rounded bg-zinc-100 border border-border-gray/30 px-1.5 py-0.5 text-[8px] font-bold text-zinc-500 uppercase tracking-wide">
                            Dates: {banner.startDate || "Anytime"} to {banner.endDate || "Anytime"}
                          </span>
                        )}
                      </div>
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

      {/* ── TAB 3: MANAGE CUT TYPES ── */}
      {activeTab === "cuts" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Form to Add Cut Type */}
          <div className="md:col-span-1 rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
              Create New Cut Type
            </h3>
            
            <form onSubmit={handleAddCutType} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Cut ID (unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. steak-cut"
                  value={newCutId}
                  onChange={(e) => setNewCutId(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Cut Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steak Cut"
                  value={newCutName}
                  onChange={(e) => setNewCutName(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Thick slices of the fish center..."
                  value={newCutDesc}
                  onChange={(e) => setNewCutDesc(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Extra Charge (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newCutCharge}
                  onChange={(e) => setNewCutCharge(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Cut Image (Real Image)</label>
                <select
                  value={newCutImage}
                  onChange={(e) => setNewCutImage(e.target.value)}
                  className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                >
                  {AVAILABLE_CUT_IMAGES.map((img) => (
                    <option key={img.value} value={img.value}>{img.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Initial Status</label>
                <select
                  value={newCutStatus}
                  onChange={(e) => setNewCutStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-border-gray px-3 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
                >
                  <option value="active">Active (Visible to customer)</option>
                  <option value="disabled">Disabled (Hidden)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-red py-3 text-xs font-bold text-white transition-all hover:bg-red-700 active-scale shadow-sm mt-2 flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Cut Type
              </button>
            </form>
          </div>

          {/* Right Columns: List of Cut Types */}
          <div className="md:col-span-2 rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
              Cut Types Management Panel ({cutTypes.length})
            </h3>
            
            <div className="space-y-3.5">
              {cutTypes.map((cut) => {
                const isEditing = editingCutId === cut.id;
                return (
                  <div
                    key={cut.id}
                    className={`flex flex-col border rounded-2xl p-4 bg-white transition-all ${
                      cut.status === "active" ? "border-zinc-200" : "border-border-gray bg-zinc-50/50 opacity-70"
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Edit Name</label>
                            <input
                              type="text"
                              value={editCutName}
                              onChange={(e) => setEditCutName(e.target.value)}
                              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Edit Description</label>
                            <textarea
                              rows={2}
                              value={editCutDesc}
                              onChange={(e) => setEditCutDesc(e.target.value)}
                              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Edit Extra Charge (₹)</label>
                            <input
                              type="number"
                              min={0}
                              value={editCutCharge}
                              onChange={(e) => setEditCutCharge(parseInt(e.target.value) || 0)}
                              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Edit Status</label>
                            <select
                              value={editCutStatus}
                              onChange={(e) => setEditCutStatus(e.target.value as any)}
                              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs outline-none bg-white"
                            >
                              <option value="active">Active</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Edit Image</label>
                            <select
                              value={editCutImage}
                              onChange={(e) => setEditCutImage(e.target.value)}
                              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs outline-none bg-white"
                            >
                              {AVAILABLE_CUT_IMAGES.map((img) => (
                                <option key={img.value} value={img.value}>{img.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100">
                          <button
                            type="button"
                            onClick={() => setEditingCutId(null)}
                            className="rounded-lg border border-border-gray px-3.5 py-1.5 text-[10px] font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveCutEdit(cut.id)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-[10px] font-bold transition-colors flex items-center gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        {/* Cut Image */}
                        <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-border-gray bg-zinc-50">
                          <Image
                            src={cut.image}
                            alt={cut.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-foreground">{cut.name}</h4>
                            <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">ID: {cut.id}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{cut.description}</p>
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 rounded-full px-2.5 py-0.5">
                              Extra Charge: +₹{cut.extraCharge}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase rounded-full px-2.5 py-0.5 ${
                              cut.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-brand-red"
                            }`}>
                              {cut.status === "active" ? "Active" : "Disabled"}
                            </span>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleCutStatus(cut.id)}
                            className="p-1.5 rounded-lg border border-border-gray hover:border-zinc-300 text-zinc-500 hover:text-foreground active-scale"
                            title={cut.status === "active" ? "Disable Cut Type" : "Enable Cut Type"}
                          >
                            {cut.status === "active" ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleStartEditCut(cut)}
                            className="p-1.5 rounded-lg border border-border-gray hover:border-zinc-300 text-zinc-500 hover:text-foreground active-scale"
                            title="Edit Details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {cut.id !== "whole" && (
                            <button
                              onClick={() => handleDeleteCutType(cut.id)}
                              className="p-1.5 rounded-lg border border-red-100 hover:border-transparent text-brand-red bg-red-50 hover:bg-brand-red hover:text-white transition-all active-scale"
                              title="Delete Cut Type"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: MANAGE PRODUCT IMAGES ── */}
      {activeTab === "products" && (
        <div className="space-y-5">
          {/* Select Product */}
          <div className="rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Select Product to Configure
            </h3>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full max-w-md rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none bg-white focus:border-brand-red"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {activeProduct && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Product Info & Main Image Management */}
              <div className="md:col-span-1 space-y-5">
                <div className="rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
                    Product Main Image
                  </h3>

                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border-gray bg-zinc-50">
                    <Image
                      src={activeProduct.mainImage || activeProduct.image}
                      alt={activeProduct.name}
                      fill
                      sizes="(min-width: 768px) 30vw, 90vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Change Main Image Path</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-border-gray px-3 py-2 text-xs outline-none focus:border-brand-red"
                      placeholder="e.g. /images/silver pompret.jpeg"
                      value={activeProduct.mainImage || activeProduct.image}
                      onChange={(e) => handleUpdateProductMainImage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Gallery Images Management */}
              <div className="md:col-span-2 rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
                  Unlimited Gallery Images
                </h3>

                {/* Add new gallery image URL */}
                <form onSubmit={handleAddGalleryImage} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter gallery image path (e.g. /images/large prawns.jpg)"
                    value={newGalleryImgUrl}
                    onChange={(e) => setNewGalleryImgUrl(e.target.value)}
                    className="flex-grow rounded-xl border border-border-gray px-3.5 py-2.5 text-xs outline-none focus:border-brand-red"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-red px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-700 active-scale shrink-0"
                  >
                    Add Image
                  </button>
                </form>

                {/* Grid list of gallery images */}
                {(!activeProduct.galleryImages || activeProduct.galleryImages.length === 0) ? (
                  <div className="text-center py-12 text-zinc-400 text-xs">
                    No gallery images configured for this product.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {activeProduct.galleryImages.map((imgUrl, index) => (
                      <div
                        key={imgUrl}
                        className="flex flex-col border border-border-gray rounded-xl overflow-hidden bg-white p-2.5 space-y-2 relative group"
                      >
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100">
                          <Image
                            src={imgUrl}
                            alt={`gallery-${index}`}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>

                        {/* Order & delete controls */}
                        <div className="flex items-center justify-between gap-1 mt-1">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleMoveGalleryImage(index, "left")}
                              disabled={index === 0}
                              className="p-1 rounded bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 disabled:opacity-30 active-scale"
                              title="Move Left"
                            >
                              <ArrowLeftRight className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveGalleryImage(index, "right")}
                              disabled={index === activeProduct.galleryImages.length - 1}
                              className="p-1 rounded bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 disabled:opacity-30 active-scale"
                              title="Move Right"
                            >
                              <ArrowLeftRight className="h-3 w-3 rotate-90" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImage(imgUrl)}
                            className="p-1 rounded bg-red-50 border border-red-100 hover:bg-brand-red hover:text-white text-brand-red transition-all active-scale"
                            title="Delete Image"
                          >
                            <Trash2 className="h-3 w-3" />
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
      )}

      {activeTab === "orders" && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-border-gray bg-white p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Customer Placed Orders ({placedOrders.length})
              </h3>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear all system orders?")) {
                    localStorage.removeItem("nonzo_placed_orders");
                    setPlacedOrders([]);
                    triggerNotification("All orders cleared from system.");
                  }
                }}
                className="text-[10px] font-bold text-brand-red border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50"
              >
                Clear All Orders
              </button>
            </div>

            {placedOrders.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center font-medium">
                No orders have been placed on the system yet.
              </p>
            ) : (
              <div className="space-y-4">
                {placedOrders.map((ord: any) => {
                  const isCancelled = ord.status === "Cancelled" || ord.status === "CANCELLED";
                  return (
                    <div
                      key={ord.id}
                      className="border border-border-gray rounded-2xl p-4 space-y-3 bg-zinc-50/20"
                    >
                      <div className="flex flex-wrap justify-between items-start border-b border-border-gray pb-2 gap-2 text-xs">
                        <div>
                          <span className="font-extrabold text-foreground block">Order ID: {ord.id}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5 font-medium">{ord.date}</span>
                        </div>
                        <div className="text-right">
                          <span className={`rounded-full text-[9px] font-black px-2.5 py-0.5 uppercase block w-fit ml-auto border ${
                            isCancelled
                              ? "bg-red-50 border-red-100 text-brand-red font-bold"
                              : "bg-blue-50 border-blue-100 text-blue-800"
                          }`}>
                            {ord.status}
                          </span>
                          {ord.userName && (
                            <span className="text-[10px] text-zinc-500 font-bold block mt-1">
                              Customer: {ord.userName} ({ord.userMobile})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col text-xs bg-white border border-border-gray/40 rounded-xl p-2.5">
                            <div className="flex justify-between font-bold">
                              <span className="text-foreground">{item.name}</span>
                              <span className="text-foreground">₹{item.price * item.quantity}</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                              Portion: {item.weight} &bull; Cut: {item.cut} x {item.quantity}
                            </div>
                            {item.specialInstructions && item.cut === "Special Cut" && (
                              <div className="mt-1.5 text-[10px] text-zinc-600 bg-red-50/40 border border-red-100/50 rounded-lg p-2 font-medium italic">
                                <strong className="text-[8px] uppercase font-extrabold text-brand-red block tracking-wider not-italic mb-0.5">Cut Request Notes:</strong>
                                &quot;{item.specialInstructions}&quot;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Cancellation Details */}
                      {isCancelled && (
                        <div className="bg-red-50/55 border border-red-100 rounded-xl p-3 text-xs space-y-1.5 animate-fade-in">
                          <div>
                            <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-wide block">Cancellation Time</span>
                            <span className="font-bold text-red-800">
                              {ord.cancelledAt ? formatToIST(ord.cancelledAt) : "N/A"}
                            </span>
                          </div>
                          {ord.cancelReason && (
                            <div className="pt-1.5 border-t border-red-100/50">
                              <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-wide block">Reason Given</span>
                              <p className="font-medium italic text-brand-red">&quot;{ord.cancelReason}&quot;</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap justify-between items-center text-xs pt-2 border-t border-border-gray/30 gap-2">
                        <div>
                          <span className="text-zinc-400 font-semibold block text-[9px] uppercase">Destination</span>
                          <span className="font-bold text-zinc-600">{ord.deliveryAddress}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-400 font-semibold block text-[9px] uppercase">Charged Total</span>
                          <span className="font-black text-foreground">₹{ord.total}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
