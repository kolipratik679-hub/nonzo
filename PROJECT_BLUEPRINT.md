# NONZO — PROJECT BLUEPRINT
> Single source of truth for all future development phases.
> Last updated: 2026-06-16

---

## 1. Brand Information

| Field | Value |
|---|---|
| **Brand Name** | NONZO |
| **Legal Entity** | NONZO Seafoods Private Limited |
| **Tagline** | Eat Better. Live Better. |
| **Logo** | `/public/NONZO-LOGO.png` (also at root `/NONZO-LOGO.png`) |
| **Brand Color** | `#C8102E` (Brand Red) |
| **Theme Color** | `#111111` (Near Black) |
| **Background Color** | `#FFFFFF` (White content area) |
| **Support Phone** | 7788996454 |
| **Business Phone** | 7788996549 |
| **WhatsApp** | +91 7788996549 |
| **PWA Name** | NONZO - Fresh Seafood Delivery |
| **PWA Short Name** | NONZO |
| **App Categories** | Food, Shopping |
| **Locale** | en-IN (India) |

---

## 2. NONZO Vision

NONZO is a premium fresh fish and seafood delivery platform operating in Ulwe, Navi Mumbai. The core promise is:

- **100% Fresh Catch** — Daily catch from local artisanal fishermen, zero chemical preservatives.
- **Cold Chain Maintained (0°C – 4°C)** — Strict temperature control at all stages of transport.
- **Professional Cleaning Included** — Gutted, scaled, and custom-cut by in-house experts in a high-hygiene facility. Delivered recipe-ready.

NONZO positions itself as the **premium**, **trust-first** seafood brand — not a commodity marketplace. Every design and business decision reflects quality over volume.

---

## 3. Business Model

| Aspect | Detail |
|---|---|
| **Type** | D2C (Direct to Consumer) fresh seafood delivery |
| **Revenue** | Product sales + cut type charges + delivery fees |
| **Delivery Model** | Own fleet, slot-based scheduled delivery |
| **Service Area** | Ulwe Sectors 5, 8, 17, 24 — Navi Mumbai, Maharashtra |
| **Pincode** | 410206 |
| **Operating Hours** | 8 AM – 9 PM, Daily |
| **Physical Address** | Sai Sagar Apartment, Plot No 349, Shop No 1 & 2, Sector 24, Ulwe, Navi Mumbai, Maharashtra – 410206 |

---

## 4. Launch Strategy

- **Phase 1 (Current):** Ulwe only — Sectors 5, 8, 17, 24
- **Future Expansion:** More Ulwe sectors → Panvel → Greater Navi Mumbai
- Out-of-service areas show "Notify Me When Available" + contact support
- Service area expansion is managed through `SERVICE_AREAS` array in `location-context.tsx`

---

## 5. Product Categories

| Category ID | Name | Icon (Lucide) | Image |
|---|---|---|---|
| `fish` | Fish | Fish | `/images/categories/fish.png` |
| `prawns` | Prawns | Waves | `/images/categories/prawns.png` |
| `crabs` | Crabs | Shell | `/images/categories/crab.png` |
| `shellfish` | Shellfish | Anchor | `/images/categories/shellfish.png` |
| `seafood` | Seafood | Compass | `/images/categories/seafoods.png` |

### Current Product Catalog (16 products)

| ID | Name | Category | Weight Options | Stock Status |
|---|---|---|---|---|
| `tiger-prawns` | Tiger Prawns | Prawns | 250g/500g/1kg | In Stock |
| `black-pomfret` | Black Pomfret | Fish | 250g/500g/1kg | In Stock |
| `silver-pomfret` | Silver Pomfret | Fish | 250g/500g/1kg | Low Stock |
| `bombil` | Bombil (Bombay Duck) | Fish | 250g/500g/1kg | In Stock |
| `rawas` | Rawas (Indian Salmon) | Fish | 250g/500g/1kg | In Stock |
| `lobster` | Rock Lobster | Seafood | 500g/1kg | Low Stock |
| `mud-crab` | Premium Mud Crab | Crabs | 500g/1kg | In Stock |
| `sea-crab` | Blue Sea Crab | Crabs | 500g/1kg | In Stock |
| `barramundi` | Barramundi (Asian Seabass) | Fish | 250g/500g/1kg | In Stock |
| `bangda` | Bangda (Mackerel) | Fish | 500g/1kg | In Stock |
| `tuna` | Yellowfin Tuna | Fish | 250g/500g/1kg | Low Stock |
| `oysters` | Coastal Rock Oysters | Shellfish | 250g/500g | Out Of Stock |
| `hilsa` | Hilsa (Ilish) | Fish | 500g/1kg | Low Stock |
| `sole-fish` | Sole Fish (Lepa) | Fish | 250g/500g | In Stock |
| `mandeli` | Mandeli (Anchovies) | Fish | 250g/500g | In Stock |
| `octopus` | Fresh Octopus | Seafood | 500g/1kg | Low Stock |

---

## 6. Cut Types System

| Cut ID | Name | Extra Charge | Status |
|---|---|---|---|
| `whole` | Whole Fish | ₹0 (Free) | Active |
| `curry-cut` | Curry Cut | ₹15 | Active |
| `steak-cut` | Steak Cut | ₹20 | Active |
| `fillet` | Fillet | ₹40 | Active |
| `boneless` | Boneless Cubes | ₹50 | Active |
| `special-cut` | Special Cut | ₹30 | Active |

- Each product has an `allowedCuts` array defining which cuts apply to it.
- "Special Cut" allows free-text customer instructions (max 200 characters).
- Cut types are admin-manageable (add, edit, delete, toggle status, change image/charge).
- Cut type images are stored in `/public/images/cuts/`.

