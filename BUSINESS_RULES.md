# NONZO — BUSINESS RULES
> All finalized business logic decisions. Backend implementation MUST enforce these rules.
> Last updated: 2026-06-16

---

## 1. Delivery Rules

| Rule | Value | Source |
|---|---|---|
| **Service Area** | Ulwe Sectors 5, 8, 17, 24 only | `location-context.tsx` → `SERVICE_AREAS` |
| **City** | Navi Mumbai, Maharashtra | Hardcoded in address forms |
| **Pincode** | 410206 | Default pincode across all forms |
| **Operating Hours** | 8 AM – 9 PM, Daily | `desktop-footer.tsx` |
| **Default Delivery Date** | Tomorrow | `checkout/page.tsx` → `deliveryDate` default |
| **Same-Day Delivery** | Disabled by default | `cart-context.tsx` → `sameDayDelivery: false` |
| **Same-Day Toggle** | Admin-configurable | Admin panel → Delivery tab |

### Delivery Date Options
| Option | Enabled By Default | Notes |
|---|---|---|
| Today | ❌ No | Only if admin enables `sameDayDelivery` |
| Tomorrow | ✅ Yes (default selection) | Always available |
| Day +2 | ✅ Yes | Always available |
| Day +3 | ✅ Yes | Always available |

---

## 2. Delivery Slot Rules

### Default Slots
| Slot ID | Time Window | Enabled | Max Orders |
|---|---|---|---|
| `slot-1` | 8 AM – 10 AM | ✅ | 15 |
| `slot-2` | 10 AM – 12 PM | ✅ | 15 |
| `slot-3` | 5 PM – 9 PM | ✅ | 15 |

### Slot Management Rules
- Admin can add, edit timing, toggle enable/disable, and set max order limits per slot
- Only enabled slots are shown to customers at checkout
- Default selection: first enabled slot
- All slot data persisted to `localStorage` key: `nonzo_delivery_settings`
- Slot settings are shared via `CartContext.deliverySettings`

---

## 3. Free Delivery Rules

| Rule | Value |
|---|---|
| **Free Delivery Threshold** | ₹699 |
| **Standard Delivery Charge** | ₹39 (flat) |
| **FREESHIP Promo Code** | Makes delivery free regardless of order value |
| **Empty Cart** | Delivery fee = ₹0 (no charge on zero subtotal) |

### Calculation Logic (from `cart-context.tsx`)
```
isFreeDelivery = subtotal >= 699 OR promoCode === "FREESHIP"
deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : 39
```

### Cart UI Behavior
- If below threshold: Progress bar showing "Add ₹X more to get FREE Delivery" with animated "Add Fish" CTA
- If at/above threshold: Green success banner "Congratulations! You are eligible for FREE Delivery"

---

## 4. Pricing Rules

### Product Pricing Structure
Each product has `weightOptions` array with predefined price points:
```typescript
interface WeightOption {
  weight: string;    // "250g", "500g", "1kg", "2kg"
  price: number;     // Selling price
  originalPrice: number; // MRP / strikethrough price
}
```

### Dynamic Pricing for Custom Weights
When a customer selects a weight not in the predefined `weightOptions`, dynamic pricing is calculated:
```
ratio = targetWeight / baseWeight
if ratio > 1: scaleModifier = 0.92 (8% bulk discount)
if ratio < 1: scaleModifier = 1.05 (5% small portion markup)
price = basePrice × ratio × scaleModifier (rounded)
originalPrice = dynamicPrice × 1.2 (20% markup for MRP)
```

### Cart Item Price
```
itemPrice = weightPrice + cutType.extraCharge
itemOriginalPrice = weightOriginalPrice + cutType.extraCharge
```

### Cart Item ID Format
```
cartItemId = `${productId}-${weight}-${cutTypeId}`
```
This means the same product with different weight/cut combinations creates separate cart items.

---

## 5. Discount Rules

### Promo Codes (defined in `cart-context.tsx`)

| Code | Type | Value | Min Order |
|---|---|---|---|
| `NONZO10` | Percentage | 10% off subtotal | ₹0 (no minimum) |
| `NONZO50` | Flat | ₹50 off | ₹399 minimum |
| `FREESHIP` | Free Shipping | ₹0 (removes delivery charge) | ₹200 minimum |
| `EATBETTER` | Percentage | 15% off subtotal | ₹599 minimum |

### Promo Validation Rules
- Code is case-insensitive (converted to uppercase)
- Only one promo code can be applied at a time
- If subtotal < `minOrder`: Error shown, code not applied
- Invalid code: Error "Invalid promo code. Try NONZO10."
- Applied promo can be removed anytime

### Discount Calculation
```
if type === "flat": discount = value
if type === "pct": discount = round(subtotal × value / 100)
if type === "freeship": discount = deliveryFee (effectively 0 since delivery is already free)
```

### Product Discount Display
```
discountPct = round((originalPrice - price) / originalPrice × 100)
```
Shown as badge on product cards: "{X}% off"

---

## 6. Cut Type Rules

### Cut Type Data Structure
```typescript
interface CutType {
  id: string;
  name: string;
  description: string;
  extraCharge: number;
  image: string;
  status: "active" | "disabled";
}
```

### Cut Type Business Rules
- Each product defines `allowedCuts: string[]` — only listed cut IDs are available
- "Whole Fish" (`whole`) cannot be deleted from admin
- Disabled cuts are hidden from customers but retained in system
- Cut charges are added on top of weight price
- Cut type selection available in: Product detail page, Cart page

### Special Cut Rules
- Special Cut ID: `special-cut`
- Extra charge: ₹30
- Allows free-text instructions (max 200 characters)
- Instructions textarea appears only when `special-cut` is selected
- Examples shown as placeholder: "Thin slices for fry", "Medium curry pieces", "Keep head attached", "Remove skin"
- Special instructions are preserved throughout cart → checkout → order

