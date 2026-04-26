import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> } // ✅ string hona chahiye
) {
  await connectDB();

  const { userId } = await context.params;

  console.log("Raw userId:", userId);

  let cleanUserId = userId;

  // 🔥 JSON aaya to parse karo
  if (userId.startsWith("{")) {
    try {
      const parsed = JSON.parse(userId);
      cleanUserId = parsed.user_id;
    } catch (e) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }
  }

  console.log("Clean userId:", cleanUserId);

  // 🔐 validation
  if (!mongoose.Types.ObjectId.isValid(cleanUserId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  try {
    const user = await User.findById(cleanUserId).select(
      "name role orders cart email"
    );

    console.log("User found:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      role: user.role,
      ordersCount: user.orders?.length || 0,
      email: user.email,
      cartItems: user.cart?.length || 0,
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}