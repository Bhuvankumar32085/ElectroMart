import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { role, phone } = await req.json();
    if (!role || !phone) {
      return NextResponse.json(
        { message: "All Fealds Are Required", success: false },
        { status: 401 }
      );
    }

    if (role === "admin") {
      const adminExists = await User.exists({ role: "admin" });
      if (adminExists) {
        return NextResponse.json(
          { success: false, message: "Admin already exists" },
          { status: 403 }
        );
      }
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const user = await User.findOne({ email: session?.user?.email });
    if (!user) {
      return NextResponse.json(
        { message: "User Not Found", success: false },
        { status: 404 }
      );
    }
    user.role = role;
    user.phone = phone;
    await user.save();
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("EDIT PROFILE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
