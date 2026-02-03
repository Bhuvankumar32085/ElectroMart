import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const products = await Product.find()
      .populate("vendor")
      .populate("reviews.user")
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No products found",
          products: [],
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Products Found successfully",
        products,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Current User ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
