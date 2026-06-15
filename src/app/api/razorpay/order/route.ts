import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    if (amount === undefined || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Amount is required and must be a number" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_SwESWXTwV4F46I";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "LvT46te4fRgELq7MvjDX53s3";

    // Amount in Razorpay is in paise
    const orderData = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Razorpay Order API error response:", errorText);
      return NextResponse.json(
        { error: "Failed to create order on Razorpay", details: errorText },
        { status: response.status }
      );
    }

    const razorpayOrder = await response.json();
    return NextResponse.json(razorpayOrder);
  } catch (error: any) {
    console.error("Razorpay Order Route Handler error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
