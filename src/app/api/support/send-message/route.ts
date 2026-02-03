export const runtime = "nodejs";

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

    const { receiverId, text } = await req.json();

    if (!receiverId || !text?.trim()) {
      return NextResponse.json(
        { success: false, message: "receiverId and text required" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return NextResponse.json(
        { success: false, message: "Invalid receiverId" },
        { status: 400 },
      );
    }

    /* =====================
       FETCH REAL USERS
    ===================== */

    const sender = await User.findOne({ email: session.user.email });
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const message = {
      sender: sender._id,
      text,
      createdAt: new Date(),
    };

    /* =====================
       SENDER SIDE
    ===================== */

    if (!sender.chats) sender.chats = [];

    let senderChat = sender.chats.find(
      (c: chats) => c.with.toString() === receiver._id.toString(),
    );

    if (!senderChat) {
      senderChat = {
        with: receiver._id,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sender.chats.push(senderChat);
    }

    senderChat.messages.push(message);
    senderChat.updatedAt = new Date();

    await sender.save();

    /* =====================
       RECEIVER SIDE
    ===================== */

    if (!receiver.chats) receiver.chats = [];

    let receiverChat = receiver.chats.find(
      (c: chats) => c.with.toString() === sender._id.toString(),
    );

    if (!receiverChat) {
      receiverChat = {
        with: sender._id,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      receiver.chats.push(receiverChat);
    }

    receiverChat.messages.push(message);
    receiverChat.updatedAt = new Date();

    await receiver.save();

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
