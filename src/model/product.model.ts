import mongoose from "mongoose";
import { IUser } from "./user.model";

export interface IProduct {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  stock: number;
  isStockAvailable?: boolean;
  vendor: IUser;
  image1: {
    public_id: string;
    url: string;
  };
  image2: {
    public_id: string;
    url: string;
  };
  image3: {
    public_id: string;
    url: string;
  };
  image4: {
    public_id: string;
    url: string;
  };
  isWearable: boolean; //ye true hoga to vendor size de sakta h item ko x xl etc
  sizes?: string[]; //array of sizes if isWearable is true

  verificationStatus: "pending" | "approved" | "rejected";
  requestedAt?: Date;
  approvedAt?: Date;
  rejectedReason?: string;

  isActive?: boolean; //false hone pr user ko dikhai nhi dega product
  replacementDays?: number;
  freeDelivery?: boolean;
  warranty?: string;
  payOnDelivery?: boolean; //cash on delivery option false hoga to user ko cash on delivery ka option nhi milega

  detailsPoints?: string[]; //key features of product in points
  reviews?: {
    user: IUser;
    rating: number;
    comment: string;
    image?: {
      public_id: string;
      url: string;
    };
    createdAt: Date;
  }[];
  category: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    isStockAvailable: {
      type: Boolean,
      default: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image1: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    image2: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    image3: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    image4: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    isWearable: {
      type: Boolean,
      default: false,
    },
    sizes: {
      type: [String],
      default: [],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    rejectedReason: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    replacementDays: {
      type: Number,
      default: 0,
    },
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    warranty: {
      type: String,
      default: "No Warranty",
    },
    payOnDelivery: {
      type: Boolean,
      default: true,
    },
    detailsPoints: {
      type: [String],
      default: [],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        image: {
          public_id: { type: String },
          url: { type: String },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

productSchema.index(
  {
    title: "text",
    description: "text",
    category: "text",
  },
  {
    weights: {
      title: 5,
      category: 3,
      description: 1,
    },
    name: "ProductTextSearch",
  },
);

const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
