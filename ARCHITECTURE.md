# NONZO — ARCHITECTURE
> Complete system architecture documentation. All future development MUST follow this structure.
> Last updated: 2026-06-16

---

## 1. Technology Stack

### Frontend (Current — Phase 1 Complete)

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.9 | App Router framework, SSR/CSR, API routes |
| **React** | 19.2.4 | UI component library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | v4 | Utility-first styling |
| **@tailwindcss/postcss** | v4 | PostCSS integration for Tailwind |
| **Lucide React** | 1.17.0 | Icon library |
| **Geist Fonts** | (via next/font) | Primary typography |

### Backend (Planned — Phase 2+)

| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Backend API layer (already partially implemented for Razorpay) |
| **Prisma** | ORM for database access |
| **MySQL** | Relational database |

### Storage (Planned)

| Technology | Purpose |
|---|---|
| **Cloudflare R2** | Object storage for product images, banners, cut type images |

### Payments (Partially Implemented)

| Technology | Status | Details |
|---|---|---|
| **Razorpay** | Test mode | Key: `rzp_test_SwESWXTwV4F46I`, API routes exist |

### Authentication (Planned)

| Technology | Status |
|---|---|
| **OTP Login** | Currently simulated (accepts 123456/1234), needs real SMS gateway |

### Dev Dependencies

| Package | Purpose |
|---|---|
| **eslint** | Code linting |
| **eslint-config-next** | Next.js ESLint rules |
| **jimp** | Image processing (dev utility) |

---

## 2. Current Folder Structure

```
nonzo/
├── .env.local                      # Razorpay keys (test mode)
├── .gitignore
├── AGENTS.md                       # Next.js agent rules
├── CLAUDE.md                       # AI assistant notes
├── NONZO-LOGO.png                  # Root logo copy
├── package.json                    # name: "app-temp"
├── next.config.ts                  # Empty config (no custom settings)
├── tsconfig.json                   # TypeScript config
├── postcss.config.mjs              # PostCSS with Tailwind
├── eslint.config.mjs               # ESLint config
│
├── PROJECT_BLUEPRINT.md            # 🆕 Project memory
├── UI_UX_RULES.md                  # 🆕 Project memory
├── BUSINESS_RULES.md               # 🆕 Project memory
├── ARCHITECTURE.md                 # 🆕 Project memory (this file)
├── DEVELOPMENT_WORKFLOW.md         # 🆕 Project memory
├── CHANGELOG.md                    # 🆕 Project memory
│
├── FISH IMAGES/                    # Source reference photos (18 files)
│   └── *.jpg, *.jpeg, *.webp
│
├── public/
│   ├── NONZO-LOGO.png              # Public logo (376KB)
│   ├── manifest.json               # PWA manifest
│   ├── *.svg                       # Default Next.js SVGs
│   └── images/
│       ├── *.jpg, *.jpeg, *.webp, *.png   # Product images (24 files)
│       ├── categories/             # Category card images (6 PNG files)
│       │   ├── fish.png
│       │   ├── prawns.png
│       │   ├── crab.png
│       │   ├── shellfish.png
│       │   ├── seafoods.png
│       │   └── octopus.png
│       └── cuts/                   # Cut type images (11 PNG files)
│           ├── whole-cut-fish.png
│           ├── curry-cut-fish.png
│           ├── steak-cut-fish.png
│           ├── fillet-cut-fish.png
│           ├── cube-cut-prawns.png
│           ├── clean-blue-crab.png
│           ├── clean-cut-lobster.png
│           ├── completerly-peeled-prawns.png
│           ├── tail-on-round-prawns.png
│           ├── whole-lobster.png
│           └── whole-prawns.png
│
└── src/
    ├── app/
    │   ├── globals.css             # Root CSS: variables, animations, utilities
    │   ├── layout.tsx              # Root layout: providers, header, nav, footer
    │   ├── page.tsx                # Homepage: banners, categories, products
    │   │
    │   ├── admin/
    │   │   ├── page.tsx            # Admin dashboard (1569 lines, 71KB)
    │   │   └── images/             # Admin image asset catalog (planned)
    │   │
    │   ├── api/
    │   │   └── razorpay/
    │   │       ├── order/          # POST: Create Razorpay order
    │   │       └── verify/         # POST: Verify payment signature
    │   │
    │   ├── cart/
    │   │   └── page.tsx            # Cart page with auth gate (858 lines)
    │   │
    │   ├── category/
    │   │   └── [id]/               # Dynamic category pages
    │   │
    │   ├── checkout/
    │   │   └── page.tsx            # Checkout with addresses, slots, payment (1414 lines)
    │   │
    │   ├── collection/
    │   │   └── [id]/               # Dynamic collection pages
    │   │
    │   ├── orders/
    │   │   └── page.tsx            # Order history (185 lines)
    │   │
    │   ├── product/
    │   │   └── [id]/
    │   │       └── page.tsx        # Product detail page (16KB)
    │   │
    │   ├── profile/
    │   │   └── page.tsx            # Profile with OTP, addresses, support (1248 lines)
    │   │
    │   └── search/
    │       └── page.tsx            # Search with autocomplete, filters (296 lines)
    │
    ├── components/
    │   ├── app-header.tsx          # Fixed dark header (151 lines)
    │   ├── bottom-nav.tsx          # Mobile bottom navigation (86 lines)
    │   ├── desktop-footer.tsx      # Desktop-only footer (157 lines)
    │   ├── location-modal.tsx      # Location selection modal (265 lines)
    │   ├── product-card.tsx        # Reusable product card (207 lines)
    │   ├── splash-screen.tsx       # Netflix-style splash (67 lines)
    │   └── sticky-cart-bar.tsx     # Floating cart summary (79 lines)
    │
    ├── context/
    │   ├── auth-context.tsx        # Authentication provider (164 lines)
    │   ├── cart-context.tsx        # Cart + products + cuts + delivery (475 lines)
    │   └── location-context.tsx    # Location/service area provider (119 lines)
    │
    └── lib/
        └── mock-data.ts            # All product/category/cut type data (511 lines)
```

