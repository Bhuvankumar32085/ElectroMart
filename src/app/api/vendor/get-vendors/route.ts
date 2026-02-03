// /api/vebdor/get-vendors

import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const vendors = await User.find({ role: "vendor" }).sort({ createdAt: -1 });

    if (!vendors || vendors.length == 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendors not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        vendors,
        message: "Vendors fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
