// /api/vebdor/get-vendors

import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

// type ImageFile = File | null;

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    if (!session?.user?.email || !session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (session.user.role !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const category = formData.get("category") as string;
    const isWearable = formData.get("isWearable") === "true";
    const sizes = formData.getAll("sizes") as string[];
    const replacementDays = Number(formData.get("replacementDays") || 0);
    const freeDelivery = formData.get("freeDelivery") === "true";
    const warranty = (formData.get("warranty") as string) || "No Warranty";
    const payOnDelivery = formData.get("payOnDelivery") === "true";
    const detailsPoints = formData.getAll("detailsPoints") as string[];
    const image1 = formData.get("image1") as Blob | null;
    const image2 = formData.get("image2") as Blob | null;
    const image3 = formData.get("image3") as Blob | null;
    const image4 = formData.get("image4") as Blob | null;

    if (
      !title ||
      !description ||
      !price ||
      !stock ||
      !category ||
      !image1 ||
      !image2 ||
      !image3 ||
      !image4
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }
    if (isWearable && sizes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Sizes are required for wearable products" },
        { status: 400 },
      );
    }

    const vendor = await User.findOne({
      email: session.user.email,
      role: "vendor",
    });
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 },
      );
    }

    // image upload on cloudinary
    const image1Res = await uploadToCloudinary(image1);
    const image2Res = await uploadToCloudinary(image2);
    const image3Res = await uploadToCloudinary(image3);
    const image4Res = await uploadToCloudinary(image4);

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      isStockAvailable: stock > 0,
      image1: {
        public_id: image1Res.public_id,
        url: image1Res.secure_url,
      },
      image2: {
        public_id: image2Res.public_id,
        url: image2Res.secure_url,
      },
      image3: {
        public_id: image3Res.public_id,
        url: image3Res.secure_url,
      },
      image4: {
        public_id: image4Res.public_id,
        url: image4Res.secure_url,
      },
      category,
      vendor: vendor._id,
      isWearable,
      sizes: isWearable ? sizes : [],
      replacementDays,
      warranty,
      payOnDelivery,
      freeDelivery,
      detailsPoints,
      verificationStatus: "pending",
      isActive: false,
    });

    // update user
    vendor.vendorProducts.push(product._id);
    await vendor.save();

    return NextResponse.json(
      {
        success: true,
        product,
        message: "Product Added successfully",
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
