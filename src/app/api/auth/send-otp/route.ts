import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getISTDate } from "@/lib/date";

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number. Must be exactly 10 digits." },
        { status: 400 }
      ) as any;
    }

    const now = getISTDate();

    // 1. Check if blocked due to 5 consecutive failed attempts
    const lastOtp = await prisma.otpVerification.findFirst({
      where: { mobile },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp && lastOtp.attempts >= 5) {
      const blockDuration = 15 * 60 * 1000; // 15 minutes block
      const blockedUntil = new Date(lastOtp.createdAt.getTime() + blockDuration);
      if (now < blockedUntil) {
        const minutesLeft = Math.ceil((blockedUntil.getTime() - now.getTime()) / 60000);
        return NextResponse.json(
          { error: `Too many failed attempts. Mobile blocked. Try again in ${minutesLeft} minutes.` },
          { status: 429 }
        ) as any;
      }
    }

    // 2. Check 60 seconds rate limit between requests
    if (lastOtp) {
      const timeSinceLast = now.getTime() - lastOtp.createdAt.getTime();
      if (timeSinceLast < 60 * 1000) {
        const secondsLeft = Math.ceil((60 * 1000 - timeSinceLast) / 1000);
        return NextResponse.json(
          { error: `Please wait ${secondsLeft} seconds before requesting another OTP.` },
          { status: 429 }
        ) as any;
      }
    }

    // 3. Check hourly limit (max 5 OTPs per hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const otpsInLastHour = await prisma.otpVerification.count({
      where: {
        mobile,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (otpsInLastHour >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 OTP requests per hour exceeded. Please try again later." },
        { status: 429 }
      ) as any;
    }

    // 4. Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Store OTP in database (expire in 5 minutes)
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    await prisma.otpVerification.create({
      data: {
        mobile,
        otp: generatedOtp,
        expiresAt,
        attempts: 0,
        verified: false,
        createdAt: now,
      },
    });

    // 6. Log UserActivity if User exists
    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (user) {
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          activityType: "LOGIN", // fallback mapping since OTP_SENT is not in the prisma schema's ActivityType enum
          metadata: { action: "OTP_SENT", mobile },
          ipAddress,
          userAgent,
          createdAt: now,
        },
      });
    }

    // Return the OTP in development mode for testing
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully (Development Mode)",
      otp: generatedOtp, // Included in response for testing
    });
  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ) as any;
  }
}
