import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/context/location-context";
import { CartProvider } from "@/context/cart-context";
import { SplashScreen } from "@/components/splash-screen";
import { LocationModal } from "@/components/location-modal";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { StickyCartBar } from "@/components/sticky-cart-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NONZO | Eat Better. Live Better.",
  description:
    "Premium cold-chain seafood delivery straight from sustainable coastal waters. Preservative-free, fresh fish, prawns, crabs, and shellfish.",
  icons: {
    icon: "/NONZO-LOGO.png",
    shortcut: "/NONZO-LOGO.png",
    apple: "/NONZO-LOGO.png",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <LocationProvider>
          <CartProvider>
            {/* Netflix-style startup splash */}
            <SplashScreen />

            {/* Location gating modal */}
            <LocationModal />

            {/* Sticky top header */}
            <AppHeader />

            {/* Main page content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 pb-24 sm:px-4 md:pb-6">
              {children}
            </main>

            {/* Desktop Footer (Hidden on mobile) */}
            <DesktopFooter />

            {/* Floating cart summary bar (mobile + desktop) */}
            <StickyCartBar />

            {/* Mobile 4-tab bottom navigation */}
            <BottomNav />
          </CartProvider>
        </LocationProvider>
      </body>
    </html>
  );
}

// Placeholder import for DesktopFooter until it is created
import { DesktopFooter } from "@/components/desktop-footer";
