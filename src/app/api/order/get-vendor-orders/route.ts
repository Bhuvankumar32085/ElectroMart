import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const session = await auth();
    if (!session || !session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 403 },
      );
    }

    const userId = session.user.id;

    const orders = await Order.find({
      productVendor: userId,
    })
      .populate("buyer", "name email phone image")
      .populate("productVendor", "name shopName email")
      .populate({
        path: "products.product",
        model: "Product",
        select: "title image1 category stock vendor replacementDays",
      })
      .sort({ createdAt: -1 });

    if (!orders || orders.length == 0) {
      return NextResponse.json(
        { message: "user  not Found", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Orders fetched successfully",
        orders,
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