---

## 7. Customer Flow

```
1. App Launch → Splash Screen (2.5s Netflix-style animation)
2. Location Modal → Select delivery sector (Ulwe Sectors 5/8/17/24) or Skip
3. Homepage → Browse by category, view banners, fresh today, best sellers
4. Search → Full-text search with autocomplete, category filters, popular searches
5. Product Detail → Gallery, weight selection, cut selection, special instructions, add to cart
6. Cart → Review items, change weight/cut, promo code, order summary
7. Authentication → OTP login required before checkout (no guest checkout)
8. Checkout → Address selection/creation, delivery date/slot, payment method
9. Payment → Razorpay (online) or Cash on Delivery
10. Order Confirmation → Order ID, delivery details, tracking
11. Orders Page → Full order history with status tracking
12. Profile → Personal info, addresses, support tickets, admin access
```

---

## 8. Checkout Flow

1. **Cart Review** → Adjust quantities, weights, cuts, add promo code
2. **Auth Gate** → If not logged in, OTP flow: Mobile → OTP → Profile → Address
3. **Address Selection** → Choose from saved addresses or add new
4. **Delivery Scheduling** → Select date (Tomorrow default, same-day if admin-enabled) + time slot
5. **Payment Method** → Online (Razorpay) or Cash on Delivery
6. **Order Placement** → Order saved to user-specific + global localStorage
7. **Confirmation** → Success screen with order ID and delivery details

---

## 9. Delivery Flow

| Rule | Value |
|---|---|
| **Default Delivery Date** | Tomorrow |
| **Same-Day Delivery** | Disabled by default (admin toggle) |
| **Delivery Slots** | 8 AM – 10 AM, 10 AM – 12 PM, 5 PM – 9 PM |
| **Slot Capacity** | 15 orders per slot (admin configurable) |
| **Free Delivery Threshold** | ₹699 |
| **Standard Delivery Charge** | ₹39 |
| **Date Options** | Today (if enabled), Tomorrow, Day+2, Day+3 |

---

## 10. Admin Flow

Admin panel accessible from: Profile → Account & Security → System Control Panel (`/admin`)

### Admin Tabs:
1. **Slots & Delivery** — Same-day toggle, slot timings, slot limits, free delivery threshold, delivery charge
2. **Homepage Banners** — Add/delete/reorder/toggle hero carousel banners with drag-drop image upload
3. **Manage Cut Types** — Add/edit/delete/toggle cut types with images and pricing
4. **Product Gallery Admin** — Change main image, manage gallery images, reorder gallery
5. **Customer Orders** — View all placed orders across all users

---

## 11. Future Expansion Plans

- More Ulwe sectors and beyond
- Database-backed persistence (replacing localStorage)
- Real OTP service (replacing simulated 123456)
- Delivery boy assignment system
- Live order tracking
- Push notifications
- WhatsApp order updates
- Cloudflare R2 image storage
- Full admin authentication

---

## 12. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.9 (App Router) |
| **Language** | TypeScript 5.x |
| **React** | React 19.2.4 |
| **Styling** | Tailwind CSS v4 (with `@tailwindcss/postcss`) |
| **Icons** | Lucide React |
| **Fonts** | Geist Sans + Geist Mono (via `next/font/google`) |
| **Payments** | Razorpay (test mode, key: `rzp_test_SwESWXTwV4F46I`) |
| **State Management** | React Context (AuthProvider, LocationProvider, CartProvider) |
| **Storage (Current)** | localStorage (simulation for all data) |
| **Storage (Planned)** | MySQL + Prisma ORM + Cloudflare R2 |
| **Auth (Current)** | Simulated OTP (accepts 123456 or 1234) |
| **Auth (Planned)** | Real OTP via SMS gateway |

---

## 13. Final Business Decisions

- ✅ No guest checkout — OTP required
- ✅ No cleaning fee — removed entirely (`cleaningFee = 0`)
- ✅ Free delivery above ₹699
- ✅ ₹39 flat delivery charge below threshold
- ✅ Tomorrow as default delivery day
- ✅ Same-day delivery off by default (admin toggle)
- ✅ Special cut instructions allowed (max 200 chars)
- ✅ Cash on Delivery available alongside Razorpay
- ✅ Promo codes: NONZO10 (10%), NONZO50 (₹50 flat), FREESHIP, EATBETTER (15%)
- ✅ Dynamic pricing for non-standard weights (8% bulk discount, 5% small portion markup)
- ✅ Cart persisted in localStorage
- ✅ Orders saved per-user (keyed by mobile number)

---

## 14. Brand Assets

| Asset | Path |
|---|---|
| Logo (Public) | `/public/NONZO-LOGO.png` |
| Logo (Root) | `/NONZO-LOGO.png` |
| Category Images | `/public/images/categories/` (6 PNG files) |
| Cut Type Images | `/public/images/cuts/` (11 PNG files) |
| Product Images | `/public/images/` (24 product images) |
| Reference Photos | `/FISH IMAGES/` (18 source photos) |
| PWA Manifest | `/public/manifest.json` |

---

## 15. Design Philosophy

- **Mobile-first, app-like experience** — PWA with standalone display, portrait lock
- **Dark header + dark bottom nav, white content area** — High contrast, premium feel
- **Netflix-style splash screen** — 2.5s animated logo reveal with tagline
- **Compact, information-dense cards** — Small text sizes (9px–12px), heavy font weights
- **Brand Red (#C8102E) as primary action color** — CTAs, badges, active states
- **Touch-optimized** — 44px minimum tap targets, safe-area insets, no-scrollbar utility
- **Micro-animations** — hover-scale, active-scale, splash sequences, fade transitions
- **Professional photography** — Real fish/seafood product images, category artwork
