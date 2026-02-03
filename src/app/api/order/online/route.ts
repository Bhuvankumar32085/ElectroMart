import { auth } from "@/auth";
import connectDB from "@/lib/connectDB";
import Order from "@/model/order.model";
import Product, { IProduct } from "@/model/product.model";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface CartItem {
  _id?: string;
  product: IProduct;
  quantity: number;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// cod
export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    if (!session || !session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 403 },
      );
    }

    const userId = session.user.id;

    const {
      productId,
      quantity,
      address,
      amount,
      deliveryCharge,
      serviceCharge,
    } = await req.json();
    if (
      !productId ||
      !quantity ||
      !address ||
      amount === undefined ||
      deliveryCharge === undefined ||
      serviceCharge === undefined
    ) {
      return NextResponse.json(
        { message: "All fields are required", success: false },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user || !user.cart) {
      return NextResponse.json(
        { message: "user or cart not Found", success: false },
        { status: 404 },
      );
    }

    const cartItem = user?.cart?.find(
      (i: CartItem) =>
        String(i.product?._id || i.product) === String(productId),
    );

    if (!cartItem) {
      return NextResponse.json(
        { message: "Cart Item not Found In A User Cart", success: false },
        { status: 404 },
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "product not Found", success: false },
        { status: 404 },
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: `Insufficient stock for ${product.title}`, success: false },
        { status: 400 },
      );
    }

    const productsTotal = product.price * quantity;

    const order = await Order.create({
      buyer: userId,
      products: [
        {
          product: product._id,
          quantity,
          price: product.price,
        },
      ],
      productVendor: product.vendor,
      productsTotal: Number(productsTotal),
      deliveryCharge: Number(deliveryCharge),
      serviceCharge: Number(serviceCharge),
      totalAmount: Number(amount),

      paymentMethod: "online",
      isPaid: false,
      orderStatus: "pending",
      returnedAmount: 0,
      address,
    });

    product.stock -= quantity;
    await product.save();

    user.cart = user.cart.filter(
      (i: CartItem) =>
        String(i.product?._id || i.product) !== String(productId),
    );
    user.orders.push(order._id);
    await user.save();

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${process.env.NEXT_BASE_URL}/order-success`,
      cancel_url: `${process.env.NEXT_BASE_URL}/order-failed`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.title,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order._id.toString(),
        productId: product._id.toString(),
      },
    });
    // stripeSession.url ye stripe url h jis se payment ki screen khul ke aagi
    return NextResponse.json(
      { url: stripeSession.url, success: true },
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