---

## 3. Module Architecture

### Context Providers (State Management)

All global state is managed through React Context, wrapping the entire app in `layout.tsx`:

```
AuthProvider (outermost)
  └── LocationProvider
       └── CartProvider (innermost)
            └── {children}
```

#### AuthProvider (`auth-context.tsx`)
- **State:** `user: UserProfile | null`
- **Methods:** `login()`, `logout()`, `updateUserAddress()`, `sendOtp()`, `verifyOtp()`
- **Storage:** `nonzo_user` (current user), `nonzo_users_db` (user registry)
- **Future:** Replace localStorage with database calls, integrate real SMS OTP provider

#### LocationProvider (`location-context.tsx`)
- **State:** `selectedLocation`, `skippedLocation`, `isLocationModalOpen`, `outOfServiceLocation`
- **Methods:** `setLocation()`, `skipLocation()`, `openLocationModal()`, `closeLocationModal()`
- **Storage:** `nonzo_location`, `nonzo_location_skipped`
- **Service Areas:** Hardcoded array `["Ulwe Sector 5", "Ulwe Sector 8", "Ulwe Sector 17", "Ulwe Sector 24"]`
- **Future:** Fetch service areas from database, GPS-based auto-detection

#### CartProvider (`cart-context.tsx`)
- **State:** `cart`, `products`, `cutTypes`, `promoCode`, `deliverySettings`
- **Methods:** `addToCart()`, `removeFromCart()`, `updateQuantity()`, `updateCartItemWeight()`, `updateCartItemCut()`, `updateCartItemSpecialInstructions()`, `clearCart()`, `applyPromoCode()`, `removePromoCode()`, `updateProducts()`, `updateCutTypes()`, `updateDeliverySettings()`
- **Computed:** `subtotal`, `cleaningFee` (always 0), `deliveryFee`, `promoDiscount`, `finalTotal`
- **Storage:** `nonzo_cart`, `nonzo_admin_products`, `nonzo_cut_types`, `nonzo_delivery_settings`
- **Future:** API-backed cart, server-side price validation

### Data Layer (`lib/mock-data.ts`)

All product, category, and cut type data is defined as TypeScript constants:

| Export | Type | Count | Purpose |
|---|---|---|---|
| `CATEGORIES` | Array | 5 | Category definitions with images |
| `CUT_TYPES` | Array | 6 | Cut type definitions with images and pricing |
| `PRODUCTS` | Array | 16 | Full product catalog |
| `MOCK_SAVED_ADDRESSES` | Array | 2 | Sample addresses for testing |
| `MOCK_ORDERS` | Array | 2 | Sample orders for testing |
| `WHY_NONZO` | Array | 3 | Trust/value proposition cards |

**Future:** Replace with Prisma queries to MySQL database.

