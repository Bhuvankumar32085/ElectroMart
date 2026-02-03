import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!, 
      process.env.STRIPE_WEBHOOK_KEY!,
    );
  } catch (error) {
    console.error("", error);
  }
  if (event?.type === "checkout.session.completed") {
    const session = event.data.object;
    await connectDB();
    await Order.findByIdAndUpdate(session?.metadata?.orderId, {
      isPaid: true,
    });
  }
  return NextResponse.json({ recieved: true, success: true }, { status: 200 });
}
