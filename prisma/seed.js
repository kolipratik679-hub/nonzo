const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

async function main() {
  console.log('Starting seed process...');

  const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'hello brother',
    database: 'nonzo',
    connectionLimit: 5,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Clean existing records in correct dependency order
    console.log('Cleaning existing records...');
    await prisma.businessSettings.deleteMany({});
    await prisma.deliveryZone.deleteMany({});
    await prisma.deliverySlot.deleteMany({});
    await prisma.deliverySettings.deleteMany({});
    await prisma.productCutType.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.weightOption.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.productReview.deleteMany({});
    await prisma.userActivity.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.inventoryBatch.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.cutType.deleteMany({});
    await prisma.adminSession.deleteMany({});
    await prisma.admin.deleteMany({});

    // 2. Seed Admin User
    console.log('Seeding admin...');
    const admin = await prisma.admin.create({
      data: {
        id: 'admin-super',
        name: 'Super Admin',
        email: 'admin@nonzo.in',
        passwordHash: '$2b$10$EPf91oA4pws1l6LCOu/t1eC4C3c5DqA1K4vA5h2yN9H4FzY.tG.6m', // admin123
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    // 3. Seed Delivery Settings (Singleton)
    console.log('Seeding delivery settings...');
    const deliverySettings = await prisma.deliverySettings.create({
      data: {
        id: 'default',
        sameDayDelivery: false,
        freeDeliveryThreshold: 699,
        deliveryCharge: 39,
      },
    });

    // 4. Seed Business Settings (Singleton with actual NONZO details)
    console.log('Seeding business settings...');
    await prisma.businessSettings.create({
      data: {
        id: 'default',
        businessName: 'NONZO',
        companyName: 'NONZO Retail Pvt. Ltd.',
        address: 'Sai Sagar Apartment, Plot Number 349, Shop Number 1 & 2',
        sector: '24 Ulwe',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '410206',
        primaryMobile: '7788996549',
        whatsAppNumber: '7788996549',
        supportNumber: '7788996454',
        supportEmail: 'support@nonzo.in',
        businessHours: '8:00 AM - 9:00 PM',
        instagramUrl: 'https://instagram.com/nonzo',
        facebookUrl: 'https://facebook.com/nonzo',
        youtubeUrl: 'https://youtube.com/nonzo',
        whatsappLink: 'https://wa.me/917788996549',
        googleMapsLink: 'https://maps.google.com/?q=Sai+Sagar+Apartment+Sector+24+Ulwe',
        logoUrl: '/NONZO-LOGO.png',
        faviconUrl: '/favicon.ico',
        currency: 'INR',
        currencySymbol: '₹',
        minimumOrderAmount: 0,
        businessTagline: 'Colossal Freshness Delivered',

        // Future Admin Settings Defaults
        otpExpiryMinutes: 5,
        maxOtpAttempts: 5,
        referralRewardReferrer: 50,
        referralRewardReferee: 50,
        loyaltyPointsEarnRate: 0.1,
        codEnabled: true,
        onlinePaymentEnabled: true,

        deliverySettingsId: deliverySettings.id,
      },
    });

    // 5. Seed Delivery Zones (Ulwe Sectors)
    console.log('Seeding delivery zones...');
    const zones = [
      { name: 'Ulwe Sector 5', pincode: '410206', deliveryCharge: 39, minOrderAmount: 0 },
      { name: 'Ulwe Sector 8', pincode: '410206', deliveryCharge: 39, minOrderAmount: 0 },
      { name: 'Ulwe Sector 17', pincode: '410206', deliveryCharge: 39, minOrderAmount: 0 },
      { name: 'Ulwe Sector 24', pincode: '410206', deliveryCharge: 39, minOrderAmount: 0 },
    ];
    for (const z of zones) {
      await prisma.deliveryZone.create({ data: z });
    }

    // 6. Seed Delivery Slots (updated slots)
    console.log('Seeding delivery slots...');
    const slots = [
      { id: 'slot-1', timeWindow: '8 AM - 10 AM', isEnabled: true, maxOrders: 15, sortOrder: 1 },
      { id: 'slot-2', timeWindow: '10 AM - 12 PM', isEnabled: true, maxOrders: 15, sortOrder: 2 },
      { id: 'slot-3', timeWindow: '5 PM - 9 PM', isEnabled: true, maxOrders: 15, sortOrder: 3 },
    ];
    for (const s of slots) {
      await prisma.deliverySlot.create({ data: s });
    }

    // 7. Seed Categories
    console.log('Seeding categories...');
    const categoriesData = [
      { id: 'fish', name: 'Fish', iconName: 'Fish', image: '/images/categories/fish.png' },
      { id: 'prawns', name: 'Prawns', iconName: 'Waves', image: '/images/categories/prawns.png' },
      { id: 'crabs', name: 'Crabs', iconName: 'Shell', image: '/images/categories/crab.png' },
      { id: 'shellfish', name: 'Shellfish', iconName: 'Anchor', image: '/images/categories/shellfish.png' },
      { id: 'seafood', name: 'Seafood', iconName: 'Compass', image: '/images/categories/seafoods.png' },
    ];
    for (const c of categoriesData) {
      await prisma.category.create({ data: c });
    }

    // 8. Seed Cut Types
    console.log('Seeding cut types...');
    const cutTypesData = [
      { id: 'whole', name: 'Whole Fish', description: 'Cleaned and gutted, tail and head intact.', extraCharge: 0, image: '/images/cuts/whole-cut-fish.png', isDeletable: false, sortOrder: 1 },
      { id: 'curry-cut', name: 'Curry Cut', description: 'Medium-sized bone-in pieces, perfect for traditional curries.', extraCharge: 15, image: '/images/cuts/curry-cut-fish.png', sortOrder: 2 },
      { id: 'steak-cut', name: 'Steak Cut', description: 'Clean, thick cross-section slices of the fish center.', extraCharge: 20, image: '/images/cuts/steak-cut-fish.png', sortOrder: 3 },
      { id: 'fillet', name: 'Fillet', description: 'Prime boneless sides cut along the spine, skin-on or skinless.', extraCharge: 40, image: '/images/cuts/fillet-cut-fish.png', sortOrder: 4 },
      { id: 'boneless', name: 'Boneless Cubes', description: 'Completely boneless and skinless premium cubes of fish meat.', extraCharge: 50, image: '/images/cuts/cube-cut-prawns.png', sortOrder: 5 },
      { id: 'special-cut', name: 'Special Cut', description: 'Custom specialty cut requested by customer.', extraCharge: 30, image: '/images/cuts/clean-blue-crab.png', sortOrder: 6 },
    ];
    for (const ct of cutTypesData) {
      await prisma.cutType.create({ data: ct });
    }

    // 9. Seed Products & Variant Weights & Cut Junctions
    console.log('Seeding products...');
    const productsData = [
      {
        id: "tiger-prawns",
        name: "Tiger Prawns",
        tagline: "Colossal, juicy freshwater prawns",
        categoryId: "prawns",
        mainImage: "/images/TIGER PRAWNS.jpg",
        galleryImages: ["/images/TIGER PRAWNS.jpg", "/images/large prawns.jpg", "/images/small prawns.webp"],
        description: "These premium Tiger Prawns are known for their sweet, firm meat and spectacular striping. Freshly caught and immediately chilled, they are perfect for butter-garlic fry or grilling.",
        freshnessInfo: "Caught 6 hours ago off the coast of Alibaug. Cleaned, de-veined, and kept at 0-4°C.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "250g", price: 299, originalPrice: 350, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 549, originalPrice: 650, weightInGrams: 500, sortOrder: 2 },
          { weight: "1kg", price: 999, originalPrice: 1200, weightInGrams: 1000, sortOrder: 3 }
        ],
        allowedCuts: ["whole", "boneless", "special-cut"]
      },
      {
        id: "black-pomfret",
        name: "Black Pomfret",
        tagline: "Richly flavored local delicacy",
        categoryId: "fish",
        mainImage: "/images/black pomfret.jpg",
        galleryImages: ["/images/black pomfret.jpg", "/images/silver pompret.jpeg"],
        description: "Black Pomfret (Halwa) is a coastal favorite in Maharashtra. With a distinct rich flavor, medium texture, and minimal bones, it holds together beautifully in pan-fries and curries.",
        freshnessInfo: "Sourced directly from Sasoon Dock daily. Zero preservatives.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "250g", price: 349, originalPrice: 399, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 649, originalPrice: 750, weightInGrams: 500, sortOrder: 2 },
          { weight: "1kg", price: 1199, originalPrice: 1400, weightInGrams: 1000, sortOrder: 3 }
        ],
        allowedCuts: ["whole", "curry-cut", "steak-cut", "fillet", "special-cut"]
      },
      {
        id: "silver-pomfret",
        name: "Silver Pomfret",
        tagline: "Ultra-premium, buttery, melting texture",
        categoryId: "fish",
        mainImage: "/images/silver pompret.jpeg",
        galleryImages: ["/images/silver pompret.jpeg", "/images/black pomfret.jpg"],
        description: "The crown jewel of Indian seafood. Silver Pomfret is celebrated for its incredibly delicate, white meat and buttery taste. Ideal for tandoori baking or classic rava frying.",
        freshnessInfo: "Fresh caught via hook-and-line. Delivered within 12 hours of catch.",
        stockStatus: "LOW_STOCK",
        weightOptions: [
          { weight: "250g", price: 499, originalPrice: 599, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 899, originalPrice: 1100, weightInGrams: 500, sortOrder: 2 },
          { weight: "1kg", price: 1699, originalPrice: 1999, weightInGrams: 1000, sortOrder: 3 }
        ],
        allowedCuts: ["whole", "steak-cut", "fillet", "special-cut"]
      },
      {
        id: "bombil",
        name: "Bombil (Bombay Duck)",
        tagline: "Crispy fry specialist of Mumbai",
        categoryId: "fish",
        mainImage: "/images/Bombil-main.jpg",
        galleryImages: ["/images/Bombil-main.jpg", "/images/mandeli.webp", "/images/Khapri-1.jpg"],
        description: "Bombay Duck (Bombil) is famous for its high moisture content and delicate texture. When pressed and coated with semolina (rava), it transforms into the crispiest, melting-soft treat.",
        freshnessInfo: "Direct from Versova dock. Cleaned, flattened, and moisture-controlled.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "250g", price: 149, originalPrice: 180, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 269, originalPrice: 320, weightInGrams: 500, sortOrder: 2 },
          { weight: "1kg", price: 499, originalPrice: 600, weightInGrams: 1000, sortOrder: 3 }
        ],
        allowedCuts: ["whole", "fillet", "special-cut"]
      },
      {
        id: "rawas",
        name: "Rawas (Indian Salmon)",
        tagline: "Rich in Omega-3, meaty steak cut",
        categoryId: "fish",
        mainImage: "/images/ravas - indian salmon.jpg",
        galleryImages: ["/images/ravas - indian salmon.jpg", "/images/hilsa.jpg", "/images/baramumdi - asian seabass.jpg"],
        description: "Rawas is one of the most popular fish in India. It is highly nutritious, packed with Omega-3 fatty acids, and has a pinkish-white firm flesh with a mild flavor.",
        freshnessInfo: "Caught off the Konkan coast. Hand-selected for weight and oil content.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "250g", price: 399, originalPrice: 450, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 749, originalPrice: 850, weightInGrams: 500, sortOrder: 2 },
          { weight: "1kg", price: 1399, originalPrice: 1600, weightInGrams: 1000, sortOrder: 3 }
        ],
        allowedCuts: ["curry-cut", "steak-cut", "fillet", "boneless", "special-cut"]
      },
      {
        id: "lobster",
        name: "Rock Lobster",
        tagline: "Indulgent, sweet tail meat",
        categoryId: "seafood",
        mainImage: "/images/lobster.jpg",
        galleryImages: ["/images/lobster.jpg", "/images/octopus.png"],
        description: "Premium cold-chain harvested Rock Lobster. Rich, sweet meat in the tail makes it a luxury dining experience. Ideal for baking with cheese or grilling with lemon butter.",
        freshnessInfo: "Live-chilled immediately at harvest. Extremely high shell-to-meat ratio.",
        stockStatus: "LOW_STOCK",
        weightOptions: [
          { weight: "500g", price: 1299, originalPrice: 1500, weightInGrams: 500, sortOrder: 1 },
          { weight: "1kg", price: 2499, originalPrice: 2900, weightInGrams: 1000, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "special-cut"]
      },
      {
        id: "mud-crab",
        name: "Premium Mud Crab",
        tagline: "Huge claws with sweet, dense meat",
        categoryId: "crabs",
        mainImage: "/images/mud crab.jpg",
        galleryImages: ["/images/mud crab.jpg", "/images/sea mud crab.jpg", "/images/deep sea blue crab.jpg"],
        description: "Mud Crabs are harvested from estuarine mangroves. They are prized for their heavy, meat-filled claws and rich, savory roe. Best cooked in thick spicy masala or Singapore style.",
        freshnessInfo: "Harvested live from mangrove farms in coastal Maharashtra.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "500g", price: 699, originalPrice: 800, weightInGrams: 500, sortOrder: 1 },
          { weight: "1kg", price: 1299, originalPrice: 1500, weightInGrams: 1000, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "special-cut"]
      },
      {
        id: "sea-crab",
        name: "Blue Sea Crab",
        tagline: "Delicate, sweet coastal blue crab",
        categoryId: "crabs",
        mainImage: "/images/sea crab.jpg",
        galleryImages: ["/images/sea crab.jpg", "/images/deep sea blue crab.jpg", "/images/sea mud crab.jpg"],
        description: "Blue Sea Crabs are saltwater crabs with a sweeter, lighter taste profile compared to mud crabs. They make an exceptional traditional Konkani crab curry.",
        freshnessInfo: "Caught daily by local artisanal fishermen.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "500g", price: 449, originalPrice: 520, weightInGrams: 500, sortOrder: 1 },
          { weight: "1kg", price: 849, originalPrice: 999, weightInGrams: 1000, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "special-cut"]
      },
      {
        id: "barramundi",
        name: "Barramundi (Asian Seabass / Jitada)",
        tagline: "Flaky, white meat, extremely versatile",
        categoryId: "fish",
        mainImage: "/images/baramumdi - asian seabass.jpg",
        galleryImages: ["/images/baramumdi - asian seabass.jpg", "/images/big-grouper.webp", "/images/grouper.jpg"],
        description: "Known locally as Jitada, Barramundi is celebrated for its clean, mild taste and large, moist flakes. Excellent for steaming, baking, or frying.",
        freshnessInfo: "Grown in pure brackish waters, harvested at dawn.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "250g", price: 249, originalPrice: 299, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 469, originalPrice: 550, weightInGrams: 500, sortOrder: 2 },
          { weight: "1kg", price: 899, originalPrice: 1050, weightInGrams: 1000, sortOrder: 3 }
        ],
        allowedCuts: ["whole", "curry-cut", "fillet", "boneless", "special-cut"]
      },
      {
        id: "bangda",
        name: "Bangda (Mackerel)",
        tagline: "Healthy, oily fish with robust flavor",
        categoryId: "fish",
        mainImage: "/images/BANGDA.jpeg",
        galleryImages: ["/images/BANGDA.jpeg", "/images/mandeli.webp"],
        description: "Bangda is a staple along the Konkan coast. Loaded with Omega-3 and proteins, its strong flavor pairs wonderfully with spicy, acidic, and coconut-based marinades.",
        freshnessInfo: "Landed at Sasoon dock, flash-iced within minutes.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "500g", price: 189, originalPrice: 220, weightInGrams: 500, sortOrder: 1 },
          { weight: "1kg", price: 349, originalPrice: 420, weightInGrams: 1000, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "curry-cut", "special-cut"]
      },
      {
        id: "tuna",
        name: "Yellowfin Tuna",
        tagline: "Meaty, deep-red sashimi-grade steaks",
        categoryId: "fish",
        mainImage: "/images/tuna.webp",
        galleryImages: ["/images/tuna.webp", "/images/hilsa.jpg", "/images/ravas - indian salmon.jpg"],
        description: "Meaty Yellowfin Tuna has a firm texture and deep flavor. Perfect for quick searing on a hot pan or grill, keeping the center tender and moist.",
        freshnessInfo: "Deep-sea caught. Cleaned and temperature-locked at -2°C.",
        stockStatus: "LOW_STOCK",
        weightOptions: [
          { weight: "250g", price: 299, originalPrice: 350, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 569, originalPrice: 680, weightInGrams: 500, sortOrder: 2 },
          { weight: "1kg", price: 1099, originalPrice: 1300, weightInGrams: 1000, sortOrder: 3 }
        ],
        allowedCuts: ["steak-cut", "fillet", "boneless", "special-cut"]
      },
      {
        id: "oysters",
        name: "Coastal Rock Oysters",
        tagline: "Fresh, briny, ocean-fresh treats",
        categoryId: "shellfish",
        mainImage: "/images/oyester.jpg",
        galleryImages: ["/images/oyester.jpg"],
        description: "Freshly harvested Coastal Rock Oysters. Known for their distinct mineral-rich, briny flavor. Serve chilled with a squeeze of fresh lemon and a dash of hot sauce.",
        freshnessInfo: "Harvested from clean shellfish beds under strict water quality monitoring.",
        stockStatus: "OUT_OF_STOCK",
        weightOptions: [
          { weight: "250g", price: 399, originalPrice: 450, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 749, originalPrice: 899, weightInGrams: 500, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "special-cut"]
      },
      {
        id: "hilsa",
        name: "Hilsa (Ilish)",
        tagline: "Bengal's prized silver fish, omega-rich",
        categoryId: "fish",
        mainImage: "/images/hilsa.jpg",
        galleryImages: ["/images/hilsa.jpg", "/images/ravas - indian salmon.jpg"],
        description: "Hilsa, known as the King of Fish, is prized across Bengal and Bangladesh for its rich, oily flavour and melt-in-mouth texture. A rare seasonal delicacy.",
        freshnessInfo: "River-caught and flash-chilled within 4 hours. Available in limited quantities.",
        stockStatus: "LOW_STOCK",
        weightOptions: [
          { weight: "500g", price: 699, originalPrice: 850, weightInGrams: 500, sortOrder: 1 },
          { weight: "1kg", price: 1299, originalPrice: 1600, weightInGrams: 1000, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "curry-cut", "steak-cut", "special-cut"]
      },
      {
        id: "sole-fish",
        name: "Sole Fish (Lepa)",
        tagline: "Delicate flatfish, perfect for light fry",
        categoryId: "fish",
        mainImage: "/images/sole fish - lepa.jpg",
        galleryImages: ["/images/sole fish - lepa.jpg", "/images/Khapri-1.jpg"],
        description: "Sole fish, locally called Lepa, is a flat, white-fleshed fish with a mild, clean flavour. Excellent for a quick shallow fry or a light coastal curry.",
        freshnessInfo: "Caught from shallow coastal waters. Cleaned and chilled same day.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "250g", price: 199, originalPrice: 249, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 379, originalPrice: 449, weightInGrams: 500, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "fillet", "special-cut"]
      },
      {
        id: "mandeli",
        name: "Mandeli (Anchovies)",
        tagline: "Crispy fried coastal snack fish",
        categoryId: "fish",
        mainImage: "/images/mandeli.webp",
        galleryImages: ["/images/mandeli.webp", "/images/Khapri-1.jpg"],
        description: "Mandeli are small, silver anchovies loved along the Konkan coast. When fried in a crispy semolina batter they become an irresistible snack or side dish.",
        freshnessInfo: "Daily catch from Mumbai coastal waters. Cleaned and delivered fresh.",
        stockStatus: "IN_STOCK",
        weightOptions: [
          { weight: "250g", price: 129, originalPrice: 160, weightInGrams: 250, sortOrder: 1 },
          { weight: "500g", price: 239, originalPrice: 290, weightInGrams: 500, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "special-cut"]
      },
      {
        id: "octopus",
        name: "Fresh Octopus",
        tagline: "Tender, char-grilled delicacy",
        categoryId: "seafood",
        mainImage: "/images/octopus.png",
        galleryImages: ["/images/octopus.png", "/images/lobster.jpg"],
        description: "Fresh octopus with a surprisingly tender texture when slow-cooked or pressure-cooked. Exceptional when marinated with lemon and char-grilled or stir-fried.",
        freshnessInfo: "Deep-sea harvested and cleaned immediately. Limited seasonal availability.",
        stockStatus: "LOW_STOCK",
        weightOptions: [
          { weight: "500g", price: 499, originalPrice: 599, weightInGrams: 500, sortOrder: 1 },
          { weight: "1kg", price: 949, originalPrice: 1100, weightInGrams: 1000, sortOrder: 2 }
        ],
        allowedCuts: ["whole", "special-cut"]
      }
    ];

    for (const p of productsData) {
      const { weightOptions, allowedCuts, galleryImages, ...productFields } = p;

      // Create main product
      const product = await prisma.product.create({
        data: productFields
      });

      // Create gallery images
      for (let i = 0; i < galleryImages.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: galleryImages[i],
            sortOrder: i + 1
          }
        });
      }

      // Create weight options
      for (const w of weightOptions) {
        await prisma.weightOption.create({
          data: {
            productId: product.id,
            weight: w.weight,
            weightInGrams: w.weightInGrams,
            price: w.price,
            originalPrice: w.originalPrice,
            sortOrder: w.sortOrder
          }
        });
      }

      // Create cut junctions
      for (const cutId of allowedCuts) {
        await prisma.productCutType.create({
          data: {
            productId: product.id,
            cutTypeId: cutId
          }
        });
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
