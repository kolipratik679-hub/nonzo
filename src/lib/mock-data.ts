export interface WeightOption {
  weight: string; // e.g. "250g", "500g", "1kg", "2kg"
  price: number;
  originalPrice: number;
}

export interface CutType {
  id: string;
  name: string;
  description: string;
  extraCharge: number;
  iconSvg: string; // custom SVG representation
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string; // "Fish" | "Prawns" | "Crabs" | "Shellfish" | "Seafood"
  image: string; // local image path
  images: string[]; // gallery images
  description: string;
  freshnessInfo: string;
  stockStatus: "In Stock" | "Low Stock" | "Out Of Stock";
  weightOptions: WeightOption[];
  allowedCuts: string[]; // ids of allowed cut types
}

export const CATEGORIES = [
  { id: "fish",     name: "Fish",      iconName: "Fish",    image: "/images/categories/fish.png" },
  { id: "prawns",   name: "Prawns",    iconName: "Waves",   image: "/images/categories/prawns.png" },
  { id: "crabs",    name: "Crabs",     iconName: "Shell",   image: "/images/categories/crab.png" },
  { id: "shellfish",name: "Shellfish", iconName: "Anchor",  image: "/images/categories/shellfish.png" },
  { id: "seafood",  name: "Seafood",   iconName: "Compass", image: "/images/categories/seafoods.png" }
];

export const CUT_TYPES: CutType[] = [
  {
    id: "whole",
    name: "Whole Fish",
    description: "Cleaned and gutted, tail and head intact.",
    extraCharge: 0,
    iconSvg: `<svg viewBox="0 0 64 64" class="w-12 h-12 stroke-current fill-none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 32C12 20 28 16 46 26C52 29 56 32 60 32C56 32 52 35 46 38C28 48 12 44 4 32Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 32C14 26 22 24 30 28" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="48" cy="29" r="2" fill="currentColor"/>
      <path d="M6 32L2 26V38L6 32Z" stroke-width="2" stroke-linejoin="round"/>
      <path d="M38 23C35 27 35 37 38 41" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "curry-cut",
    name: "Curry Cut",
    description: "Medium-sized bone-in pieces, perfect for traditional curries.",
    extraCharge: 15,
    iconSvg: `<svg viewBox="0 0 64 64" class="w-12 h-12 stroke-current fill-none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="24" width="12" height="16" rx="2" stroke-width="2"/>
      <rect x="26" y="22" width="12" height="20" rx="2" stroke-width="2"/>
      <rect x="42" y="26" width="12" height="12" rx="2" stroke-width="2"/>
      <path d="M16 24V20M32 22V18M48 26V22" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "steak-cut",
    name: "Steak Cut",
    description: "Clean, thick cross-section slices of the fish center.",
    extraCharge: 20,
    iconSvg: `<svg viewBox="0 0 64 64" class="w-12 h-12 stroke-current fill-none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="24" ry="12" stroke-width="2"/>
      <ellipse cx="32" cy="32" rx="14" ry="6" stroke-width="1.5" stroke-dasharray="2 2"/>
      <circle cx="32" cy="32" r="3" fill="currentColor"/>
    </svg>`
  },
  {
    id: "fillet",
    name: "Fillet",
    description: "Prime boneless sides cut along the spine, skin-on or skinless.",
    extraCharge: 40,
    iconSvg: `<svg viewBox="0 0 64 64" class="w-12 h-12 stroke-current fill-none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 22C16 16 48 16 58 26C59 27 59 29 57 30C47 36 15 42 6 32C4 30 4 24 6 22Z" stroke-width="2" stroke-linejoin="round"/>
      <path d="M16 24C24 22 38 22 46 27" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3"/>
    </svg>`
  },
  {
    id: "boneless",
    name: "Boneless Cubes",
    description: "Completely boneless and skinless premium cubes of fish meat.",
    extraCharge: 50,
    iconSvg: `<svg viewBox="0 0 64 64" class="w-12 h-12 stroke-current fill-none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 24L20 16L32 24L20 32L8 24Z" stroke-width="2" stroke-linejoin="round"/>
      <path d="M8 24V36L20 44V32" stroke-width="2" stroke-linejoin="round"/>
      <path d="M32 24V36L20 44" stroke-width="2" stroke-linejoin="round"/>
      <path d="M34 20L44 14L54 20L44 26L34 20Z" stroke-width="2" stroke-linejoin="round"/>
      <path d="M34 20V28L44 34V26" stroke-width="2" stroke-linejoin="round"/>
      <path d="M54 20V28L44 34" stroke-width="2" stroke-linejoin="round"/>
    </svg>`
  }
];

