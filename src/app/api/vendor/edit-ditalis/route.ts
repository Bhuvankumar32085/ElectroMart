import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { shopName, shopAddress, gstNumber } = await req.json();

    const missingFields: string[] = [];

    if (!shopName) missingFields.push("Shop Name");
    if (!shopAddress) missingFields.push("Shop Address");
    if (!gstNumber) missingFields.push("GST Number");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: `${missingFields.join(", ")} is required`,
          success: false,
        },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }
    const user = await User.findOne({
      email: session?.user?.email,
      role: "vendor",
    });
    if (!user) {
      return NextResponse.json(
        {
          message: `User Not Found`,
          success: false,
        },
        { status: 404 }
      );
    }

    user.shopName = shopName;
    user.shopAddress = shopAddress;
    user.gstNumber = gstNumber;
    user.verificationStatus = "pending";
    user.requestedAt = new Date();

    await user.save();
    return NextResponse.json(
      {
        message: `Vendor Details Update SuccessFully`,
        user,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 }
    );
  }
}