---

## 7. Order Rules

### Order ID Format
```
NZ-{5-digit-random}-{2-digit-year}
Example: NZ-98421-26
```

### Order Data Structure
```typescript
{
  id: string;              // NZ-XXXXX-YY
  date: string;            // "09 June 2026"
  status: string;          // "Confirmed & Preparing" | "Delivered" | etc.
  items: OrderItem[];      // Array of items with name, weight, cut, qty, price, instructions
  total: number;           // Final charged amount
  paymentMethod: string;   // "Online Payment (Razorpay)" | "Cash On Delivery"
  paymentStatus: string;   // "Paid" | "Pending"
  paymentId: string | null;
  razorpayOrderId: string | null;
  deliveryAddress: string;
}
```

### Order Storage Rules
- **Per-user storage:** `nonzo_orders_{mobile}` (array of orders)
- **Global storage:** `nonzo_placed_orders` (array with `userMobile` and `userName` added)
- New orders are unshifted (newest first)
- Order placed → cart is cleared + promo code is removed

### Order Status Flow
```
Confirmed & Preparing → Out for Delivery → Delivered
```

---

## 8. Payment Rules

### Payment Methods
1. **Online Payment (Razorpay)**
   - Flow: Create order → Load Razorpay script → Open checkout → Verify signature
   - API routes: `/api/razorpay/order` (POST), `/api/razorpay/verify` (POST)
   - Key: `rzp_test_SwESWXTwV4F46I` (test mode)
   - Theme color: `#C8102E` (brand red)
   - Currency: INR
   - Prefill: User name, email, mobile

2. **Cash On Delivery (COD)**
   - Direct order placement, no payment gateway
   - Payment status: "Pending"

### Payment Error Handling
- Script load failure: "Failed to load Razorpay checkout script"
- Order creation failure: Error from API displayed
- Verification failure: Error displayed with retry option
- User dismissal: "Payment verification cancelled. You can retry or complete order via COD."

---

## 9. Customer Rules

### Authentication Flow
```
1. Enter 10-digit mobile number → Send OTP
2. Enter OTP (demo: 123456 or 1234) → Verify
3. If existing user: Auto-login with saved profile
4. If new user: Complete profile (name, email) → Complete address → Register
```

### No Guest Checkout
- OTP verification is REQUIRED before checkout
- Auth gate appears at: Cart → "Proceed to Checkout" (if not logged in)
- Auth gate also appears at: Checkout page directly, Profile page

### User Profile Structure
```typescript
interface UserProfile {
  name: string;
  mobile: string;      // 10-digit, primary key
  email?: string;       // Optional
  address?: UserAddress;
}
```

### User Address Structure
```typescript
interface UserAddress {
  flat: string;
  area: string;        // Ulwe Sector X
  city: string;        // "Navi Mumbai"
  pincode: string;     // "410206"
  phone: string;
  tag: string;         // "Home" | "Office" | custom
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
}
```

### Address Storage
- Per-user: `nonzo_addresses_{mobile}` (array of address objects)
- Each address has a unique `id: addr-{timestamp}`
- One address can be set as `isDefault: true`
- Users can add, edit, delete, and set default address

### User Registry (Simulated Database)
- All users stored in: `nonzo_users_db` (keyed by mobile number)
- On login: user data merged into registry
- On OTP verify: registry checked for existing user

---

## 10. Stock Status Rules

| Status | Display | Behavior |
|---|---|---|
| `In Stock` | No badge | Normal add-to-cart |
| `Low Stock` | Amber "Low Stock" badge (top-right) | Normal add-to-cart (warns scarcity) |
| `Out Of Stock` | Gray "Sold Out" badge (top-right) | Card opacity 70%, "Sold Out" button, cannot add to cart |

### Stock Status in Homepage Sections
- "Landed Fresh Today" section: Filters out `Out Of Stock` products, shows first 4

---

## 11. Recently Viewed & Buy Again Rules

### Recently Viewed
- Stored in: `nonzo_recently_viewed` (array of product IDs in localStorage)
- Displayed as horizontal scroll on homepage
- Only shown if user has viewed products

### Buy Again
- Currently hardcoded to specific product IDs: `bombil`, `black-pomfret`
- Only shown if user has recently viewed items (proxy for returning user)
- Compact horizontal cards with "Reorder" CTA

---

## 12. Search Rules

### Search Behavior
- Real-time filtering across: `product.name`, `product.tagline`, `product.category`
- Autocomplete suggestions: Top 5 matching products
- Popular searches: "Pomfret", "Tiger Prawns", "Surmai", "Rawas", "Lobster", "Mud Crab"
- Category filter chips alongside text search
- Header search bar syncs with search page via `CustomEvent`

### Search URL
- Pattern: `/search?q={query}`
- URL updated via `history.replaceState` (no full navigation)

---

## 13. Banner Management Rules

### Banner Data Structure
```typescript
interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  destinationType: "product" | "category" | "collection" | "custom";
  destinationValue: string;
  isActive: boolean;
  order: number;
  offerBadge?: string;
  offerPrice?: number;
  originalPrice?: number;
  ctaText?: string;
  startDate?: string;
  endDate?: string;
}
```

### Banner Display Rules
- Only `isActive: true` banners are shown
- Date-gated: If `startDate` set, hide before that date; if `endDate` set, hide after
- Storage: `nonzo_admin_banners` in localStorage
- Admin can: Add, delete, reorder, toggle active, set scheduling dates

### Available Offer Badges
- "Today Special Catch"
- "Best Deal"
- "Flash Sale"
- "Fresh Arrival"
- "Limited Stock"
- "Weekend Offer"
