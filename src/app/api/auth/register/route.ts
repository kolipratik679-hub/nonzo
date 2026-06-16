import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required to complete profile registration." },
        { status: 400 }
      ) as any;
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: "Unauthenticated. Please verify OTP first." },
        { status: 401 }
      ) as any;
    }

    const decoded = accessToken
      ? await verifyToken(accessToken)
      : await verifyToken(refreshToken!);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session token." },
        { status: 401 }
      ) as any;
    }

    const userId = decoded.userId as string;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      ) as any;
    }

    // Update the user profile (name and email)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: email || null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        mobile: updatedUser.mobile,
        email: updatedUser.email || undefined,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/auth/register:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ) as any;
  }
}
