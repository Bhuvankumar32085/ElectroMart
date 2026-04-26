import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> } // ✅ Promise correct
) {
  await connectDB();

  const params = await context.params; // ✅ MUST await
  const userId = params?.userId;

  console.log("Raw userId:", userId);

  // 🔐 safety check (IMPORTANT)
  if (!userId) {
    return NextResponse.json(
      { error: "UserId missing" },
      { status: 400 }
    );
  }

  let cleanUserId = userId;

  // 🔥 JSON parse (LLM bug handle)
  if (typeof userId === "string" && userId.startsWith("{")) {
    try {
      const parsed = JSON.parse(userId);
      cleanUserId = parsed.user_id;
    } catch {
      return NextResponse.json(
        { error: "Invalid userId format" },
        { status: 400 }
      );
    }
  }

  console.log("Clean userId:", cleanUserId);

  // 🔐 ObjectId validation
  if (!mongoose.Types.ObjectId.isValid(cleanUserId)) {
    return NextResponse.json(
      { error: "Invalid userId" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findById(cleanUserId).select(
      "name role orders cart email"
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: user.name,
      role: user.role,
      email: user.email,
      ordersCount: user.orders?.length || 0,
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