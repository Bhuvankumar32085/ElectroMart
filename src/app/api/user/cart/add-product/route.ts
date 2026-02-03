import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Product from "@/model/product.model";
import User from "@/model/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const { productId, quantity, newQty } = await req.json();
    if (!productId || !quantity) {
      return NextResponse.json(
        { message: "productId and quantity required", success: false },
        { status: 400 },
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: "User Not Found", success: false },
        { status: 404 },
      );
    }
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product Not Found", success: false },
        { status: 404 },
      );
    }

    const isExists = user.cart.find(
      (p: { product: mongoose.Types.ObjectId; quantity: number }) =>
        p.product.toString() === product._id.toString(),
    );

    if (isExists) {
      if (newQty) {
        isExists.quantity = newQty;
      } else {
        isExists.quantity += Number(quantity) || 1;
      }
    } else {
      user.cart.push({
        product: product._id,
        quantity: Number(quantity) || 1,
      });
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        user,
        message: "Add Product successfully",
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


