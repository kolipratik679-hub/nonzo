import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { getISTDate } from "@/lib/date";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    let userId: string | null = null;
    let sessionId: string | null = null;

    // Verify access token first, then fallback to refresh token
    const tokenToVerify = accessToken || refreshToken;
    if (tokenToVerify) {
      const decoded = await verifyToken(tokenToVerify);
      if (decoded) {
        userId = decoded.userId as string;
        sessionId = decoded.sessionId as string;
      }
    }

    // 1. Invalidate session in the database if found
    if (sessionId) {
      try {
        await prisma.session.delete({
          where: { id: sessionId },
        });
      } catch (err) {
        // Session might already be deleted or expired
        console.warn("Session already deleted or expired in DB:", sessionId);
      }
    }

    // 2. Clear JWT cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    // 3. Log UserActivity if we identified the user
    if (userId) {
      const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await prisma.userActivity.create({
        data: {
          userId,
          activityType: "LOGOUT",
          ipAddress,
          userAgent,
          createdAt: getISTDate(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Error in logout route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ) as any;
  }
}
