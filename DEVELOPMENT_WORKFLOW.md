# NONZO — DEVELOPMENT WORKFLOW
> Phased development plan with dependency rules. Follow this order strictly.
> Last updated: 2026-06-16

---

## Development Phases Overview

```
Phase 1: Frontend           ✅ COMPLETE
Phase 2: Database            ⬜ NEXT
Phase 3: Authentication      ⬜ BLOCKED BY Phase 2
Phase 4: Customer APIs       ⬜ BLOCKED BY Phase 2 + 3
Phase 5: Payments            ⬜ BLOCKED BY Phase 4
Phase 6: Admin Dashboard     ⬜ BLOCKED BY Phase 4
Phase 7: Delivery Boy System ⬜ BLOCKED BY Phase 6
Phase 8: Live Tracking       ⬜ BLOCKED BY Phase 7
```

---

## Phase 1: Frontend ✅ COMPLETE

### Scope
Complete customer-facing UI with simulated data layer.

### Completed Deliverables
- [x] Project setup: Next.js 16 + TypeScript + Tailwind v4
- [x] PWA manifest and meta tags
- [x] Splash screen with Netflix-style animation
- [x] Location selection modal with service area gating
- [x] Dark sticky header with logo, location, search, nav
- [x] Mobile bottom navigation (4 tabs)
- [x] Desktop footer with brand info, links, contact
- [x] Homepage: Hero banner carousel, categories, product sections
- [x] Product card component with gallery hover, badges, add-to-cart
- [x] Search page with autocomplete, category filters, popular searches
- [x] Product detail page with gallery, weight/cut selection, add-to-cart
- [x] Cart page with quantity stepper, weight/cut editing, promo codes
- [x] OTP authentication flow (simulated)
- [x] Checkout page with address management, slot selection, payment
- [x] Razorpay payment integration (test mode)
- [x] Order confirmation screen
- [x] Order history page
- [x] Profile page with personal info, addresses, support, logout
- [x] Admin panel: Delivery slots, banners, cut types, product gallery, orders
- [x] Sticky cart bar (mobile + desktop variants)
- [x] Responsive design (mobile-first, 320px–desktop)
- [x] Context providers: Auth, Location, Cart
- [x] Mock data: 16 products, 5 categories, 6 cut types

### Verification
- All pages render correctly at `localhost:3000`
- Cart flow works end-to-end with localStorage persistence
- Admin panel updates reflect on customer-facing pages
- Razorpay test checkout completes successfully

---

## Phase 2: Database ⬜ NEXT

### Prerequisites
- Phase 1 complete ✅
- MySQL server available (local or remote)
- Prisma installed

### Scope
Replace all localStorage-based data with MySQL database via Prisma ORM.

### Tasks
1. **Install Prisma**
   - `npm install prisma @prisma/client`
   - `npx prisma init` (generates `prisma/schema.prisma`)

2. **Define Schema**
   - Use the schema defined in `ARCHITECTURE.md` Section 9
   - Models: User, Address, Category, Product, CutType, Order, Banner, DeliverySettings

3. **Seed Database**
   - Create `prisma/seed.ts`
   - Import all data from `lib/mock-data.ts` into seed script
   - Seed categories, products, cut types, default delivery settings, default banners

4. **Create Prisma Client Singleton**
   - Create `src/lib/prisma.ts` with global PrismaClient instance
   - Follow Next.js best practices (avoid multiple instances in dev)

5. **Migration**
   - `npx prisma migrate dev --name init`
   - `npx prisma db seed`

### Dependency Rules
- Do NOT delete `lib/mock-data.ts` yet — keep as reference until all API routes are verified
- Do NOT modify any frontend components in this phase
- Do NOT change any context providers yet
- Only create database schema, seed script, and Prisma client

### Verification
- `npx prisma studio` shows all seeded data
- Database contains all 16 products, 5 categories, 6 cut types
- All relationships (Product → Category) are correct

---

## Phase 3: Authentication ⬜

### Prerequisites
- Phase 2 complete (Users table exists in DB)

### Scope
Replace simulated OTP with real authentication system.

### Tasks
1. **Choose OTP Provider**
   - Options: MSG91, Twilio, Firebase Auth, or custom SMS gateway
   - Configure environment variables

