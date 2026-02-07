import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import axios from "axios";
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

    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json(
        { message: "status orderId Are required", success: false },
        { status: 401 },
      );
    }

    const order = await Order.findById(orderId)
      .populate("buyer")
      .populate("productVendor")
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

    if (status == "confirmed" || status == "shipped") {
      order.orderStatus = status;
      order.deliveryOtp = "";
      await order.save();

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SOCKET_URL!}/update-user-order-status`,
          {
            order,
            userId: order.buyer._id,
          },
        );
      } catch (error) {
        console.error(error);
      }

      return NextResponse.json(
        { message: "order status updated", order, success: true },
        { status: 200 },
      );
    }

    if (status == "delivered") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      order.deliveryOtp = otp;
      order.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await order.save();

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SOCKET_URL!}/update-user-order-status`,
          {
            order,
            userId: order.buyer._id,
          },
        );
      } catch (error) {
        console.error(error);
      }

      return NextResponse.json(
        { message: "Order Delevierd", order, success: true },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Invalid Status",
        success: false,
      },
      { status: 401 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}
