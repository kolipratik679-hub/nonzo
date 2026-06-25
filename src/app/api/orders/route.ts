import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getISTDate, getISTParts, formatToISTDate } from "@/lib/date";

// Promo codes definition
const PROMO_CODES: Record<string, { minOrder: number; type: "flat" | "pct" | "freeship"; value: number }> = {
  NONZO10:    { minOrder: 0,   type: "pct",     value: 10  },
  NONZO50:    { minOrder: 399, type: "flat",    value: 50  },
  FREESHIP:   { minOrder: 200, type: "freeship",value: 0   },
  EATBETTER:  { minOrder: 599, type: "pct",     value: 15  },
};

// Weight Parsing Helpers
const parseWeightToGrams = (w: string): number => {
  const val = parseFloat(w);
  if (w.toLowerCase().includes("kg")) {
    return val * 1000;
  }
  return val;
};

// Price Calculations matching frontend
const getWeightPrice = (product: any, weight: string): number => {
  const exactMatch = product.weightOptions.find((o: any) => o.weight === weight);
  if (exactMatch) return exactMatch.price;

  const baseOpt = product.weightOptions[0];
  if (!baseOpt) return 0;

  const baseWeightVal = parseWeightToGrams(baseOpt.weight);
  const targetWeightVal = parseWeightToGrams(weight);

  const ratio = targetWeightVal / baseWeightVal;
  
  let scaleModifier = 1.0;
  if (ratio > 1) scaleModifier = 0.92; // 8% bulk discount
  if (ratio < 1) scaleModifier = 1.05; // 5% small portion mark-up

  return Math.round(baseOpt.price * ratio * scaleModifier);
};

const getWeightOriginalPrice = (product: any, weight: string): number => {
  const exactMatch = product.weightOptions.find((o: any) => o.weight === weight);
  if (exactMatch) return exactMatch.originalPrice;

  return Math.round(getWeightPrice(product, weight) * 1.2);
};

// Order ID generation
function generateOrderId(): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear().toString().slice(-2);
  return `NZ-${random}-${year}`;
}

// Delivery Date calculations
const getDeliveryDateActual = (deliveryDateStr: string): Date => {
  const istToday = getISTParts(new Date());
  // Construct Date in UTC representing midnight of today in IST
  const date = new Date(Date.UTC(istToday.year, istToday.month - 1, istToday.day, 0, 0, 0));
  
  if (deliveryDateStr === "Tomorrow") {
    date.setUTCDate(date.getUTCDate() + 1);
  } else if (deliveryDateStr === "Day +2") {
    date.setUTCDate(date.getUTCDate() + 2);
  } else if (deliveryDateStr === "Day +3") {
    date.setUTCDate(date.getUTCDate() + 3);
  }
  return date;
};