2. **Create Auth API Routes**
   - `POST /api/auth/send-otp` — Generate OTP, store in DB/cache, send via SMS
   - `POST /api/auth/verify-otp` — Validate OTP, create/find user, return session token
   - `GET /api/auth/me` — Return current user from session

3. **Session Management**
   - Use HTTP-only cookies or JWT tokens
   - Session stored server-side (database or Redis)

4. **Update AuthProvider**
   - Replace `sendOtp()` and `verifyOtp()` with API calls
   - Remove hardcoded `123456` / `1234` acceptance
   - Add session token storage and auto-login on refresh

5. **Protect Routes**
   - Create middleware for authenticated routes
   - Checkout, Orders, Profile require authentication
   - Admin requires separate admin role check

### Dependency Rules
- Auth API routes depend on Users table from Phase 2
- Do NOT change the OTP UI flow — keep the same 4-step UX (Mobile → OTP → Profile → Address)
- Do NOT remove the demo OTP codes until production SMS is confirmed working
- Session token format must be consistent across all future API routes

### Verification
- Real OTP sent to mobile number
- User created in database on first login
- Returning user auto-loads profile and addresses
- Session persists across page refreshes
- Logout clears session completely

---

## Phase 4: Customer APIs ⬜

### Prerequisites
- Phase 2 complete (all tables exist)
- Phase 3 complete (authentication works)

### Scope
Replace all localStorage reads/writes in context providers with API calls.

### Tasks
1. **Product APIs**
   - `GET /api/products` — List all products with categories
   - `GET /api/products/[id]` — Single product with gallery, cuts
   - `GET /api/categories` — List categories
   - `GET /api/cuts` — List active cut types

2. **Cart APIs**
   - `GET /api/cart` — Get user's server-side cart
   - `POST /api/cart/add` — Add item with server-side price validation
   - `PUT /api/cart/update` — Update quantity/weight/cut
   - `DELETE /api/cart/clear` — Clear cart

3. **Address APIs**
   - `GET /api/addresses` — List user's addresses
   - `POST /api/addresses` — Add new address
   - `PUT /api/addresses/[id]` — Update address
   - `DELETE /api/addresses/[id]` — Delete address

4. **Order APIs**
   - `POST /api/orders` — Place order (validate cart, calculate totals server-side)
   - `GET /api/orders` — List user's orders
   - `GET /api/orders/[id]` — Order details

5. **Banner & Delivery APIs**
   - `GET /api/banners` — Active banners for homepage
   - `GET /api/delivery/settings` — Delivery config for checkout
   - `GET /api/delivery/slots` — Available slots for selected date

6. **Update Context Providers**
   - CartProvider: Fetch products/cuts from API, sync cart with server
   - LocationProvider: Fetch service areas from API (or keep static)
   - AuthProvider: Already updated in Phase 3

### Dependency Rules
- ALL price calculations MUST be validated server-side (never trust client prices)
- Cart changes must sync to server in real-time
- Products and cuts should be fetched on mount, not hardcoded
- Keep localStorage as fallback/cache for offline resilience
- Promo code validation must happen server-side

### Verification
- Products load from database (visible in Network tab)
- Cart persists across devices when logged in
- Addresses CRUD works correctly
- Orders saved in database
- Promo codes validated server-side

---

## Phase 5: Payments ⬜

### Prerequisites
- Phase 4 complete (Order API exists)

### Scope
Switch Razorpay from test to production mode. Add payment verification.

### Tasks
1. **Production Razorpay Setup**
   - Create Razorpay live account
   - Update `.env` with production keys
   - Configure webhooks for payment confirmations

2. **Server-Side Order Creation**
   - Order total calculated server-side (not from client)
   - Razorpay order created with server-calculated amount
   - Payment amount locked at order creation time

3. **Payment Verification**
   - Signature verification using production secret
   - Update order status in database after successful payment
   - Handle webhook callbacks for async confirmation

4. **Refund Support**
   - Admin-initiated refund API
   - Razorpay refund API integration

### Dependency Rules
- NEVER expose `RAZORPAY_KEY_SECRET` to client
- Order amount must be calculated server-side
- Double-payment prevention (idempotency keys)
- COD orders don't go through Razorpay

### Verification
- Real money test transaction completes
- Payment recorded in database
- Order status updates correctly
- Webhook handles delayed confirmations

