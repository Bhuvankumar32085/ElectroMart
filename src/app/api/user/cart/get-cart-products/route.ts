import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: "User Not Found", success: false },
        { status: 404 },
      );
    }

    await user.populate({
      path: "cart.product",
      populate: {
        path: "vendor",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Get Cart Item successfully",
        cartDatas: user.cart || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Cart Item ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
