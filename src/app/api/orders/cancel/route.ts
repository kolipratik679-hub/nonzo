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

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated. Please log in." }, { status: 401 });
    }

    const { orderId, reason } = await request.json();
    if (!orderId || !reason) {
      return NextResponse.json({ error: "Order ID and cancellation reason are required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Authorization check: only order owner can cancel
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to cancel this order." }, { status: 403 });
    }

    // Status check
    const allowedStatuses = ["PENDING", "CONFIRMED", "PREPARING"];
    const packedStatuses = ["PACKED", "SHIPPED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"];
    if (!allowedStatuses.includes(order.status)) {
      const errorMessage = packedStatuses.includes(order.status)
        ? "Your order has already been packed. It can no longer be cancelled."
        : `Order cannot be cancelled in status: ${order.status}`;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const now = getISTDate(); // standard UTC date (IST wall clock)

    // Update order status transactionally
    await prisma.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledBy: "CUSTOMER",
          cancelReason: reason,
          cancelledAt: now,
        }
      });

      // 2. Log status history change
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: "CANCELLED",
          changedBy: "CUSTOMER",
          note: reason,
        }
      });

      // 3. Update payment status if there is a payment record
      const onlinePayment = order.payments.find(p => p.method === "RAZORPAY");
      if (onlinePayment) {
        await tx.payment.updateMany({
          where: { orderId },
          data: {
            status: "REFUNDED",
          }
        });
      }

      // 4. Log UserActivity
      await tx.userActivity.create({
        data: {
          userId: user.id,
          activityType: "PLACE_ORDER",
          referenceId: orderId,
          metadata: { action: "CANCEL_ORDER", reason },
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Order Cancellation API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel order. Transaction rolled back." }, { status: 500 });
  }
}
