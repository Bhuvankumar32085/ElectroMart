import { auth } from "@/auth";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
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
    const productId = formData.get("productId") as string;
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

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    if (isWearable && sizes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Sizes are required for wearable products" },
        { status: 400 },
      );
    }

    if (session.user.id.toString() !== product.vendor.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to update this product",
        },
        { status: 403 },
      );
    }

    // Upload images to Cloudinary if new images are provided
    if (image1) {
      await deleteFromCloudinary(product.image1.public_id);
      const uploadedImage1 = await uploadToCloudinary(image1);
      product.image1 = uploadedImage1;
    }
    if (image2) {
      await deleteFromCloudinary(product.image2.public_id);
      const uploadedImage2 = await uploadToCloudinary(image2);
      product.image2 = uploadedImage2;
    }
    if (image3) {
      await deleteFromCloudinary(product.image3.public_id);
      const uploadedImage3 = await uploadToCloudinary(image3);
      product.image3 = uploadedImage3;
    }
    if (image4) {
      await deleteFromCloudinary(product.image4.public_id);
      const uploadedImage4 = await uploadToCloudinary(image4);
      product.image4 = uploadedImage4;
    }
    // Update product fields
    // Update product fields safely
    if (title !== null) product.title = title;
    if (description !== null) product.description = description;
    if (!isNaN(price)) product.price = price;
    if (!isNaN(stock)) product.stock = stock;
    if (category !== null) product.category = category;

    product.isWearable = isWearable;
    product.freeDelivery = freeDelivery;
    product.payOnDelivery = payOnDelivery;

    if (isWearable) {
      product.sizes = sizes;
    } else {
      product.sizes = [];
    }

    if (!isNaN(replacementDays)) {
      product.replacementDays = replacementDays;
    }

    if (warranty !== null) product.warranty = warranty;
    if (detailsPoints.length > 0) product.detailsPoints = detailsPoints;

    await product.save();
    await product.populate("vendor");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/update-product-realtime`,
        {
          product,
        },
      );
    } catch (err) {
      console.error("Socket notify failed", err);
    }

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
