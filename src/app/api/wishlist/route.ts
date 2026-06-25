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

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!wishlist) {
      await prisma.wishlist.create({
        data: { userId: user.id }
      });
      return NextResponse.json({ success: true, items: [] });
    }

    return NextResponse.json({ success: true, items: wishlist.items });
  } catch (error: any) {
    console.error("GET /api/wishlist Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve wishlist." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const { productId, action } = await request.json();

    if (!productId || !action || !["ADD_TO_WISHLIST", "REMOVE_FROM_WISHLIST"].includes(action)) {
      return NextResponse.json({ error: "Missing or invalid parameters (productId, action)." }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await prisma.$transaction(async (tx) => {
      // 1. Find or create Wishlist
      let dbWishlist = await tx.wishlist.findUnique({
        where: { userId: user.id }
      });

      if (!dbWishlist) {
        dbWishlist = await tx.wishlist.create({
          data: { userId: user.id }
        });
      }

      if (action === "ADD_TO_WISHLIST") {
        // Upsert wishlist item
        await tx.wishlistItem.upsert({
          where: {
            wishlistId_productId: {
              wishlistId: dbWishlist.id,
              productId
            }
          },
          update: {},
          create: {
            wishlistId: dbWishlist.id,
            productId
          }
        });
      } else {
        // Remove wishlist item
        await tx.wishlistItem.deleteMany({
          where: {
            wishlistId: dbWishlist.id,
            productId
          }
        });
      }

      // 2. Log UserActivity
      await tx.userActivity.create({
        data: {
          userId: user.id,
          activityType: action,
          referenceId: productId,
          metadata: { productId },
          ipAddress,
          userAgent,
          createdAt: getISTDate()
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/wishlist Error:", error);
    return NextResponse.json({ error: error.message || "Failed to edit wishlist." }, { status: 500 });
  }
}
