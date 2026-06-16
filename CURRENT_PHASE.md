# CURRENT_PHASE.md

## Project Name
NONZO

## Tagline
Eat Better. Live Better.

## Current Status Summary
The project is transitionally moving from frontend simulation to full-stack implementation. The frontend UI is complete with simulated React context providers and localStorage persistence. The database schema has been designed, coded into Prisma, and seeded. We are now entering the backend development phase starting with the Authentication Architecture (Phase 3A) to finalize how real OTP verification, JWT, and session management will be structured before coding the backend APIs.

## Completed Phases
* Brand Finalization
* UI/UX Freeze
* Frontend Development
* Database Planning
* Prisma Schema
* Seed Data
* Database Architecture Freeze
* Phase 3A – Authentication Architecture
* Phase 3B – OTP Authentication Backend

## Current Active Phase
Phase 4 – Customer APIs

## Current Objective
Implement server-side customer APIs (Products, Cart, Addresses, Orders) connecting frontend components to MySQL.

## Completed Deliverables
* **Project Initialization:** Next.js 16.2.9 configured with React 19.2.4, TypeScript, Tailwind CSS v4, and PostCSS. PWA `manifest.json` configured with standalone mode.
* **Design System & Global Layout:** Defined custom variables, micro-animations (`hover-scale`, `active-scale`), compact typography scale (9px–14px), and Netflix-style brand reveal splash screen.
* **Key Components:** Header, Mobile bottom nav, Product card with hover-to-rotate desktop gallery, Location modal, Cart bar, and Desktop footer.
* **Functional Frontend Routes:** Homepage, Search with filters, Category list, Product detail with custom cuts, Cart item management, Checkout, Order confirmation, Profile accordion, and Admin control panel.
* **State & Flow Simulation:** Client-side React context providers (`AuthProvider`, `LocationProvider`, `CartProvider`) handling simulated login, area verification, dynamic pricing calculations, promo codes, and local orders.
* **Test Payment Integration:** Created Razorpay test mode order creation and verification API routes (`/api/razorpay/order` and `/api/razorpay/verify`).
* **Relational Database Design:** Complete MySQL schema mapped to Prisma for users, sessions, addresses, products, categories, orders, cut types, inventory batches, and admin settings.
* **Database Seeding:** Created `prisma/seed.js` containing full mock catalog (16 products, 5 categories, 6 cut types) and default delivery/banner settings.
* **Backend OTP Authentication (Phase 3B):** Implemented database-backed Next.js API endpoints (`send-otp`, `verify-otp`, `register`, `logout`, `me`), JWT cookie session handling, MariaDB/Prisma client integration, activity logging, and frontend provider integration.

## Frozen Decisions
* **Relational Database Choice:** MySQL database via Prisma ORM.
* **No Guest Checkout:** OTP authentication is strictly required before checkout.
* **No Cleaning Fee:** Cleaning fee is set to 0 (removed entirely).
* **Delivery Fees:** Flat ₹39 delivery charge; free delivery above the ₹699 threshold.
* **Tomorrow Default:** Default delivery date is tomorrow (same-day delivery disabled by default and toggled by admin).
* **Special Cuts:** Allowed and capped at 200 characters max for custom instructions.
* **COD Support:** Cash on Delivery (COD) is available as an option alongside Razorpay.
* **Promo Code Rules:** Single-promo use only with specific thresholds (NONZO10, NONZO50, FREESHIP, EATBETTER).
* **Dynamic Pricing:** Dynamic pricing for custom weights (8% bulk discount for > base weight, 5% markup for < base weight).
* **Design Styling:** Dark fixed header/nav bar, white body, Brand Red `#C8102E` action color.
* **Target Delivery Zone:** Limited to Ulwe Sectors 5, 8, 17, 24 (Pincode: 410206).

## Next Phase
Phase 4 – Customer APIs (Products, Cart, Addresses, Orders)

## Upcoming Phases
* JWT & Session Management
* Profile APIs
* Address APIs
* Wishlist APIs
* Cart APIs
* Order APIs
* Razorpay APIs
* Admin APIs
* Delivery Boy APIs

## Future Infrastructure Decisions
* MySQL
* Prisma
* Cloudflare R2
* Razorpay
* MSG91 (planned)

## Notes For Future AI Agents
Always read all memory files before making any changes. Keep documentation files (`PROJECT_BLUEPRINT.md`, `UI_UX_RULES.md`, `BUSINESS_RULES.md`, `ARCHITECTURE.md`, `DEVELOPMENT_WORKFLOW.md`, `CHANGELOG.md`, `CURRENT_PHASE.md`) synchronized.
