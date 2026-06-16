import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { getISTDate } from "@/lib/date";

export async function POST(request: Request) {
  try {
    const { mobile, otp } = await request.json();

    if (!mobile || !/^\d{10}$/.test(mobile) || !otp) {
      return NextResponse.json(
        { error: "Missing or invalid mobile or OTP." },
        { status: 400 }
      ) as any;
    }

    const now = getISTDate();

    // 1. Retrieve the latest unverified OTP verification record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        mobile,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP request found for this mobile number." },
        { status: 400 }
      ) as any;
    }

    // 2. Check if expired
    if (now > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      ) as any;
    }

    // 3. Check attempts limit
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 400 }
      ) as any;
    }

    // 4. Validate OTP (accept mock OTPs: 123456 / 999999 / 1234, or actual OTP)
    const isMockOtp = otp === "123456" || otp === "999999" || otp === "1234";
    const isCorrectOtp = otp === otpRecord.otp || isMockOtp;

    if (!isCorrectOtp) {
      // Increment attempts
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      return NextResponse.json(
        { error: "Incorrect OTP. Please try again." },
        { status: 400 }
      ) as any;
    }

    // OTP is correct - mark as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // 5. Look up user or create new user
    let user = await prisma.user.findUnique({
      where: { mobile },
    });

    let isExisting = true;

    if (!user) {
      isExisting = false;
      // Create a skeleton user profile
      user = await prisma.user.create({
        data: {
          mobile,
          name: "New User",
          createdAt: now,
          cart: {
            create: {},
          },
          wishlist: {
            create: {},
          },
        },
      });
    }

    // 6. Create Session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        deviceInfo: request.headers.get("user-agent") || "unknown",
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: now,
      },
    });

    // 7. Generate JWTs
    const accessToken = await signAccessToken({
      userId: user.id,
      sessionId: session.id,
      role: "CUSTOMER",
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    // 8. Set HTTP-Only Cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // 9. Log UserActivity
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: "LOGIN",
        metadata: { action: "OTP_VERIFIED", isExisting },
        ipAddress,
        userAgent,
        createdAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      isExisting,
      user: {
        name: user.name,
        mobile: user.mobile,
        email: user.email || undefined,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ) as any;
  }
}
