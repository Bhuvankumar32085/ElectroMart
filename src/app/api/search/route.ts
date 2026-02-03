import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query")?.trim();
    const category = searchParams.get("category");

    const filter: any = {
      isActive: true,
      verificationStatus: "approved",
    };

    if (query) {
      filter.$text = { $search: query };
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    const products = await Product.find(
      filter,
      query ? { score: { $meta: "textScore" } } : {},
    )
      .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .limit(50);

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
