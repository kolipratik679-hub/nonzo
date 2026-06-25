import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getISTDate } from "@/lib/date";

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

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const userCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                weightOptions: true
              }
            },
            weightOption: true,
            cutType: true
          }
        }
      }
    });

    if (!userCart) {
      await prisma.cart.create({
        data: { userId: user.id }
      });
      return NextResponse.json({ success: true, cart: [] });
    }

    const formattedItems = userCart.items.map((item) => ({
      id: `${item.productId}-${item.weightOption.weight}-${item.cutTypeId}`,
      name: item.product.name,
      image: item.product.mainImage,
      weight: item.weightOption.weight,
      cutName: item.cutType.name,
      price: item.unitPrice,
      originalPrice: item.unitOriginalPrice,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || "",
      _product: {
        id: item.product.id,
        name: item.product.name,
        tagline: item.product.tagline,
        categoryId: item.product.categoryId,
        mainImage: item.product.mainImage,
        description: item.product.description,
        freshnessInfo: item.product.freshnessInfo,
        stockStatus: item.product.stockStatus,
        averageRating: item.product.averageRating,
        reviewCount: item.product.reviewCount,
        isActive: item.product.isActive,
        isFeatured: item.product.isFeatured,
        sortOrder: item.product.sortOrder,
        metaTitle: item.product.metaTitle,
        metaDescription: item.product.metaDescription,
        createdAt: item.product.createdAt,
        updatedAt: item.product.updatedAt,
        weightOptions: item.product.weightOptions.map((wo) => ({
          id: wo.id,
          productId: wo.productId,
          weight: wo.weight,
          weightInGrams: wo.weightInGrams,
          price: wo.price,
          originalPrice: wo.originalPrice,
          sortOrder: wo.sortOrder
        })),
        allowedCuts: [] // Filled dynamically by context if needed, otherwise empty array is fine
      },
      _cutType: {
        id: item.cutType.id,
        name: item.cutType.name,
        description: item.cutType.description,
        extraCharge: item.cutType.extraCharge,
        image: item.cutType.image,
        status: item.cutType.status,
        isDeletable: item.cutType.isDeletable,
        sortOrder: item.cutType.sortOrder,
        createdAt: item.cutType.createdAt,
        updatedAt: item.cutType.updatedAt
      }
    }));

    return NextResponse.json({ success: true, cart: formattedItems });
  } catch (error: any) {
    console.error("GET /api/cart Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve cart." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const { cart, action, productId } = await request.json();

    if (!Array.isArray(cart)) {
      return NextResponse.json({ error: "Cart payload must be an array." }, { status: 400 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await prisma.$transaction(async (tx) => {
      // 1. Find or create Cart
      let dbCart = await tx.cart.findUnique({
        where: { userId: user.id }
      });

      if (!dbCart) {
        dbCart = await tx.cart.create({
          data: { userId: user.id }
        });
      }

      // 2. Clear old items
      await tx.cartItem.deleteMany({
        where: { cartId: dbCart.id }
      });

      // 3. Insert new items
      for (const item of cart) {
        // Resolve WeightOption in DB
        const weightOpt = await tx.weightOption.findFirst({
          where: {
            productId: item._product.id,
            weight: item.weight
          }
        });

        if (!weightOpt) {
          throw new Error(`Weight option ${item.weight} not found for product ${item._product.id}`);
        }

        // Resolve CutType in DB
        const cutType = await tx.cutType.findUnique({
          where: { id: item._cutType.id }
        });

        if (!cutType) {
          throw new Error(`Cut type ${item._cutType.id} not found`);
        }

        const unitPrice = weightOpt.price + cutType.extraCharge;
        const unitOriginalPrice = weightOpt.originalPrice + cutType.extraCharge;

        await tx.cartItem.create({
          data: {
            cartId: dbCart.id,
            productId: item._product.id,
            weightOptionId: weightOpt.id,
            cutTypeId: cutType.id,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || null,
            unitPrice,
            unitOriginalPrice
          }
        });
      }

      // 4. Log UserActivity if there's an action
      if (action && ["ADD_TO_CART", "REMOVE_FROM_CART"].includes(action)) {
        await tx.userActivity.create({
          data: {
            userId: user.id,
            activityType: action,
            referenceId: productId || null,
            metadata: productId ? { productId } : undefined,
            ipAddress,
            userAgent,
            createdAt: getISTDate()
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/cart Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync cart." }, { status: 500 });
  }
}
