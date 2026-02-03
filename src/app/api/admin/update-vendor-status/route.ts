import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { vendorId, status, rejectedReason } = await req.json();
    console.log("Received data:", { vendorId, status, rejectedReason });
    if (!vendorId || !status) {
      return NextResponse.json(
        { message: "Bad Request", success: false },
        { status: 400 },
      );
    }

    if (status === "rejected" && !rejectedReason) {
      return NextResponse.json(
        {
          message: "Bad Request: Rejected reason required for rejection",
          success: false,
        },
        { status: 400 },
      );
    }

    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 403 },
      );
    }

    const admin = await User.findOne({ email: session.user?.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden", success: false },
        { status: 403 },
      );
    }

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") {
      return NextResponse.json(
        { message: "Vendor not found or invalid", success: false },
        { status: 404 },
      );
    }

    if (status === "approved") {
      vendor.verificationStatus = "approved";
      vendor.isApproved = true;
      vendor.approvedAt = new Date();
      vendor.rejectedReason = "";
    } else if (status === "rejected") {
      vendor.verificationStatus = "rejected";
      vendor.isApproved = false;
      vendor.rejectedReason = rejectedReason;
    }
    await vendor.save();

    return NextResponse.json(
      {
        success: true,
        vendor,
        message: "Vendor status updated successfully",
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
