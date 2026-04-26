import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const products = await Product.find({
      $text: { $search: query },
      isActive: true,
      verificationStatus: "approved",
    })
      .select("title price category image1.url")
      .limit(5);

    // 🔥 clean response for AI
    const formatted = products.map((p) => ({
      id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      image: p.image1?.url,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
