import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { productId, status, rejectedReason } = await req.json();
    if (!productId || !status) {
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

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found", success: false },
        { status: 404 },
      );
    }

    if (status === "approved") {
      product.verificationStatus = "approved";
      product.approvedAt = new Date();
      product.rejectedReason = "";
    } else if (status === "rejected") {
      product.verificationStatus = "rejected";
      product.rejectedReason = rejectedReason;
    }
    await product.save();

    return NextResponse.json(
      {
        success: true,
        product,
        message: "Product status updated successfully",
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
