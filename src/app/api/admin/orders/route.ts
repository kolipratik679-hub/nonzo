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

// GET all orders for admin
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated. Please log in." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: true,
        payments: true,
        statusHistory: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedOrders = orders.map((ord) => ({
      id: ord.id,
      userId: ord.userId,
      userName: ord.user.name,
      userMobile: ord.user.mobile,
      status: ord.status,
      subtotal: ord.subtotal,
      deliveryFee: ord.deliveryFee,
      promoDiscount: ord.promoDiscount,
      total: ord.total,
      deliveryAddressSnapshot: ord.deliveryAddressSnapshot,
      deliveryDate: ord.deliveryDate,
      deliverySlot: ord.deliverySlot,
      notes: ord.notes,
      cancelledBy: ord.cancelledBy,
      cancelReason: ord.cancelReason,
      cancelledAt: ord.cancelledAt ? formatToIST(ord.cancelledAt) : null,
      deliveredAt: ord.deliveredAt ? formatToIST(ord.deliveredAt) : null,
      createdAt: formatToIST(ord.createdAt),
      updatedAt: formatToIST(ord.updatedAt),
      paymentMethod: ord.payments[0]?.method === "RAZORPAY" ? "Online Payment (Razorpay)" : "Cash On Delivery",
      paymentStatus: ord.payments[0]?.status || "PENDING",
      items: ord.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        weight: item.weight,
        cutName: item.cutName,
        quantity: item.quantity,
        price: item.unitPrice,
        specialInstructions: item.specialInstructions
      })),
      statusHistory: ord.statusHistory.map((hist) => ({
        id: hist.id,
        fromStatus: hist.fromStatus,
        toStatus: hist.toStatus,
        changedBy: hist.changedBy,
        note: hist.note,
        date: formatToISTDate(hist.createdAt),
        time: formatToIST(hist.createdAt).split(", ")[1] || formatToIST(hist.createdAt)
      }))
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error("GET /api/admin/orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch admin orders." }, { status: 500 });
  }
}

// POST to update order status or cancel
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated. Please log in." }, { status: 401 });
    }

    const { orderId, action, status, reason } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const now = getISTDate();

    // 1. Handle Admin Cancellation
    if (action === "cancel") {
      if (!reason) {
        return NextResponse.json({ error: "Cancellation reason is required." }, { status: 400 });
      }

      if (order.status === "DELIVERED" || order.status === "CANCELLED") {
        return NextResponse.json({ error: `Cannot cancel order in status: ${order.status}` }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Update Order
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "CANCELLED",
            cancelledBy: "ADMIN",
            cancelReason: reason,
            cancelledAt: now,
          }
        });

        // Insert Status History
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: "CANCELLED",
            changedBy: "ADMIN",
            note: reason,
          }
        });

        // Refund payment if Razorpay
        const onlinePayment = order.payments.find(p => p.method === "RAZORPAY");
        if (onlinePayment) {
          await tx.payment.updateMany({
            where: { orderId },
            data: {
              status: "REFUNDED",
            }
          });
        }
      });

      return NextResponse.json({ success: true, message: "Order cancelled successfully by admin." });
    }

    // 2. Handle Sequential Status Transition
    if (status) {
      // Sequence check: PENDING -> CONFIRMED -> PREPARING -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED
      const validSequence: Record<string, string> = {
        PENDING: "CONFIRMED",
        CONFIRMED: "PREPARING",
        PREPARING: "PACKED",
        PACKED: "OUT_FOR_DELIVERY",
        OUT_FOR_DELIVERY: "DELIVERED"
      };

      const expectedNext = validSequence[order.status];
      if (!expectedNext || expectedNext !== status) {
        return NextResponse.json({
          error: `Invalid status transition. Cannot transition from '${order.status}' directly to '${status}'. Expected next status is '${expectedNext || "None"}'.`
        }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Update Order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: status,
            deliveredAt: status === "DELIVERED" ? now : order.deliveredAt,
          }
        });

        // Insert Status History
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: status,
            changedBy: "ADMIN",
            note: `Status updated by Admin to ${status}`,
          }
        });

        // If Cash on delivery and marked as Delivered, mark payment as paid
        const codPayment = order.payments.find(p => p.method === "COD");
        if (status === "DELIVERED" && codPayment) {
          await tx.payment.updateMany({
            where: { orderId },
            data: {
              status: "PAID",
              paidAt: now,
            }
          });
        }
      });

      return NextResponse.json({ success: true, message: `Status updated to ${status} successfully.` });
    }

    return NextResponse.json({ error: "Invalid parameters. Provide action='cancel' or new 'status'." }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/orders Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status." }, { status: 500 });
  }
}
