// /api/vebdor/get-vendors

import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import axios from "axios";
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

    // after product update

    const safeProduct = product.toObject(); //  VERY IMPORTANT

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/update-product-active`,
        {
          product: safeProduct,
        },
      );
    } catch (err) {
      console.error("Socket notify failed", err);
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
