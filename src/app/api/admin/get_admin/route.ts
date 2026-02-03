import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const adminExists = await User.exists({ role: "admin" });

    return NextResponse.json(
      {
        success: true,
        isAdminCreated: !!adminExists,
        message: adminExists ? "Admin already exists" : "Admin not created yet",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 }
    );
  }
}
