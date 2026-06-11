"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, MapPin, Clock, ShieldCheck } from "lucide-react";

export function DesktopFooter() {
  return (
    <footer className="hidden w-full border-t border-zinc-800 bg-[#111111] py-12 text-zinc-400 md:block">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-4 gap-8 pb-8 border-b border-zinc-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block active-scale">
              <Image
                src="/NONZO-LOGO.png"
                alt="NONZO Logo"
                width={120}
                height={80}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500">
              Premium cold-chain seafood delivery straight from coastal waters. 100% preservative-free, fresh fish, prawns, crabs, and shellfish.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-brand-red" />
              <span>Freshness Guaranteed</span>
            </div>
          </div>

          {/* About & Support Links */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Delivery & Hours */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Delivery Info
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2 text-zinc-500">
                <MapPin className="h-4 w-4 shrink-0 text-brand-red mt-0.5" />
                <div>
                  <span className="text-zinc-300 font-semibold block">Delivery Areas</span>
                  <span>Ulwe Sectors 5, 8, 17, 24 &amp; Navi Mumbai</span>
                </div>
              </li>
              <li className="flex items-start gap-2 text-zinc-500">
                <Clock className="h-4 w-4 shrink-0 text-brand-red mt-0.5" />
                <div>
                  <span className="text-zinc-300 font-semibold block">Business Hours</span>
                  <span>Daily: 7:00 AM – 9:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <div className="space-y-2.5">
              <a
                href="tel:7788996454"
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 active-scale"
              >
                <Phone className="h-4 w-4 text-brand-red" />
                <span>Call Us: 7788996454</span>
              </a>
              <a
                href="https://wa.me/917788996549"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 active-scale"
              >
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <span>WhatsApp: 7788996549</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 text-[11px] text-zinc-600">
          <p>© {new Date().getFullYear()} NONZO Seafoods Private Limited. All Rights Reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span>Eat Better. Live Better.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
