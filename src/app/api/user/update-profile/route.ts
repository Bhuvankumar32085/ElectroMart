import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    if (!session?.user?.email || !session?.user || !session) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const shopName = formData.get("shopName") as string;
    const shopAddress = formData.get("shopAddress") as string;
    const gstNumber = formData.get("gstNumber") as string;
    const imageFile = formData.get("imageFile") as File | null;

    if (!name || !phone) {
      return NextResponse.json(
        { message: "Name and phone are required", success: false },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }

    let imageUrl;
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
      user.image = imageUrl.secure_url as string;
    }

    if (user.role === "vendor") {
      user.shopName = shopName || user.shopName;
      user.shopAddress = shopAddress || user.shopAddress;
      user.gstNumber = gstNumber || user.gstNumber;
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        user,
        message: "updated successfully",
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
