import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { message: "otp or orderId Are required", success: false },
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

    if (order.orderStatus == "cancelled") {
      return NextResponse.json(
        { message: "cancelled order can not be return", success: false },
        { status: 400 },
      );
    }

    if (order.orderStatus != "delivered") {
      return NextResponse.json(
        { message: "delivered order can be return", success: false },
        { status: 400 },
      );
    }

    if (order.orderStatus == "returned") {
      return NextResponse.json(
        { message: " order already returned", success: false },
        { status: 400 },
      );
    }

    const returnedAmount = order.productsTotal;
    order.orderStatus = "returned";
    order.returnedAmount = returnedAmount;
    await order.save();

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/order-returned`, {
        order,
        vendorId: order.productVendor._id,
      });
    } catch (e) {
      console.error("Socket notify failed", e);
    }

    return NextResponse.json(
      {
        message: "returned order successfully",
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