---

## Phase 6: Admin Dashboard ⬜

### Prerequisites
- Phase 4 complete (all APIs exist)
- Phase 5 complete (payments work)

### Scope
Replace localStorage-based admin with database-backed admin panel.

### Tasks
1. **Admin Authentication**
   - Separate admin login (not customer OTP)
   - Role-based access control
   - Protect all `/admin/*` routes with middleware

2. **Order Management**
   - View all orders with filters (status, date, customer)
   - Update order status (Confirmed → Preparing → Out for Delivery → Delivered)
   - Assign delivery boy to order

3. **Product Management**
   - Full CRUD for products
   - Image upload to Cloudflare R2
   - Stock status management
   - Weight/pricing management

4. **Banner Management**
   - CRUD for banners with R2 image upload
   - Scheduling (start/end dates)
   - Reordering

5. **Delivery Settings**
   - Slot management saved to database
   - Same-day delivery toggle
   - Free delivery threshold

6. **Analytics Dashboard**
   - Today's orders count and revenue
   - Order status breakdown
   - Top-selling products
   - Customer count

### Dependency Rules
- Admin changes must propagate to customer-facing pages in real-time
- Admin must not break customer flow
- Keep current admin UI patterns (tabs, forms, notifications)
- Image uploads go to R2, not localStorage base64

### Verification
- Admin can manage all entities
- Changes reflect on customer pages
- Orders flow correctly through status pipeline
- Analytics show accurate data

---

## Phase 7: Delivery Boy System ⬜

### Prerequisites
- Phase 6 complete (order management with status updates)

### Scope
Delivery boy mobile-optimized panel for order fulfillment.

### Tasks
1. **Delivery Boy Model**
   - Database table: DeliveryBoy (id, name, mobile, status, currentOrders)
   - OTP-based login for delivery boys

2. **Assignment System**
   - Admin assigns orders to delivery boys
   - Delivery boy sees assigned orders on dashboard
   - Auto-assignment rules (optional)

3. **Delivery Workflow**
   - Accept order → Pick up → Navigate → Deliver → Confirm
   - Photo proof of delivery
   - Customer signature (optional)

4. **Location Sharing**
   - Delivery boy shares GPS location during delivery
   - Location sent to server at intervals

### Dependency Rules
- Delivery boy system depends on order management (Phase 6)
- Mobile-optimized UI (delivery boys use phones)
- Real-time status updates visible to customer

---

## Phase 8: Live Tracking ⬜

### Prerequisites
- Phase 7 complete (delivery boy location sharing)

### Scope
Real-time order tracking for customers.

### Tasks
1. **Live Map**
   - Google Maps or Mapbox integration
   - Delivery boy location plotted in real-time
   - ETA calculation

2. **Order Status Timeline**
   - Visual timeline: Confirmed → Preparing → Picked Up → On the Way → Delivered
   - Each step shows timestamp

3. **Push Notifications**
   - Status change notifications
   - "Your order is out for delivery" alerts
   - Web push + WhatsApp integration

### Dependency Rules
- Requires delivery boy GPS data (Phase 7)
- Map API key required
- WebSocket or SSE for real-time updates

---

## General Development Rules

### Code Standards
- All components use `"use client"` directive (current pattern)
- TypeScript strict mode
- Tailwind for all styling (no inline styles except dynamic values)
- Lucide React for all icons
- All text uses the project's compact typography scale
- All interactive elements have `active-scale` class

### Git Workflow
- Feature branches for each phase
- PR review before merge to main
- No direct commits to main
- Semantic commit messages

### Testing Strategy
- Phase 2+: Unit tests for API routes
- Phase 4+: Integration tests for checkout flow
- Phase 6+: E2E tests for admin operations
- Manual QA on mobile devices after each phase

### Performance Rules
- Images: Use Next.js `<Image>` with proper `sizes` attribute
- Fonts: Use `next/font/google` (no external CSS imports)
- Bundle: Keep page-level code splitting (App Router default)
- Loading: Show skeleton states for API-fetched data

### Security Rules
- Never expose secrets in client code
- Validate all inputs server-side
- Sanitize user-generated content (special cut instructions)
- Rate limit OTP sends
- CSRF protection on mutations
- Admin routes require role verification