// Auth helper
async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) return null;

    let decoded = accessToken ? await verifyToken(accessToken) : null;
    if (!decoded && refreshToken) {
      decoded = await verifyToken(refreshToken);
    }

    if (!decoded) return null;

    const sessionId = decoded.sessionId as string;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.expiresAt < getISTDate()) return null;
    if (session.user.isBlocked) return null;

    return session.user;
  } catch (error) {
    console.error("Error in getAuthenticatedUser:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate User
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated. Please log in." }, { status: 401 });
    }

    // 2. Parse Body
    const {
      cart,
      address,
      deliveryDate,
      deliverySlot,
      paymentMethod,
      promoCode,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = await request.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0 || !address || !deliveryDate || !deliverySlot || !paymentMethod) {
      return NextResponse.json({ error: "Missing required order parameters." }, { status: 400 });
    }

    // 3. Retrieve Delivery Settings from DB (Singleton)
    const deliverySettings = await prisma.deliverySettings.findUnique({
      where: { id: "default" }
    });
    const freeDeliveryThreshold = deliverySettings?.freeDeliveryThreshold ?? 699;
    const deliveryCharge = deliverySettings?.deliveryCharge ?? 39;

    // 4. Recalculate Totals Server-side
    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of cart) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { weightOptions: true }
      });

      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      // Resolve cut type
      let extraCharge = 0;
      let cutName = "Whole Fish";
      if (item.cutTypeId && item.cutTypeId !== "whole") {
        const dbCut = await prisma.cutType.findUnique({
          where: { id: item.cutTypeId }
        });
        if (!dbCut) {
          return NextResponse.json({ error: `Cut type not found: ${item.cutTypeId}` }, { status: 400 });
        }
        extraCharge = dbCut.extraCharge;
        cutName = dbCut.name;
      }

      const weightPrice = getWeightPrice(dbProduct, item.weight);
      const weightOriginalPrice = getWeightOriginalPrice(dbProduct, item.weight);

      const unitPrice = weightPrice + extraCharge;
      const unitOriginalPrice = weightOriginalPrice + extraCharge;
      const lineTotal = unitPrice * item.quantity;

      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        productImage: dbProduct.mainImage,
        weight: item.weight,
        cutTypeId: item.cutTypeId || "whole",
        cutName,
        cutExtraCharge: extraCharge,
        unitPrice,
        unitOriginalPrice,
        quantity: item.quantity,
        lineTotal,
        specialInstructions: item.specialInstructions || ""
      });
    }

    // Calculate delivery fee
    const isFreeDelivery = calculatedSubtotal >= freeDeliveryThreshold || (promoCode && promoCode.toUpperCase() === "FREESHIP");
    const deliveryFee = calculatedSubtotal === 0 ? 0 : isFreeDelivery ? 0 : deliveryCharge;

    // Calculate promo discount
    let promoDiscount = 0;
    if (promoCode) {
      const promo = PROMO_CODES[promoCode.toUpperCase()];
      if (promo) {
        if (calculatedSubtotal >= promo.minOrder) {
          if (promo.type === "flat") {
            promoDiscount = promo.value;
          } else if (promo.type === "pct") {
            promoDiscount = Math.round((calculatedSubtotal * promo.value) / 100);
          } else if (promo.type === "freeship") {
            promoDiscount = deliveryFee;
          }
        }
      }
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal + deliveryFee - promoDiscount);

    // 5. Razorpay Signature Verification
    if (paymentMethod === "online") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: "Missing Razorpay credentials." }, { status: 400 });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET || "LvT46te4fRgELq7MvjDX53s3";
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        // Log PAYMENT_FAILED
        const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const userAgent = request.headers.get("user-agent") || "unknown";
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            activityType: "PAYMENT_FAILED",
            metadata: { error: "Razorpay signature verification failed", razorpayOrderId, razorpayPaymentId },
            ipAddress,
            userAgent,
            createdAt: getISTDate()
          }
        });

        return NextResponse.json({ error: "Razorpay signature verification failed." }, { status: 400 });
      }
    }

    // 6. Prisma Transaction Write
    const confirmedOrder = await prisma.$transaction(async (tx) => {
      // Find or create address in DB
      let dbAddress = await tx.address.findFirst({
        where: {
          userId: user.id,
          flat: address.flat,
          area: address.area,
          pincode: address.pincode,
        }
      });

      if (!dbAddress) {
        dbAddress = await tx.address.create({
          data: {
            userId: user.id,
            tag: address.tag || "Home",
            fullName: address.fullName,
            flat: address.flat,
            area: address.area,
            city: address.city || "Navi Mumbai",
            pincode: address.pincode || "410206",
            phone: address.phone,
            landmark: address.landmark || null,
          }
        });
      }

      // Generate unique order ID
      let orderId = generateOrderId();
      let exists = await tx.order.findUnique({ where: { id: orderId } });
      while (exists) {
        orderId = generateOrderId();
        exists = await tx.order.findUnique({ where: { id: orderId } });
      }

      const addressSnapshot = `${address.fullName} | ${address.flat}, ${address.area}, ${address.city || "Navi Mumbai"} - ${address.pincode || "410206"} (Tel: ${address.phone})`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          userId: user.id,
          status: "PENDING",
          subtotal: calculatedSubtotal,
          deliveryFee,
          promoCode: promoCode || null,
          promoDiscount,
          total: calculatedTotal,
          deliveryAddressId: dbAddress.id,
          deliveryAddressSnapshot: addressSnapshot,
          deliveryDate,
          deliveryDateActual: getDeliveryDateActual(deliveryDate),
          deliverySlot,
          notes: address.landmark || "",
        }
      });

      // Create Order Status History for PENDING
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: "PENDING",
          changedBy: "CUSTOMER",
          note: "Order placed successfully.",
        }
      });

      // Create Order Items
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            weight: item.weight,
            cutTypeId: item.cutTypeId === "whole" ? null : item.cutTypeId,
            cutName: item.cutName,
            cutExtraCharge: item.cutExtraCharge,
            unitPrice: item.unitPrice,
            unitOriginalPrice: item.unitOriginalPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            specialInstructions: item.specialInstructions || null
          }
        });
      }

      // Create Payment Record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod === "online" ? "RAZORPAY" : "COD",
          status: paymentMethod === "online" ? "PAID" : "PENDING",
          amount: calculatedTotal,
          currency: "INR",
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
          razorpaySignature: razorpaySignature || null,
          paidAt: paymentMethod === "online" ? getISTDate() : null,
        }
      });

      // Create User Activity
      await tx.userActivity.create({
        data: {
          userId: user.id,
          activityType: "PLACE_ORDER",
          referenceId: newOrder.id,
          metadata: { total: calculatedTotal, paymentMethod },
        }
      });

      // Create PAYMENT_SUCCESS activity if online payment
      if (paymentMethod === "online") {
        await tx.userActivity.create({
          data: {
            userId: user.id,
            activityType: "PAYMENT_SUCCESS",
            referenceId: newOrder.id,
            metadata: { total: calculatedTotal, razorpayPaymentId },
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: confirmedOrder.id });

  } catch (error: any) {
    console.error("Order Creation Flow API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to persist order. Transaction rolled back." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated. Please log in." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedOrders = orders.map((ord) => ({
      id: ord.id,
      date: formatToISTDate(ord.createdAt),
      status: ord.status,
      total: ord.total,
      deliveryAddress: ord.deliveryAddressSnapshot,
      cancelReason: ord.cancelReason || undefined,
      cancelledAt: ord.cancelledAt ? ord.cancelledAt.toISOString() : undefined,
      deliveredAt: ord.deliveredAt ? ord.deliveredAt.toISOString() : undefined,
      paymentMethod: ord.payments[0]?.method === "RAZORPAY" ? "Online Payment (Razorpay)" : "Cash On Delivery",
      paymentStatus: ord.payments[0]?.status || "PENDING",
      items: ord.items.map((item) => ({
        productId: item.productId,
        cutTypeId: item.cutTypeId || undefined,
        name: item.productName,
        weight: item.weight,
        cut: item.cutName,
        quantity: item.quantity,
        price: item.unitPrice,
        specialInstructions: item.specialInstructions || undefined
      }))
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error("GET /api/orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
