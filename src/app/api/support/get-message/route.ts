import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import User from "@/model/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type chats = {
  with: mongoose.Types.ObjectId; //kis user se chat kari
  messages: {
    sender: mongoose.Types.ObjectId; //kis ne msg kiya
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const { withUserId } = await req.json();

    if (!withUserId) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const currUser = await User.findById({ _id: session.user.id }).populate(
      "chats.with",
      "name image role shopName",
    );

    if (!currUser) {
      return NextResponse.json(
        { success: false, message: "currUser not found" },
        { status: 404 },
      );
    }

    const chat = currUser.chats.find(
      (c: chats) => String(c.with?._id) === String(withUserId),
    );

    return NextResponse.json(
      {
        success: true,
        chat: chat?.messages || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Support Active  CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
