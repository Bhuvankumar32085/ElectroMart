import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  await connectDB();

  const params = await context.params;
  const userId = params.userId;

  console.log("Raw userId:", userId);

  let cleanUserId = userId;

  // 🔥 JSON fix (same as user route)
  if (userId.startsWith("{")) {
    try {
      const parsed = JSON.parse(userId);
      cleanUserId = parsed.user_id;
    } catch (e) {
      console.error("Error parsing userId:", e);
      return NextResponse.json(
        { error: "Invalid userId format" },
        { status: 400 },
      );
    }
  }

  console.log("Clean userId:", cleanUserId);

  // 🔐 validation
  if (!mongoose.Types.ObjectId.isValid(cleanUserId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  try {
    const orders = await Order.find({ buyer: cleanUserId })
      .sort({ createdAt: -1 })
      .select("orderStatus totalAmount createdAt");

    console.log("Orders found:", orders.length);

    // 🔥 AI-friendly response
    const formatted = orders.map((o) => ({
      status: o.orderStatus,
      amount: o.totalAmount,
      date: o.createdAt,
    }));

    console.log("Formatted orders:", formatted);
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