### Component Architecture

| Component | File | Scope | Rendered In |
|---|---|---|---|
| `SplashScreen` | `splash-screen.tsx` | Global | `layout.tsx` |
| `LocationModal` | `location-modal.tsx` | Global | `layout.tsx` |
| `AppHeader` | `app-header.tsx` | Global | `layout.tsx` |
| `BottomNav` | `bottom-nav.tsx` | Global (mobile) | `layout.tsx` |
| `DesktopFooter` | `desktop-footer.tsx` | Global (desktop) | `layout.tsx` |
| `StickyCartBar` | `sticky-cart-bar.tsx` | Conditional | `layout.tsx` |
| `ProductCard` | `product-card.tsx` | Reusable | Homepage, Search, Category |

---

## 4. localStorage Key Registry

> **CRITICAL:** All future development must use these exact keys for backward compatibility.

| Key | Type | Owner | Purpose |
|---|---|---|---|
| `nonzo_cart` | `CartItem[]` | CartProvider | Persistent shopping cart |
| `nonzo_admin_products` | `Product[]` | CartProvider | Admin-editable product catalog |
| `nonzo_cut_types` | `CutType[]` | CartProvider | Admin-editable cut types |
| `nonzo_delivery_settings` | Object | CartProvider | Delivery slots, thresholds, charges |
| `nonzo_admin_banners` | `Banner[]` | Homepage/Admin | Hero carousel banners |
| `nonzo_location` | `string` | LocationProvider | Selected delivery sector |
| `nonzo_location_skipped` | `"true"` | LocationProvider | Location skip flag |
| `nonzo_user` | `UserProfile` | AuthProvider | Current logged-in user |
| `nonzo_users_db` | `Record<mobile, UserProfile>` | AuthProvider | Simulated user database |
| `nonzo_addresses_{mobile}` | `Address[]` | Checkout/Profile | Per-user saved addresses |
| `nonzo_orders_{mobile}` | `Order[]` | Checkout/Orders | Per-user order history |
| `nonzo_placed_orders` | `Order[]` | Checkout/Admin | Global order list (all users) |
| `nonzo_recently_viewed` | `string[]` | Homepage | Recently viewed product IDs |
| `nonzo_splash_seen` | `"true"` | SplashScreen | Session-only splash flag (sessionStorage) |

---

## 5. API Routes (Current)

### `/api/razorpay/order` (POST)
- **Input:** `{ amount: number }`
- **Action:** Creates a Razorpay order
- **Output:** Razorpay order object (`{ id, amount, currency }`)

### `/api/razorpay/verify` (POST)
- **Input:** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- **Action:** Verifies payment signature using HMAC-SHA256
- **Output:** `{ verified: true }` or error

---

## 6. Future API Structure (Planned)

```
/api/
├── auth/
│   ├── send-otp/          POST    Send OTP to mobile
│   ├── verify-otp/        POST    Verify OTP and return session
│   └── me/                GET     Get current user profile
│
├── products/
│   ├── /                  GET     List all products
│   ├── [id]/              GET     Get single product
│   ├── /                  POST    Create product (admin)
│   ├── [id]/              PUT     Update product (admin)
│   └── [id]/              DELETE  Delete product (admin)
│
├── categories/
│   └── /                  GET     List categories
│
├── cuts/
│   ├── /                  GET     List cut types
│   ├── /                  POST    Create cut type (admin)
│   ├── [id]/              PUT     Update cut type (admin)
│   └── [id]/              DELETE  Delete cut type (admin)
│
├── cart/
│   ├── /                  GET     Get user cart
│   ├── add/               POST    Add item to cart
│   ├── update/            PUT     Update item quantity/weight/cut
│   └── clear/             DELETE  Clear cart
│
├── orders/
│   ├── /                  GET     List user orders
│   ├── /                  POST    Place new order
│   ├── [id]/              GET     Get order details
│   └── [id]/status/       PUT     Update order status (admin/delivery)
│
├── addresses/
│   ├── /                  GET     List user addresses
│   ├── /                  POST    Add address
│   ├── [id]/              PUT     Update address
│   └── [id]/              DELETE  Delete address
│
├── banners/
│   ├── /                  GET     List active banners
│   ├── /                  POST    Create banner (admin)
│   ├── [id]/              PUT     Update banner (admin)
│   └── [id]/              DELETE  Delete banner (admin)
│
├── delivery/
│   ├── settings/          GET     Get delivery settings
│   ├── settings/          PUT     Update delivery settings (admin)
│   └── slots/             GET     Get available slots for date
│
├── payments/
│   ├── razorpay/order/    POST    Create Razorpay order
│   └── razorpay/verify/   POST    Verify Razorpay payment
│
└── upload/
    └── image/             POST    Upload image to Cloudflare R2
```

