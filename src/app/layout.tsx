import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/context/location-context";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
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
    "Premium Fresh Fish & Seafood Delivery in Ulwe, Navi Mumbai. 100% preservative-free, cold-chain maintained fish, prawns, crabs & shellfish.",
  keywords: ["fresh fish delivery", "seafood delivery", "Ulwe", "Navi Mumbai", "NONZO", "fish online", "prawns delivery"],
  authors: [{ name: "NONZO Seafoods" }],
  icons: {
    icon: [
      { url: "/NONZO-LOGO.png", type: "image/png" },
    ],
    shortcut: "/NONZO-LOGO.png",
    apple: "/NONZO-LOGO.png",
    other: [
      { rel: "apple-touch-icon", url: "/NONZO-LOGO.png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "NONZO | Eat Better. Live Better.",
    description: "Premium Fresh Fish & Seafood Delivery in Ulwe, Navi Mumbai.",
    siteName: "NONZO",
    images: [{ url: "/NONZO-LOGO.png", width: 800, height: 600, alt: "NONZO Logo" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NONZO | Eat Better. Live Better.",
    description: "Premium Fresh Fish & Seafood Delivery in Ulwe, Navi Mumbai.",
    images: ["/NONZO-LOGO.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#111111",
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
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              {/* Netflix-style startup splash */}
              <SplashScreen />

              {/* Location gating modal */}
              <LocationModal />

              {/* Sticky top header */}
              <AppHeader />

              {/* Main page content */}
              <main className="flex-1 w-full max-w-7xl mx-auto px-3 pb-24 sm:px-4 md:pb-6 pt-[72px] md:pt-[80px]">
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
        </AuthProvider>
      </body>
    </html>
  );
}

// Placeholder import for DesktopFooter until it is created
import { DesktopFooter } from "@/components/desktop-footer";
