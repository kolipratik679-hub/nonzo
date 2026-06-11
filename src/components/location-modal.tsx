"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLocation, SERVICE_AREAS } from "@/context/location-context";
import { MapPin, Phone, MessageSquare, AlertCircle, Search, X, CheckCircle2 } from "lucide-react";

export function LocationModal() {
  const {
    isLocationModalOpen,
    setLocation,
    skipLocation,
    outOfServiceLocation,
    setOutOfService,
  } = useLocation();

  const [sectorSearch, setSectorSearch] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [isNotified, setIsNotified] = useState<boolean>(false);

  if (!isLocationModalOpen) return null;

  // Filter SERVICE_AREAS by search
  const filteredAreas = SERVICE_AREAS.filter((area) =>
    area.toLowerCase().includes(sectorSearch.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedArea) {
      setLocation(selectedArea);
    }
  };

  const handleResetSearch = () => {
    setOutOfService(null);
    setSelectedArea("");
    setSectorSearch("");
    setIsNotified(false);
  };

  const handleOutOfServiceCheck = () => {
    if (sectorSearch.trim()) {
      setOutOfService(sectorSearch.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl">
        {/* Header — dark bg so logo's black bg blends perfectly */}
        <div className="relative shrink-0 bg-neutral-950 px-6 py-6 text-center">
          <button
            type="button"
            onClick={skipLocation}
            className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:bg-white/10 hover:text-white active-scale"
          >
            Skip
          </button>
          <div className="flex justify-center mb-2">
            <Image
              src="/NONZO-LOGO.png"
              alt="NONZO"
              width={140}
              height={140}
              className="h-12 w-auto object-contain"
              style={{ filter: "url(#remove-black-bg)" }}
              priority
            />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Eat Better. Live Better.
          </p>
        </div>

        {/* Body — scrollable on mobile */}
        <div className="flex-1 overflow-y-auto touch-scroll p-5">
          {!outOfServiceLocation ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-black text-foreground">
                  Select Delivery Area
                </h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
                  We deliver to select sectors in Ulwe, Navi Mumbai. Choose your sector to see delivery availability.
                </p>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search sector..."
                  value={sectorSearch}
                  onChange={(e) => setSectorSearch(e.target.value)}
                  className="w-full rounded-xl border border-border-gray bg-light-gray py-3 pl-9 pr-9 text-xs outline-none transition-all focus:border-brand-red focus:bg-white"
                />
                {sectorSearch && (
                  <button
                    type="button"
                    onClick={() => setSectorSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Area list */}
              <div className="max-h-48 space-y-2 overflow-y-auto touch-scroll no-scrollbar">
                {filteredAreas.length > 0 ? (
                  filteredAreas.map((area) => {
                    const isSelected = selectedArea === area;
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setSelectedArea(area)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-xs font-semibold transition-all active-scale ${
                          isSelected
                            ? "border-brand-red bg-brand-red/5 text-brand-red"
                            : "border-border-gray bg-white text-foreground hover:border-zinc-300"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isSelected ? "bg-brand-red" : "bg-light-gray"
                          }`}
                        >
                          <MapPin
                            className={`h-4 w-4 ${
                              isSelected ? "text-white" : "text-zinc-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block font-bold">{area}</span>
                          <span className="text-[10px] font-normal text-zinc-400">
                            Navi Mumbai · Delivering Now
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-red" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-border-gray/50 bg-light-gray/50 p-4 text-center">
                    <p className="text-xs font-semibold text-zinc-500">
                      No sectors match &quot;{sectorSearch}&quot;
                    </p>
                    <button
                      type="button"
                      onClick={handleOutOfServiceCheck}
                      className="mt-2 text-[10px] font-bold text-brand-red hover:underline active-scale"
                    >
                      Check if &quot;{sectorSearch}&quot; is serviceable
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons — minimum 44px tap target for mobile */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedArea}
                  className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white transition-all hover:bg-red-700 active-scale disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                  style={{ minHeight: "44px" }}
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={skipLocation}
                  className="w-full rounded-xl border border-border-gray py-3.5 text-xs font-bold text-zinc-500 transition-all hover:bg-light-gray active-scale"
                  style={{ minHeight: "44px" }}
                >
                  Skip For Now
                </button>
              </div>
            </div>
          ) : (
            /* Out-of-service state */
            <div className="space-y-4">
              <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                <div>
                  <h3 className="text-sm font-bold text-brand-red">
                    Currently Not Serviceable
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-red-700/80">
                    We only deliver to Sectors 5, 8, 17, and 24 in Ulwe. Expanding soon!
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border-gray/50 bg-light-gray p-4">
                <a
                  href="tel:7788996454"
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 font-medium text-zinc-500">
                    <Phone className="h-4 w-4 text-brand-red" />
                    Support Mobile
                  </span>
                  <span className="font-extrabold text-foreground">7788996454</span>
                </a>
                <div className="border-t border-border-gray/50" />
                <a
                  href="https://wa.me/917788996549"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 font-medium text-zinc-500">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    WhatsApp
                  </span>
                  <span className="font-extrabold text-foreground">7788996549</span>
                </a>
              </div>

              <div className="space-y-2.5 pt-1">
                {isNotified ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 py-3.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    We&apos;ll notify you when we expand here!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsNotified(true)}
                    className="w-full rounded-xl bg-brand-red py-3.5 text-xs font-bold text-white hover:bg-red-700 active-scale"
                    style={{ minHeight: "44px" }}
                  >
                    Notify Me When Available
                  </button>
                )}
                <a
                  href="tel:7788996454"
                  className="block w-full rounded-xl border border-border-gray bg-white py-3.5 text-center text-xs font-bold text-zinc-700 hover:bg-light-gray active-scale"
                  style={{ minHeight: "44px" }}
                >
                  Contact Support
                </a>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="w-full pt-1 text-center text-xs font-semibold text-zinc-400 hover:text-foreground active-scale"
                  style={{ minHeight: "44px" }}
                >
                  Change Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