---

## 7. Future Admin Structure (Planned)

```
/admin/
├── /                      Dashboard overview (orders today, revenue, etc.)
├── orders/                Order management (status updates, assignment)
├── products/              Product CRUD with image upload
├── categories/            Category management
├── cuts/                  Cut type management
├── banners/               Banner carousel management
├── delivery/              Slot and logistics settings
├── customers/             Customer list and details
├── analytics/             Sales analytics and reports
└── settings/              Admin settings and access control
```

### Admin Authentication (Planned)
- Separate admin login (not customer OTP)
- Role-based access: Super Admin, Manager, Viewer
- Admin routes protected with middleware

---

## 8. Future Delivery Boy Structure (Planned)

```
/delivery/
├── login/                 Delivery boy OTP login
├── dashboard/             Active delivery assignments
├── orders/
│   └── [id]/              Order details + navigation
├── history/               Completed deliveries
└── profile/               Personal info and stats
```

### Delivery Boy Features (Planned)
- Assignment of orders by admin
- One-tap navigation to delivery address
- Photo proof of delivery
- Real-time location sharing for customer tracking
- Daily earnings summary

---

## 9. Database Schema (Planned — Prisma)

```prisma
model User {
  id        String    @id @default(cuid())
  mobile    String    @unique
  name      String
  email     String?
  createdAt DateTime  @default(now())
  addresses Address[]
  orders    Order[]
}

model Address {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  tag       String  @default("Home")
  fullName  String
  flat      String
  area      String
  city      String  @default("Navi Mumbai")
  pincode   String  @default("410206")
  phone     String
  landmark  String?
  latitude  Float?
  longitude Float?
  isDefault Boolean @default(false)
}

model Category {
  id       String    @id
  name     String
  iconName String
  image    String
  products Product[]
}

model Product {
  id           String          @id
  name         String
  tagline      String
  categoryId   String
  category     Category        @relation(fields: [categoryId], references: [id])
  mainImage    String
  description  String          @db.Text
  freshnessInfo String         @db.Text
  stockStatus  String          @default("In Stock")
  weightOptions Json           // WeightOption[]
  allowedCuts  Json            // string[]
  galleryImages Json           // string[]
  createdAt    DateTime        @default(now())
}

model CutType {
  id          String @id
  name        String
  description String
  extraCharge Int    @default(0)
  image       String
  status      String @default("active")
}

model Order {
  id              String   @id
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  items           Json     // OrderItem[]
  total           Int
  paymentMethod   String
  paymentStatus   String   @default("Pending")
  paymentId       String?
  razorpayOrderId String?
  deliveryAddress String
  deliveryDate    String
  deliverySlot    String
  status          String   @default("Confirmed & Preparing")
  createdAt       DateTime @default(now())
}

model Banner {
  id               String  @id @default(cuid())
  title            String
  subtitle         String?
  imageUrl         String
  destinationType  String
  destinationValue String
  isActive         Boolean @default(true)
  order            Int
  offerBadge       String?
  offerPrice       Int?
  originalPrice    Int?
  ctaText          String  @default("Shop Now")
  startDate        DateTime?
  endDate          DateTime?
}

model DeliverySettings {
  id                    String @id @default("default")
  sameDayDelivery       Boolean @default(false)
  freeDeliveryThreshold Int     @default(699)
  deliveryCharge        Int     @default(39)
  slots                 Json    // SlotSetting[]
}
```

---

## 10. Environment Variables

### Current (`.env.local`)
```
RAZORPAY_KEY_ID=rzp_test_SwESWXTwV4F46I
RAZORPAY_KEY_SECRET=LvT46te4fRgELq7MvjDX53s3
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SwESWXTwV4F46I
```

### Future (to be added)
```
# Database
DATABASE_URL=mysql://user:password@host:3306/nonzo

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=nonzo-assets
R2_PUBLIC_URL=

# SMS OTP Provider
OTP_API_KEY=
OTP_API_SECRET=
OTP_SENDER_ID=NONZO

# Razorpay (Production)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...

# Admin
ADMIN_SECRET=
```
