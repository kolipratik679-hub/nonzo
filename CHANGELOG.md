# NONZO — CHANGELOG
> All changes tracked here in reverse chronological order.
> Last updated: 2026-06-16

---

## [Phase 1] — Frontend Complete ✅
**Date:** 2026-06-16
**Status:** Complete — All customer-facing UI functional with simulated data layer.

---

### 1.0.0 — Initial Frontend Release

#### 🏗️ Project Setup
- Initialized Next.js 16.2.9 project with App Router, TypeScript, Tailwind CSS v4
- Configured PWA manifest (`manifest.json`) with NONZO branding
- Set up Geist Sans + Geist Mono fonts via `next/font/google`
- Configured PostCSS with `@tailwindcss/postcss`
- Created `.env.local` with Razorpay test keys

#### 🎨 Design System
- Defined CSS custom properties in `globals.css`: `--brand-red`, `--light-gray`, `--border-gray`, etc.
- Created utility classes: `.hover-scale`, `.active-scale`, `.no-scrollbar`, `.safe-bottom`, `.touch-scroll`
- Implemented splash screen keyframe animations: `nonzoLogoFadeIn`, `nonzoLogoZoom`, `nonzoFadeOut`, `nonzoTaglineFade`
- Established compact typography scale (9px–14px) with heavy font weights

#### 🧩 Components Created
| Component | File | Lines | Purpose |
|---|---|---|---|
| `SplashScreen` | `splash-screen.tsx` | 67 | Netflix-style animated brand reveal |
| `LocationModal` | `location-modal.tsx` | 265 | Service area selection with out-of-service handling |
| `AppHeader` | `app-header.tsx` | 151 | Dark fixed header with logo, location, search, nav |
| `BottomNav` | `bottom-nav.tsx` | 86 | Mobile 4-tab navigation bar |
| `DesktopFooter` | `desktop-footer.tsx` | 157 | Desktop-only footer with brand info |
| `ProductCard` | `product-card.tsx` | 207 | Reusable card with gallery hover, badges, add-to-cart |
| `StickyCartBar` | `sticky-cart-bar.tsx` | 79 | Floating cart summary bar |

#### 📄 Pages Created
| Page | Route | File | Lines | Key Features |
|---|---|---|---|---|
| Homepage | `/` | `app/page.tsx` | ~800+ | Hero banners, categories, product sections, why NONZO |
| Search | `/search` | `app/search/page.tsx` | 296 | Autocomplete, category filters, popular searches |
| Product Detail | `/product/[id]` | `app/product/[id]/page.tsx` | ~500+ | Gallery, weight/cut selection, add-to-cart |
| Cart | `/cart` | `app/cart/page.tsx` | 858 | Item management, promo codes, auth gate, order summary |
| Checkout | `/checkout` | `app/checkout/page.tsx` | 1414 | Addresses, delivery scheduling, Razorpay/COD payment |
| Orders | `/orders` | `app/orders/page.tsx` | 185 | Order history with status tracking |
| Profile | `/profile` | `app/profile/page.tsx` | 1248 | Personal info, addresses, support, OTP login |
| Admin | `/admin` | `app/admin/page.tsx` | 1569 | Delivery slots, banners, cut types, product gallery, orders |
| Category | `/category/[id]` | `app/category/[id]/page.tsx` | — | Filtered product listing by category |
| Collection | `/collection/[id]` | `app/collection/[id]/page.tsx` | — | Curated product collections |

#### 🔧 Context Providers
| Provider | File | Lines | Scope |
|---|---|---|---|
| `AuthProvider` | `auth-context.tsx` | 164 | User auth, OTP simulation, user registry |
| `LocationProvider` | `location-context.tsx` | 119 | Service area selection, modal control |
| `CartProvider` | `cart-context.tsx` | 475 | Cart, products, cuts, pricing, delivery settings |

#### 📦 Data Layer
| Export | File | Items | Purpose |
|---|---|---|---|
| `CATEGORIES` | `mock-data.ts` | 5 | Fish, Prawns, Crabs, Shellfish, Seafood |
| `CUT_TYPES` | `mock-data.ts` | 6 | Whole, Curry Cut, Steak Cut, Fillet, Boneless, Special Cut |
| `PRODUCTS` | `mock-data.ts` | 16 | Full product catalog with pricing, images, descriptions |
| `WHY_NONZO` | `mock-data.ts` | 3 | Trust badges content |

