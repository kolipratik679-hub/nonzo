import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getISTDate, formatToIST, formatToISTDate } from "@/lib/date";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated. Please log in." }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        statusHistory: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Customer can only view their own order
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to view this order." }, { status: 403 });
    }

    // Format fields with proper India Time
    const formattedOrder = {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      promoCode: order.promoCode,
      promoDiscount: order.promoDiscount,
      total: order.total,
      deliveryAddressSnapshot: order.deliveryAddressSnapshot,
      deliveryDate: order.deliveryDate,
      deliverySlot: order.deliverySlot,
      notes: order.notes,
      cancelledBy: order.cancelledBy,
      cancelReason: order.cancelReason,
      cancelledAt: order.cancelledAt ? formatToIST(order.cancelledAt) : null,
      deliveredAt: order.deliveredAt ? formatToIST(order.deliveredAt) : null,
      createdAt: formatToIST(order.createdAt),
      updatedAt: formatToIST(order.updatedAt),
      paymentMethod: order.payments[0]?.method === "RAZORPAY" ? "Online Payment (Razorpay)" : "Cash On Delivery",
      paymentStatus: order.payments[0]?.status || "PENDING",
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        weight: item.weight,
        cutTypeId: item.cutTypeId,
        cutName: item.cutName,
        cutExtraCharge: item.cutExtraCharge,
        unitPrice: item.unitPrice,
        unitOriginalPrice: item.unitOriginalPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        specialInstructions: item.specialInstructions
      })),
      statusHistory: order.statusHistory.map((hist) => ({
        id: hist.id,
        fromStatus: hist.fromStatus,
        toStatus: hist.toStatus,
        changedBy: hist.changedBy,
        note: hist.note,
        date: formatToISTDate(hist.createdAt),
        time: formatToIST(hist.createdAt).split(", ")[1] || formatToIST(hist.createdAt)
      }))
    };

    return NextResponse.json({ success: true, order: formattedOrder });
  } catch (error: any) {
    console.error("GET /api/orders/[id] Error:", error);
    return NextResponse.json({ error: "Failed to fetch order details." }, { status: 500 });
  }
}
