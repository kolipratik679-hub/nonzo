import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  // NOTE: This endpoint is deprecated for the main checkout order creation flow.
  // Order verification and DB persistence are now transactionally unified inside POST /api/orders.
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Order ID, Payment ID, and Signature are required" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "LvT46te4fRgELq7MvjDX53s3";

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    if (isValid) {
      return NextResponse.json({ success: true, message: "Signature verified successfully" });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Razorpay Verification Route Handler error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
