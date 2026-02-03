import mongoose from "mongoose";
import { IUser } from "./user.model";
import { IProduct } from "./product.model";

export interface IOrder {
  _id?: mongoose.Types.ObjectId;

  products: {
    product: IProduct;
    quantity: number;
    price: number;
  }[];

  buyer: IUser;
  productVendor: IUser;

  productsTotal: number;
  deliveryCharge: number;
  serviceCharge: number;
  totalAmount: number;

  paymentMethod: "cod" | "online";
  isPaid: boolean;

  orderStatus:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "returned"
    | "cancelled";

  cancelledAt?: Date;
  returnedAmount?: number;

  address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };

  paymentDetails?: {
    stripePaymentId?: string;
    stripeSessionId?: string;
  };

  deliveryDate?: Date;

  deliveryOtp?: string;
  otpExpiresAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productsTotal: {
      type: Number,
      required: true,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
    },

    serviceCharge: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentDetails: {
      stripePaymentId: String,
      stripeSessionId: String,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "pending",
    },

    cancelledAt: Date,

    returnedAmount: Number,

    address: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },

    deliveryDate: Date,

    deliveryOtp: String,

    otpExpiresAt: Date,
  },
  {
    timestamps: true,
  },
);

const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
