import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import User from "@/model/user.model";
import { NextResponse } from "next/server";
export async function GET() {
  await connectDB();
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const currentUser = await User.findOne({ email: session?.user?.email });
    if (!currentUser) {
      return NextResponse.json(
        { message: "User Not Found", success: false },
        { status: 404 },
      );
    }

    if (currentUser.role == "user") {
      const oredrs = await Order.find({
        buyer: currentUser._id,
      }).populate("productVendor", "name image shopName role");

      const vendorMap = new Map();
      oredrs.forEach(
        (o) =>
          o.productVendor &&
          vendorMap.set(String(o.productVendor._id), o.productVendor),
      );

      return NextResponse.json(
        {
          success: true,
          resType: "user",
          activeUser: [...vendorMap.values()],
        },
        { status: 200 },
      );
    }

    if (currentUser.role == "vendor") {
      const oredrs = await Order.find({
        productVendor: currentUser._id,
      }).populate("buyer", "name image shopName role");

      const buyerMap = new Map();
      oredrs.forEach(
        (o) => o.buyer && buyerMap.set(String(o.buyer._id), o.buyer),
      );

      const admin = await User.findOne({ role: "admin" }).select(
        "name image role",
      );

      return NextResponse.json(
        {
          success: true,
          activeUser1: admin,
          activeUser2: [...buyerMap.values()],
          resType: "vandor",
        },
        { status: 200 },
      );
    }

    if (currentUser.role == "admin") {
      const vendors = await User.find({ role: "vendor" }).select(
        "name image role",
      );
      return NextResponse.json(
        {
          success: true,
          activeUser: vendors,
          resType: "admin",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Get Support Active  User ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