#### 💳 Payment Integration
- Razorpay test mode integration
- API route: `POST /api/razorpay/order` — Create order
- API route: `POST /api/razorpay/verify` — Verify signature
- COD (Cash on Delivery) option alongside online payment

#### 🖼️ Asset Library
- 24 product images in `/public/images/`
- 6 category images in `/public/images/categories/`
- 11 cut type images in `/public/images/cuts/`
- 18 source reference photos in `/FISH IMAGES/`
- Brand logo: `NONZO-LOGO.png`

#### 💼 Business Logic Implemented
- Dynamic pricing engine (bulk discount 8%, small portion markup 5%)
- Free delivery threshold system (₹699)
- Promo code system (4 codes: NONZO10, NONZO50, FREESHIP, EATBETTER)
- Cleaning fee removed entirely (set to 0)
- No guest checkout — OTP required
- Tomorrow as default delivery date
- Same-day delivery disabled by default (admin toggle)
- Special cut instructions (max 200 characters)
- Per-user order history keyed by mobile number
- Admin-editable: products, cuts, banners, delivery settings

#### 📝 Project Memory System
- Created `PROJECT_BLUEPRINT.md` — Brand, business model, product catalog, flows
- Created `UI_UX_RULES.md` — Colors, typography, layout, component rules, responsive rules
- Created `BUSINESS_RULES.md` — Pricing, delivery, payment, customer, order rules
- Created `ARCHITECTURE.md` — Tech stack, folder structure, localStorage keys, future schema
- Created `DEVELOPMENT_WORKFLOW.md` — 8-phase plan with dependencies
- Created `CHANGELOG.md` — This file

---

## [Phase 3B] — OTP Authentication Backend Implementation Complete ✅
**Date:** 2026-06-16
**Status:** Complete — OTP authentication backend, JWT session management, user logging, and frontend provider integration are fully functional.

### Changes
- Implemented `PrismaClient` singleton with dynamically configured MariaDB database connection adapter parsing `DATABASE_URL`.
- Created JWT helper module using `jose` library to handle HS256 Access and Refresh token generation and verification.
- Developed backend API routes:
  - `POST /api/auth/send-otp`: Generates random 6-digit OTP, validates number, enforces 60s cooldown, hourly limit (max 5), 15m lockouts on too many failed attempts, and returns mock OTP in dev payload.
  - `POST /api/auth/verify-otp`: Validates OTP code, marks as verified, logs user activity, maps/creates user record with database-linked skeleton cart/wishlist, creates session record, and sets HTTP-Only cookies.
  - `POST /api/auth/register`: Performs registration update for Name and Email details upon new user profile completion.
  - `POST /api/auth/logout`: Invalidates the session in the DB, clears browser cookies, and creates logout activity logs.
  - `GET /api/auth/me`: Decodes JWT cookie, validates DB session validity, implements access token auto-rotation, and evaluates user block status and profile completeness.
- Integrated the frontend React context (`auth-context.tsx`) with the new API endpoints while keeping the existing UX layouts intact.
- Verified all flows (signup, registration, login, logout, and session check) using automated browser interaction tests.

---

## Version History

| Version | Phase | Date | Summary |
|---|---|---|---|
| 1.0.0 | Phase 1 | 2026-06-16 | Complete frontend with simulated data |
| 2.0.0 | Phase 2 | 2026-06-16 | MySQL database via Prisma & Seed catalog |
| 3.0.0 | Phase 3 | 2026-06-16 | Backend OTP authentication & JWT Session |
| 4.0.0 | Phase 4 | TBD | Customer-facing APIs |
| 5.0.0 | Phase 5 | TBD | Production Razorpay |
| 6.0.0 | Phase 6 | TBD | Full admin dashboard |
| 7.0.0 | Phase 7 | TBD | Delivery boy system |
| 8.0.0 | Phase 8 | TBD | Live tracking + notifications |
