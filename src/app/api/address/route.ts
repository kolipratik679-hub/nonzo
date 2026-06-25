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

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error("GET /api/address Error:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve addresses." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const { tag, fullName, flat, area, city, pincode, phone, landmark, isDefault } = await request.json();

    if (!fullName || !flat || !area || !phone) {
      return NextResponse.json({ error: "Missing required fields (fullName, flat, area, phone)." }, { status: 400 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const newAddress = await prisma.$transaction(async (tx) => {
      // If marking as default, remove default from other addresses
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false }
        });
      }

      // Check if this is the first address, if so force default
      const addressCount = await tx.address.count({
        where: { userId: user.id }
      });
      const finalIsDefault = addressCount === 0 ? true : !!isDefault;

      const created = await tx.address.create({
        data: {
          userId: user.id,
          tag: tag || "Home",
          fullName,
          flat,
          area,
          city: city || "Navi Mumbai",
          pincode: pincode || "410206",
          phone,
          landmark: landmark || null,
          isDefault: finalIsDefault
        }
      });

      // Log UserActivity
      await tx.userActivity.create({
        data: {
          userId: user.id,
          activityType: "ADDRESS_ADDED",
          referenceId: created.id,
          metadata: { tag: created.tag },
          ipAddress,
          userAgent,
          createdAt: getISTDate()
        }
      });

      return created;
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error: any) {
    console.error("POST /api/address Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create address." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const { id, tag, fullName, flat, area, city, pincode, phone, landmark, isDefault } = await request.json();

    if (!id || !fullName || !flat || !area || !phone) {
      return NextResponse.json({ error: "Missing required fields (id, fullName, flat, area, phone)." }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Address not found or unauthorized." }, { status: 404 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const updatedAddress = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false }
        });
      }

      const updated = await tx.address.update({
        where: { id },
        data: {
          tag: tag || "Home",
          fullName,
          flat,
          area,
          city: city || "Navi Mumbai",
          pincode: pincode || "410206",
          phone,
          landmark: landmark || null,
          isDefault: !!isDefault
        }
      });

      // Log UserActivity
      await tx.userActivity.create({
        data: {
          userId: user.id,
          activityType: "ADDRESS_UPDATED",
          referenceId: updated.id,
          metadata: { tag: updated.tag },
          ipAddress,
          userAgent,
          createdAt: getISTDate()
        }
      });

      return updated;
    });

    return NextResponse.json({ success: true, address: updatedAddress });
  } catch (error: any) {
    console.error("PUT /api/address Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update address." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Address not found or unauthorized." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id }
      });

      // If we deleted the default address, make another one default
      if (existing.isDefault) {
        const remaining = await tx.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" }
        });

        if (remaining) {
          await tx.address.update({
            where: { id: remaining.id },
            data: { isDefault: true }
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/address Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete address." }, { status: 500 });
  }
}
