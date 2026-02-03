import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import { NextRequest, NextResponse } from "next/server";

// cod
export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    if (!session || !session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 403 },
      );
    }

    const { orderId, otp } = await req.json();
    if (!orderId || !otp) {
      return NextResponse.json(
        { message: "otp or orderId Are required", success: false },
        { status: 401 },
      );
    }

    const order = await Order.findById(orderId)
      .populate("buyer", "name email phone image")
      .populate("productVendor", "name shopName email")
      .populate({
        path: "products.product",
        model: "Product",
        select: "title image1 category stock vendor replacementDays",
      });
    if (!order) {
      return NextResponse.json(
        { message: "order not found", success: false },
        { status: 404 },
      );
    }

    if (
      order.deliveryOtp != otp ||
      !order.otpExpiresAt ||
      order.otpExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { message: "Invalid or expired OTP", success: false },
        { status: 403 },
      );
    }

    order.orderStatus = "delivered";
    order.isPaid = true;
    order.deliveryDate = new Date();
    order.deliveryOtp = "";
    order.otpExpiresAt = undefined;
    await order.save();

    return NextResponse.json(
      {
        message: "order verify successfully",
        order,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}
