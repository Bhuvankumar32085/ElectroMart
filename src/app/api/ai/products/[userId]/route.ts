import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  await connectDB();

  try {
    const orders = await Order.find({ buyer: params.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("orderStatus totalAmount createdAt");

    const formatted = orders.map((o) => ({
      status: o.orderStatus,
      amount: o.totalAmount,
      date: o.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}