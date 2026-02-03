import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    if (!session?.user || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const rating = Number(formData.get("rating"));
    const comment = formData.get("comment") as string;
    const reviewImage = formData.get("reviewImage") as File | null;

    if (!productId) {
      return NextResponse.json(
        { message: "Product Id Not Found", success: false },
        { status: 404 },
      );
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5", success: false },
        { status: 400 },
      );
    }
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { message: "Comment is required", success: false },
        { status: 400 },
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product  Not Found", success: false },
        { status: 404 },
      );
    }

    let imageRes;
    if (reviewImage) {
      imageRes = await uploadToCloudinary(reviewImage);
    }

    product.reviews.push({
      user: userId,
      rating,
      comment,
      image: {
        public_id: imageRes?.public_id,
        url: imageRes?.secure_url,
      },
      createdAt: new Date(),
    });

    await product.save();
    await product.populate([{ path: "vendor" }, { path: "reviews.user" }]);

    return NextResponse.json(
      {
        message: `Review added SuccessFully`,
        product,
        success: true,
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