export const PRODUCTS: Product[] = [
  {
    id: "tiger-prawns",
    name: "Tiger Prawns",
    tagline: "Colossal, juicy freshwater prawns",
    category: "Prawns",
    image: "/images/TIGER PRAWNS.jpg",
    images: ["/images/TIGER PRAWNS.jpg", "/images/large prawns.jpg", "/images/small prawns.webp"],
    description: "These premium Tiger Prawns are known for their sweet, firm meat and spectacular striping. Freshly caught and immediately chilled, they are perfect for butter-garlic fry or grilling.",
    freshnessInfo: "Caught 6 hours ago off the coast of Alibaug. Cleaned, de-veined, and kept at 0-4°C.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "250g", price: 299, originalPrice: 350 },
      { weight: "500g", price: 549, originalPrice: 650 },
      { weight: "1kg", price: 999, originalPrice: 1200 }
    ],
    allowedCuts: ["whole", "boneless"]
  },
  {
    id: "black-pomfret",
    name: "Black Pomfret",
    tagline: "Richly flavored local delicacy",
    category: "Fish",
    image: "/images/black pomfret.jpg",
    images: ["/images/black pomfret.jpg", "/images/silver pompret.jpeg"],
    description: "Black Pomfret (Halwa) is a coastal favorite in Maharashtra. With a distinct rich flavor, medium texture, and minimal bones, it holds together beautifully in pan-fries and curries.",
    freshnessInfo: "Sourced directly from Sasoon Dock daily. Zero preservatives.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "250g", price: 349, originalPrice: 399 },
      { weight: "500g", price: 649, originalPrice: 750 },
      { weight: "1kg", price: 1199, originalPrice: 1400 }
    ],
    allowedCuts: ["whole", "curry-cut", "steak-cut", "fillet"]
  },
  {
    id: "silver-pomfret",
    name: "Silver Pomfret",
    tagline: "Ultra-premium, buttery, melting texture",
    category: "Fish",
    image: "/images/silver pompret.jpeg",
    images: ["/images/silver pompret.jpeg", "/images/black pomfret.jpg"],
    description: "The crown jewel of Indian seafood. Silver Pomfret is celebrated for its incredibly delicate, white meat and buttery taste. Ideal for tandoori baking or classic rava frying.",
    freshnessInfo: "Fresh caught via hook-and-line. Delivered within 12 hours of catch.",
    stockStatus: "Low Stock",
    weightOptions: [
      { weight: "250g", price: 499, originalPrice: 599 },
      { weight: "500g", price: 899, originalPrice: 1100 },
      { weight: "1kg", price: 1699, originalPrice: 1999 }
    ],
    allowedCuts: ["whole", "steak-cut", "fillet"]
  },
  {
    id: "bombil",
    name: "Bombil (Bombay Duck)",
    tagline: "Crispy fry specialist of Mumbai",
    category: "Fish",
    image: "/images/Bombil-main.jpg",
    images: ["/images/Bombil-main.jpg", "/images/mandeli.webp", "/images/Khapri-1.jpg"],
    description: "Bombay Duck (Bombil) is famous for its high moisture content and delicate texture. When pressed and coated with semolina (rava), it transforms into the crispiest, melting-soft treat.",
    freshnessInfo: "Direct from Versova dock. Cleaned, flattened, and moisture-controlled.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "250g", price: 149, originalPrice: 180 },
      { weight: "500g", price: 269, originalPrice: 320 },
      { weight: "1kg", price: 499, originalPrice: 600 }
    ],
    allowedCuts: ["whole", "fillet"]
  },
  {
    id: "rawas",
    name: "Rawas (Indian Salmon)",
    tagline: "Rich in Omega-3, meaty steak cut",
    category: "Fish",
    image: "/images/ravas - indian salmon.jpg",
    images: ["/images/ravas - indian salmon.jpg", "/images/hilsa.jpg", "/images/baramumdi - asian seabass.jpg"],
    description: "Rawas is one of the most popular fish in India. It is highly nutritious, packed with Omega-3 fatty acids, and has a pinkish-white firm flesh with a mild flavor.",
    freshnessInfo: "Caught off the Konkan coast. Hand-selected for weight and oil content.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "250g", price: 399, originalPrice: 450 },
      { weight: "500g", price: 749, originalPrice: 850 },
      { weight: "1kg", price: 1399, originalPrice: 1600 }
    ],
    allowedCuts: ["curry-cut", "steak-cut", "fillet", "boneless"]
  },
  {
    id: "lobster",
    name: "Rock Lobster",
    tagline: "Indulgent, sweet tail meat",
    category: "Seafood",
    image: "/images/lobster.jpg",
    images: ["/images/lobster.jpg", "/images/octopus.png"],
    description: "Premium cold-chain harvested Rock Lobster. Rich, sweet meat in the tail makes it a luxury dining experience. Ideal for baking with cheese or grilling with lemon butter.",
    freshnessInfo: "Live-chilled immediately at harvest. Extremely high shell-to-meat ratio.",
    stockStatus: "Low Stock",
    weightOptions: [
      { weight: "500g", price: 1299, originalPrice: 1500 },
      { weight: "1kg", price: 2499, originalPrice: 2900 }
    ],
    allowedCuts: ["whole"]
  },
  {
    id: "mud-crab",
    name: "Premium Mud Crab",
    tagline: "Huge claws with sweet, dense meat",
    category: "Crabs",
    image: "/images/mud crab.jpg",
    images: ["/images/mud crab.jpg", "/images/sea mud crab.jpg", "/images/deep sea blue crab.jpg"],
    description: "Mud Crabs are harvested from estuarine mangroves. They are prized for their heavy, meat-filled claws and rich, savory roe. Best cooked in thick spicy masala or Singapore style.",
    freshnessInfo: "Harvested live from mangrove farms in coastal Maharashtra.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "500g", price: 699, originalPrice: 800 },
      { weight: "1kg", price: 1299, originalPrice: 1500 }
    ],
    allowedCuts: ["whole"]
  },
  {
    id: "sea-crab",
    name: "Blue Sea Crab",
    tagline: "Delicate, sweet coastal blue crab",
    category: "Crabs",
    image: "/images/sea crab.jpg",
    images: ["/images/sea crab.jpg", "/images/deep sea blue crab.jpg", "/images/sea mud crab.jpg"],
    description: "Blue Sea Crabs are saltwater crabs with a sweeter, lighter taste profile compared to mud crabs. They make an exceptional traditional Konkani crab curry.",
    freshnessInfo: "Caught daily by local artisanal fishermen.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "500g", price: 449, originalPrice: 520 },
      { weight: "1kg", price: 849, originalPrice: 999 }
    ],
    allowedCuts: ["whole"]
  },
  {
    id: "barramundi",
    name: "Barramundi (Asian Seabass / Jitada)",
    tagline: "Flaky, white meat, extremely versatile",
    category: "Fish",
    image: "/images/baramumdi - asian seabass.jpg",
    images: ["/images/baramumdi - asian seabass.jpg", "/images/big-grouper.webp", "/images/grouper.jpg"],
    description: "Known locally as Jitada, Barramundi is celebrated for its clean, mild taste and large, moist flakes. Excellent for steaming, baking, or frying.",
    freshnessInfo: "Grown in pure brackish waters, harvested at dawn.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "250g", price: 249, originalPrice: 299 },
      { weight: "500g", price: 469, originalPrice: 550 },
      { weight: "1kg", price: 899, originalPrice: 1050 }
    ],
    allowedCuts: ["whole", "curry-cut", "fillet", "boneless"]
  },
  {
    id: "bangda",
    name: "Bangda (Mackerel)",
    tagline: "Healthy, oily fish with robust flavor",
    category: "Fish",
    image: "/images/BANGDA.jpeg",
    images: ["/images/BANGDA.jpeg", "/images/mandeli.webp"],
    description: "Bangda is a staple along the Konkan coast. Loaded with Omega-3 and proteins, its strong flavor pairs wonderfully with spicy, acidic, and coconut-based marinades.",
    freshnessInfo: "Landed at Sasoon dock, flash-iced within minutes.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "500g", price: 189, originalPrice: 220 },
      { weight: "1kg", price: 349, originalPrice: 420 }
    ],
    allowedCuts: ["whole", "curry-cut"]
  },
  {
    id: "tuna",
    name: "Yellowfin Tuna",
    tagline: "Meaty, deep-red sashimi-grade steaks",
    category: "Fish",
    image: "/images/tuna.webp",
    images: ["/images/tuna.webp", "/images/hilsa.jpg", "/images/ravas - indian salmon.jpg"],
    description: "Meaty Yellowfin Tuna has a firm texture and deep flavor. Perfect for quick searing on a hot pan or grill, keeping the center tender and moist.",
    freshnessInfo: "Deep-sea caught. Cleaned and temperature-locked at -2°C.",
    stockStatus: "Low Stock",
    weightOptions: [
      { weight: "250g", price: 299, originalPrice: 350 },
      { weight: "500g", price: 569, originalPrice: 680 },
      { weight: "1kg", price: 1099, originalPrice: 1300 }
    ],
    allowedCuts: ["steak-cut", "fillet", "boneless"]
  },
  {
    id: "oysters",
    name: "Coastal Rock Oysters",
    tagline: "Fresh, briny, ocean-fresh treats",
    category: "Shellfish",
    image: "/images/oyester.jpg",
    images: ["/images/oyester.jpg"],
    description: "Freshly harvested Coastal Rock Oysters. Known for their distinct mineral-rich, briny flavor. Serve chilled with a squeeze of fresh lemon and a dash of hot sauce.",
    freshnessInfo: "Harvested from clean shellfish beds under strict water quality monitoring.",
    stockStatus: "Out Of Stock",
    weightOptions: [
      { weight: "250g", price: 399, originalPrice: 450 },
      { weight: "500g", price: 749, originalPrice: 899 }
    ],
    allowedCuts: ["whole"]
  },
  {
    id: "hilsa",
    name: "Hilsa (Ilish)",
    tagline: "Bengal's prized silver fish, omega-rich",
    category: "Fish",
    image: "/images/hilsa.jpg",
    images: ["/images/hilsa.jpg", "/images/ravas - indian salmon.jpg"],
    description: "Hilsa, known as the King of Fish, is prized across Bengal and Bangladesh for its rich, oily flavour and melt-in-mouth texture. A rare seasonal delicacy.",
    freshnessInfo: "River-caught and flash-chilled within 4 hours. Available in limited quantities.",
    stockStatus: "Low Stock",
    weightOptions: [
      { weight: "500g", price: 699, originalPrice: 850 },
      { weight: "1kg", price: 1299, originalPrice: 1600 }
    ],
    allowedCuts: ["whole", "curry-cut", "steak-cut"]
  },
  {
    id: "sole-fish",
    name: "Sole Fish (Lepa)",
    tagline: "Delicate flatfish, perfect for light fry",
    category: "Fish",
    image: "/images/sole fish - lepa.jpg",
    images: ["/images/sole fish - lepa.jpg", "/images/Khapri-1.jpg"],
    description: "Sole fish, locally called Lepa, is a flat, white-fleshed fish with a mild, clean flavour. Excellent for a quick shallow fry or a light coastal curry.",
    freshnessInfo: "Caught from shallow coastal waters. Cleaned and chilled same day.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "250g", price: 199, originalPrice: 249 },
      { weight: "500g", price: 379, originalPrice: 449 }
    ],
    allowedCuts: ["whole", "fillet"]
  },
  {
    id: "mandeli",
    name: "Mandeli (Anchovies)",
    tagline: "Crispy fried coastal snack fish",
    category: "Fish",
    image: "/images/mandeli.webp",
    images: ["/images/mandeli.webp", "/images/Khapri-1.jpg"],
    description: "Mandeli are small, silver anchovies loved along the Konkan coast. When fried in a crispy semolina batter they become an irresistible snack or side dish.",
    freshnessInfo: "Daily catch from Mumbai coastal waters. Cleaned and delivered fresh.",
    stockStatus: "In Stock",
    weightOptions: [
      { weight: "250g", price: 129, originalPrice: 160 },
      { weight: "500g", price: 239, originalPrice: 290 }
    ],
    allowedCuts: ["whole"]
  },
  {
    id: "octopus",
    name: "Fresh Octopus",
    tagline: "Tender, char-grilled delicacy",
    category: "Seafood",
    image: "/images/octopus.png",
    images: ["/images/octopus.png", "/images/lobster.jpg"],
    description: "Fresh octopus with a surprisingly tender texture when slow-cooked or pressure-cooked. Exceptional when marinated with lemon and char-grilled or stir-fried.",
    freshnessInfo: "Deep-sea harvested and cleaned immediately. Limited seasonal availability.",
    stockStatus: "Low Stock",
    weightOptions: [
      { weight: "500g", price: 499, originalPrice: 599 },
      { weight: "1kg", price: 949, originalPrice: 1100 }
    ],
    allowedCuts: ["whole"]
  }
];

