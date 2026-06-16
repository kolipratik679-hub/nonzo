# NONZO — UI/UX RULES
> All finalized UI/UX decisions. Every future component MUST follow these rules.
> Last updated: 2026-06-16

---

## 1. Color System

### Core Palette

| Token | CSS Variable | Hex Value | Usage |
|---|---|---|---|
| `--background` | `var(--background)` | `#FFFFFF` | Page background, content areas |
| `--foreground` | `var(--foreground)` | `#111111` | Primary text, dark elements |
| `--brand-red` | `var(--brand-red)` | `#C8102E` | CTAs, active states, badges, brand accent |
| `--success` | `var(--success)` | `#16A34A` | Success states, confirmations |
| `--warning` | `var(--warning)` | `#F59E0B` | Low stock badges, warnings |
| `--info` | `var(--info)` | `#2563EB` | Information states |
| `--error` | `var(--error)` | `#DC2626` | Error states, destructive actions |
| `--light-gray` | `var(--light-gray)` | `#F5F5F5` | Card backgrounds, input backgrounds |
| `--border-gray` | `var(--border-gray)` | `#E5E7EB` | Borders, dividers |

### Semantic Color Usage

| Context | Color |
|---|---|
| Header background | `#111111` (bg-[#111111]/95 with backdrop-blur) |
| Bottom nav background | `#111111` |
| Content area background | `#FFFFFF` |
| Footer background | `#111111` |
| Primary CTA buttons | `bg-brand-red` hover `bg-red-700` |
| Secondary CTA buttons | `border-border-gray bg-white` |
| Discount badges | `bg-brand-red text-white` |
| Low Stock badge | `bg-amber-500 text-white` |
| Sold Out badge | `bg-zinc-500 text-white` |
| Free delivery indicator | `bg-emerald-50 text-emerald-800` |
| Promo applied | `bg-emerald-50 border-emerald-100 text-emerald-800` |
| Error alerts | `bg-red-50 border-red-200 text-brand-red` |
| Section headings | `text-zinc-400` (uppercase, tracking-wider) |

### Theme Color (PWA / Browser)
- Theme color: `#111111`
- Background color: `#111111` (manifest)

---

## 2. Typography

### Font Stack
- **Primary:** Geist Sans (`--font-geist-sans`), fallback: Inter, sans-serif
- **Monospace:** Geist Mono (`--font-geist-mono`), fallback: monospace
- **Font features:** `cv02, cv03, cv04, cv11`

### Type Scale (as used in current implementation)

| Element | Size | Weight | Extra |
|---|---|---|---|
| Section headings | `text-xs` (12px) | `font-black` | `uppercase tracking-wider text-zinc-400` |
| Product card name | `text-[11px]` / `sm:text-xs` | `font-bold` | `leading-snug` |
| Product card tagline | `text-[10px]` | regular | `text-zinc-400` |
| Product card category label | `text-[9px]` | `font-bold` | `uppercase tracking-widest text-zinc-400` |
| Price display | `text-sm` (14px) | `font-black` | — |
| Original price (strikethrough) | `text-[9px]` | regular | `text-zinc-400 line-through` |
| CTA button text | `text-[10px]` / `text-xs` | `font-bold` / `font-extrabold` | `uppercase` on major CTAs |
| Page title | `text-base` / `text-lg` | `font-black` | `uppercase tracking-wider` |
| Body text | `text-xs` / `text-[11px]` | `font-medium` / `font-semibold` | `leading-relaxed text-zinc-400/500` |
| Badge text | `text-[9px]` / `text-[10px]` | `font-extrabold` | `uppercase tracking-wide` |
| Micro labels | `text-[8px]` / `text-[9px]` | `font-bold` | `uppercase tracking-wider` |

### Typography Rules
- All section headings are `UPPERCASE` with `tracking-wider`
- NONZO uses extremely compact font sizes (9px–12px range predominantly)
- Heavy font weights (`font-bold`, `font-extrabold`, `font-black`) for all interactive elements
- Use `leading-snug` for product names, `leading-relaxed` for descriptions
- Prices always use `font-black`

---

## 3. Layout Rules

### Global Layout Structure
```
<html>
  <body class="min-h-full flex flex-col bg-white text-foreground">
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <SplashScreen />        ← z-[60], full-screen overlay
          <LocationModal />       ← z-50, full-screen overlay
          <AppHeader />           ← z-40, fixed top
          <main>                  ← flex-1, max-w-7xl, px-3, pb-24 (mobile) / pb-6 (desktop)
            {children}
          </main>
          <DesktopFooter />       ← hidden on mobile
          <StickyCartBar />       ← z-35, fixed bottom (above bottom nav)
          <BottomNav />           ← z-45, fixed bottom
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  </body>
</html>
```

### Content Padding
- Mobile: `px-3`, `pt-[72px]` (below header), `pb-24` (above bottom nav)
- Desktop: `px-4`, `pt-[80px]`, `pb-6`
- Max content width: `max-w-7xl` with `mx-auto`

### Grid System
- Product grids: `grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4`
- Category grid: `md:grid-cols-5`
- Trust badges: `grid-cols-4 gap-2`
- Order summary: Single column, full width

---

## 4. Header Rules

### Dark Sticky Header
- **Position:** Fixed top, z-40
- **Background:** `bg-[#111111]/95 backdrop-blur-md`
- **Border:** `border-b border-zinc-800`
- **Height:** `h-14` (mobile) / `h-16` (desktop)

### Header Elements
- **Logo:** Left-aligned, h-9 (mobile) / h-10 (desktop), links to `/`
- **Location selector (Mobile):** Compact pill with MapPin icon, max-w-[150px], text-[10px]
- **Location selector (Desktop):** Larger pill, max-w-[200px], text-xs, hidden on mobile
- **Search bar (Desktop):** Centered, `flex-1 max-w-md`, rounded-full, hidden on mobile
- **Nav items (Desktop):** Orders, Account, Cart links, hidden on mobile
- **Cart badge:** Red circle with item count, `text-[9px]`

---

## 5. Mobile Navigation Rules

### Dark Bottom Tab Bar
- **Position:** Fixed bottom, z-45
- **Background:** `bg-[#111111]`
- **Border:** `border-t border-zinc-800`
- **Shadow:** `0_-4px_12px_rgba(0,0,0,0.3)`
- **Visibility:** Mobile only (`md:hidden`)
- **Safe area:** `safe-bottom` padding for iPhone home indicator

### Tab Items (4 tabs)
1. **Home** (`/`) — Home icon
2. **Search** (`/search`) — Search icon
3. **Cart** (`/cart`) — ShoppingBag icon + red badge with item count
4. **Profile** (`/profile`) — User icon

### Tab Styling
- Active: `text-brand-red font-semibold stroke-[2.5]`
- Inactive: `text-zinc-400 stroke-[2]`
- Label: `text-[10px] tracking-wide`
- Min touch target: 48px × 44px

### Hide Bottom Nav
- Hidden on product detail pages (`/product/`) to avoid overlap with product CTA

---

## 6. Product Card Rules

### Card Structure
- Rounded: `rounded-2xl`
- Border: `border-border-gray`, hover: `border-zinc-300`
- Background: `bg-white`
- Image: `aspect-square` container
- Content: `p-2.5 sm:p-3`

### Product Card Information Hierarchy
1. Category label (top) — `text-[9px] uppercase tracking-widest text-zinc-400`
2. Product name — `text-[11px] font-bold leading-snug` (2-line clamp)
3. Tagline — `text-[10px] text-zinc-400` (1-line clamp)
4. Weight label — `text-[9px] text-zinc-400`
5. Price — `text-sm font-black` + original price strikethrough
6. Add button / quantity stepper

### Badges (positioned absolute on image)
- Discount: top-left, `bg-brand-red`, `text-[9px]`, rounded-full
- Stock status: top-right, amber (Low Stock) or zinc (Sold Out)

### Image Gallery Behavior (Desktop Only)
- On hover: Images auto-rotate every 1.5s through `galleryImages` array
- Crossfade transition: `duration-500 ease-in-out`
- Mobile: Static main image only

### Add-to-Cart Button
- Initial state: `border-brand-red/20 bg-brand-red/5 text-brand-red` with Plus icon + "Add"
- In-cart state: Solid `bg-brand-red` stepper with Minus/quantity/Plus
- Min height: 32px
- Touch event stopPropagation prevents card click

---

## 7. Category Card Rules

### Mobile Scroll Behavior
- Horizontal scroll: `overflow-x-auto no-scrollbar scroll-smooth snap-x`
- Card width: `calc((100vw - 60px) / 3.5)` — shows 3.5 cards visible
- Snap: `snap-start`
- Gap: `gap-3`

### Desktop Grid
- `md:grid md:grid-cols-5 md:gap-4 md:overflow-visible`

### Category Card Structure
- Image: `aspect-[4/3]` with `object-cover`
- Title below image: `text-[11px] font-extrabold tracking-wide`
- Selected state: `border-brand-red ring-2 ring-brand-red/20` + checkmark overlay
- Hover: `group-hover:scale-105` on image, `group-hover:text-brand-red` on text

---

## 8. Cart Rules

### Cart Item Card
- Rounded: `rounded-2xl border border-border-gray bg-white p-3.5`
- Product image: `h-16 w-16 rounded-xl`
- Weight selector: dropdown (`<select>`) with rounded-full styling
- Cut type display: pill badge showing cut name + extra charge
- Cut type selector: Horizontal scroll of small image-based buttons
- Special cut textarea: Shown only when `special-cut` selected, max 200 chars

### Quantity Stepper (in cart)
- Container: `rounded-lg border border-brand-red bg-brand-red/5`
- Buttons: Minus/Plus with `text-brand-red`
- Count: `text-xs font-extrabold`

### Free Delivery Progress Bar
- Shows remaining amount needed: "Add ₹X more to get FREE Delivery"
- Progress bar: `bg-zinc-200` track, `bg-brand-red` fill
- Threshold display: `text-[10px] text-zinc-400`
- When threshold met: Green success banner with checkmark

### Order Summary Section
- Product Total, Delivery Fee (FREE/₹39), Promo Discount
- No cleaning fee line (cleaning fee removed)
- Total line: `text-sm font-black`

---

## 9. Checkout Rules

### Checkout Steps (Logged In)
1. Address selection (radio-style cards)
2. Delivery date selection (horizontal pills)
3. Delivery slot selection (cards)
4. Payment method (Online/COD cards)
5. Order summary
6. Place Order CTA

### Date Selection
- Pills: `rounded-full`, active = `bg-brand-red text-white`
- "Today" pill: disabled with amber alert if same-day delivery is off
- Default selected: "Tomorrow"

### Payment Methods
- Online Payment: Razorpay branded card
- Cash On Delivery: Banknote icon card
- Active: `border-brand-red bg-brand-red/5`
- Inactive: `border-border-gray bg-white`

### Order Confirmation Screen
- Large green CheckCircle2 icon with bounce animation
- Order ID displayed prominently
- Delivery date/slot and address shown
- Two CTAs: "Continue Shopping" (primary), "Track Order Status" (secondary)

---

## 10. Profile Rules

### Not-Logged-In State
- Full-screen OTP login form (same 4-step flow as cart auth gate)
- Centered card with max-w-md

### Logged-In State
- Profile header: Dark card (`bg-neutral-950`) with name, mobile, email, avatar initial
- Accordion sections: Personal Info, Account & Security, Saved Addresses, Order History, Support

### Accordion Pattern
- Rounded-2xl cards with border
- Click to expand/collapse (only one open at a time)
- Icon + label header, ChevronDown/Up indicator

---

## 11. Banner Rules

### Hero Banner Carousel
- Aspect ratio: `16:9` (mobile) / `21:7` (desktop)
- Auto-cycle: 4.5 seconds per slide
- Transition: `duration-700 ease-in-out` fade + scale
- Gradient overlay: `from-black/90 via-black/45 to-black/10` (bottom to top)
- Dots indicator: Bottom center, active dot = `bg-white w-6`, inactive = `bg-white/40 w-2`
- Prev/Next arrows: Desktop only, `bg-black/30 backdrop-blur`

### Banner Content
- Badge (optional): `text-[8px] md:text-[9px] uppercase bg-brand-red`
- Title: `text-base md:text-2xl font-black uppercase tracking-wider text-white`
- Subtitle: `text-xs md:text-sm font-bold text-zinc-200`
- Pricing: Offer price + original price (strikethrough) + % OFF badge
- CTA: `bg-brand-red rounded-full text-[10px] font-extrabold`

### Banner Clicks → Routes
- Product: `/product/{id}`
- Category: `/category/{id}`
- Collection: `/collection/{id}`

---

## 12. CTA Rules

### Primary CTA
- `bg-brand-red text-white rounded-xl/rounded-2xl`
- Hover: `hover:bg-red-700`
- Shadow: `shadow-[0_4px_20px_rgba(200,16,46,0.3)]`
- Height: 56px for major checkout/cart CTAs
- Font: `font-bold` / `font-extrabold`
- Active: `active-scale` (transform scale 0.97)

### Secondary CTA
- `border border-border-gray bg-white text-zinc-700`
- Hover: `hover:bg-light-gray`

### Disabled CTA
- `disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed`

---

## 13. Responsive Rules

### Breakpoints (Tailwind defaults)
- `sm:` → 640px+
- `md:` → 768px+ (main mobile/desktop breakpoint)
- `lg:` → 1024px+

### Mobile-First Decisions
- Bottom nav: mobile only (`md:hidden`)
- Desktop header nav: `hidden md:flex`
- Desktop footer: `hidden md:block`
- Category scroll: horizontal on mobile, grid on desktop
- Product grid: 2 cols mobile → 3 cols sm → 4 cols md
- Sticky cart bar: Different styling for mobile (above bottom nav) vs desktop (floating center)

### Small Screen Fix (< 360px)
```css
@media (max-width: 359px) {
  .product-card-price { font-size: 12px; }
  .product-card-btn { padding: 8px; font-size: 9px; }
}
```

### Viewport Settings
- `width: device-width`
- `initial-scale: 1, maximum-scale: 1`
- `user-scalable: false` (prevents zoom on input focus)
- `viewport-fit: cover` (for iPhone notch)

---

## 14. Splash Screen Rules

### Animation Sequence (2.5s total)
1. **0–0.4s:** Black screen, logo invisible
2. **0.4s–1.0s:** Logo fades in at scale(0.85)
3. **1.0s–2.0s:** Logo zooms smoothly to scale(1.1)
4. **2.0s–2.5s:** Logo + background fade out

### Tagline Animation
- "Eat Better. Live Better."
- `text-[10px] uppercase tracking-[0.25em] text-zinc-500`
- Fades in after logo, fades out before end

### Session Control
- Splash shown once per browser session (`sessionStorage.nonzo_splash_seen`)
- After splash completes → removed from DOM (400ms buffer)
- Location modal opens 200ms after splash ends (2700ms total)

---

## 15. Sticky Cart Bar Rules

### Mobile Cart Bar
- Position: Fixed, `bottom-[57px]` (above bottom nav)
- Full width with `px-3` padding
- Rounded: `rounded-2xl`
- Background: `bg-brand-red`
- Shadow: `shadow-[0_4px_20px_rgba(200,16,46,0.3)]`
- Height: 56px
- Content: ShoppingBag icon + item count + subtotal + arrow

### Desktop Cart Bar
- Position: Fixed, `bottom-6`, centered (`left-1/2 -translate-x-1/2`)
- Floating pill shape
- Same brand-red styling

### Visibility Rules
- Hidden on: `/cart`, `/checkout`, `/product/*`, `/admin`
- Hidden when cart is empty

---

## 16. Modal Rules

### General Modal Pattern
- Overlay: `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm/md`
- Container: `rounded-t-3xl` (mobile, slides from bottom) / `rounded-2xl` (desktop, centered)
- Max height: `90vh` with overflow scroll
- Close: X button or Skip button (where applicable)

### Touch Optimization
- `.touch-scroll` class: `-webkit-overflow-scrolling: touch; overscroll-behavior: contain;`
- Min button height: 44px (`style={{ minHeight: "44px" }}`)

---

## 17. Micro-Animation Rules

### Utility Classes (defined in globals.css)
- `.hover-scale`: `transform: scale(1.02)` on hover with spring curve
- `.active-scale`: `transform: scale(0.97)` on press
- `.no-scrollbar`: Hides scrollbar on all browsers

### Animation Timing
- Hover transitions: `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` (spring)
- Splash animations: `2.5s cubic-bezier(0.25, 1, 0.5, 1)` (ease-out)
- Content transitions: `duration-300` (default Tailwind)
- Image crossfade: `duration-500 ease-in-out`
- Banner slide: `duration-700 ease-in-out`

### Body-Level Optimizations
- `-webkit-tap-highlight-color: transparent` — No blue flash on tap
- `touch-action: manipulation` — Removes 300ms tap delay
- `overflow-x: hidden` — Prevents horizontal scroll globally
