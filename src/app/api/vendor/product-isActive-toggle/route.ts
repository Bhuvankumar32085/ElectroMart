// /api/vebdor/get-vendors

import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  await connectDB();
  try {
    const { productId, isActive } = await req.json();

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true },
    );
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
        message: "Product status updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