export const MOCK_SAVED_ADDRESSES = [
  {
    id: "addr-1",
    tag: "Home",
    fullName: "Rohan Sharma",
    flat: "Flat 402, Sea Breeze Heights",
    area: "Ulwe Sector 17",
    city: "Navi Mumbai",
    pincode: "410206",
    phone: "9876543210",
    isDefault: true
  },
  {
    id: "addr-2",
    tag: "Office",
    fullName: "Rohan Sharma",
    flat: "Tech Hub, 3rd Floor, Unit 3B",
    area: "Ulwe Sector 8",
    city: "Navi Mumbai",
    pincode: "410206",
    phone: "9876543211",
    isDefault: false
  }
];

export const MOCK_ORDERS = [
  {
    id: "NZ-98421-26",
    date: "09 June 2026",
    status: "Delivered",
    items: [
      { name: "Silver Pomfret", weight: "500g", cut: "Steak Cut", quantity: 1, price: 919 }
    ],
    total: 958, // including delivery charge
    deliveryAddress: "Flat 402, Sea Breeze Heights, Ulwe Sector 17"
  },
  {
    id: "NZ-98210-26",
    date: "28 May 2026",
    status: "Delivered",
    items: [
      { name: "Tiger Prawns", weight: "500g", cut: "Whole Fish", quantity: 2, price: 1098 },
      { name: "Bombil (Bombay Duck)", weight: "500g", cut: "Fillet", quantity: 1, price: 269 }
    ],
    total: 1417,
    deliveryAddress: "Flat 402, Sea Breeze Heights, Ulwe Sector 17"
  }
];

export const WHY_NONZO = [
  {
    title: "100% Preservative Free",
    description: "We use only natural ice to maintain freshness. Absolutely no chemical additives or formaldehyde.",
    iconSvg: `<svg class="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`
  },
  {
    title: "Cold Chain Controlled",
    description: "From catch to your kitchen, our seafood is strictly maintained between 0°C and 4°C to seal in nutrients.",
    iconSvg: `<svg class="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
  },
  {
    title: "Artisanal & Traceable",
    description: "Sourced daily from sustainable coastal waters. Know exactly where your fish was landed.",
    iconSvg: `<svg class="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
  }
];
