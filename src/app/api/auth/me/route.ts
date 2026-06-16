import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken, signAccessToken } from "@/lib/jwt";
import { getISTDate } from "@/lib/date";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: "Unauthenticated. No tokens found." },
        { status: 401 }
      ) as any;
    }

    let decoded = accessToken ? await verifyToken(accessToken) : null;
    let newAccessTokenGenerated = false;

    // If access token is missing or expired, try refresh token
    if (!decoded && refreshToken) {
      decoded = await verifyToken(refreshToken);
      if (decoded) {
        newAccessTokenGenerated = true;
      }
    }

    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthenticated. Invalid or expired tokens." },
        { status: 401 }
      ) as any;
    }

    const sessionId = decoded.sessionId as string;

    // Check if the session exists and is active in the database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.expiresAt < getISTDate()) {
      // Clean up invalid session
      if (session) {
        await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      }
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");

      return NextResponse.json(
        { error: "Session expired or revoked. Please log in again." },
        { status: 401 }
      ) as any;
    }

    const user = session.user;

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "This user account is blocked." },
        { status: 403 }
      ) as any;
    }

    // Auto-rotate access token if verified via refresh token
    if (newAccessTokenGenerated) {
      const newAccessToken = await signAccessToken({
        userId: user.id,
        sessionId: session.id,
        role: "CUSTOMER",
      });

      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
      });
    }

    // Determine profile completeness
    const isProfileComplete =
      user.name !== "New User" && user.name.trim() !== "";

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        mobile: user.mobile,
        email: user.email || undefined,
      },
      isProfileComplete,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ) as any;
  }
}
