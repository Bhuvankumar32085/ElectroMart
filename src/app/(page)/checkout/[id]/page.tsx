"use client";

import { IProduct } from "@/model/product.model";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Truck,
  ShieldCheck,
  PackageCheck,
  XCircle,
  Loader2,
} from "lucide-react";

interface CartItem {
  _id?: string;
  product: IProduct;
  quantity: number;
}

const CheckOutPage = () => {
  const { id } = useParams();
  const productId = id as string;
  const router = useRouter();

  const [item, setItem] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [method, setMethod] = useState<"cod" | "online">("online");
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    const getCart = async () => {
      try {
        const res = await axios.get("/api/user/cart/get-cart-products");
        if (res.data.success) {
          const found = res.data.cartDatas.find(
            (c: CartItem) => String(c.product?._id || c.product) === productId,
          );
          setItem(found || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getCart();
  }, [productId]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const productsTotal = useMemo(() => {
    if (!item) return 0;
    return item.product.price * item.quantity;
  }, [item]);

  const deliveryCharge = useMemo(() => {
    if (!item) return 0;
    return item.product.freeDelivery ? 0 : 40;
  }, [item]);

  const serviceCharge = 30;

  const totalPrice = useMemo(() => {
    return productsTotal + deliveryCharge + serviceCharge;
  }, [productsTotal, deliveryCharge]);

  useEffect(() => {
    if (!productId) {
      router.replace("/cart");
    }
  }, [productId, router]);

  if (loading) return <CenterText text="Loading checkout..." />;
  if (!item) return <CenterText text="Product not found in cart" />;

  const { product } = item;
  const isCODAvailable = product.payOnDelivery && product.isStockAvailable;

  const handleSumbit = async () => {
    if (
      !address.name ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.pincode
    ) {
      return alert("Please fill complete address");
    }

    if (!isCODAvailable && method == "cod") {
      return alert("Cash On Delivery is not available for this product");
    }
    if (!product.isActive) {
      return alert("Product is Not Active");
    }

    if (address.phone.length != 10) {
      return alert("Number must be 10 character");
    }

    const payload = {
      productId,
      quantity: item.quantity,
      address,
      amount: totalPrice,
      deliveryCharge,
      serviceCharge,
    };

    setPaymentLoading(true);

    try {
      if (isCODAvailable && method == "cod") {
        const res = await axios.post("/api/order/cod", payload);
        if (res.data.success) {
          router.push("/orders");
        }
      } else {
        const res = await axios.post("/api/order/online", payload);
        if (res.data.success) {
          window.location.href = res.data.url;
        }
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050812] via-[#0b0f1a] to-black pt-24 pb-32 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* PRODUCT CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row   gap-6"
          >
            <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-black/30">
              <Image
                src={product.image1?.url || "/placeholder.png"}
                alt={product.title}
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold text-white">
                {product.title}
              </h2>

              <p className="text-sm text-white/60">
                Category: <span className="text-white">{product.category}</span>
              </p>

              <p className="text-sm text-white/60">
                Seller:{" "}
                <span className="text-cyan-400">
                  {product.vendor?.shopName}
                </span>
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                {product.isStockAvailable && product.stock > 0 ? (
                  <Badge
                    icon={<PackageCheck size={14} />}
                    text="In Stock"
                    green
                  />
                ) : (
                  <Badge icon={<XCircle size={14} />} text="Out of Stock" red />
                )}

                {product.freeDelivery && (
                  <Badge
                    icon={<Truck size={14} />}
                    text="Free Delivery"
                    green
                  />
                )}

                {product.payOnDelivery ? (
                  <Badge text="Cash on Delivery" green />
                ) : (
                  <Badge text="No COD" red />
                )}

                {product.warranty && (
                  <Badge
                    icon={<ShieldCheck size={14} />}
                    text={`Warranty: ${product.warranty}`}
                  />
                )}
              </div>

              <p className="text-sm text-white/60 mt-2">
                Quantity: {item.quantity}
              </p>

              <p className="text-xl font-bold text-cyan-400">
                ₹{product.price}
              </p>
            </div>
          </motion.div>

          {/* ADDRESS */}
          <Card title="Delivery Address" icon={<MapPin size={18} />}>
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={address.name}
                  onChange={handleAddressChange}
                  placeholder="Enter your name"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white text-sm
        placeholder:text-white/40
        focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  placeholder="10 digit mobile number"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white text-sm
        placeholder:text-white/40
        focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-white/60">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={address.address}
                  onChange={handleAddressChange}
                  placeholder="House no, area, road"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white text-sm
        placeholder:text-white/40
        focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">City</label>
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white text-sm
        placeholder:text-white/40
        focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                />
              </div>

              {/* Pincode */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">Pincode</label>
                <input
                  type="text"
                  placeholder="Postal code"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white text-sm
        placeholder:text-white/40
        focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky top-24 h-fit bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur"
        >
          <h3 className="text-white text-lg font-semibold">Order Summary</h3>

          <Row label="Price" value={`₹${product.price}`} />
          <Row label="Quantity" value={item.quantity} />
          <Row label="Service Charge" value={serviceCharge} />
          <Row
            label="Delivery Charge"
            value={product.freeDelivery ? "Free" : "₹40"}
            green
          />

          <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-bold text-white">
            <span>Total</span>
            <span className="text-cyan-400">₹{totalPrice}</span>
          </div>

          {/* Payment Buttons */}
          <div className="flex gap-3">
            <button
              disabled={!isCODAvailable}
              onClick={() => setMethod("cod")}
              className={`w-full py-3 rounded-xl font-semibold transition text-sm
                ${method == "cod" ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-gray-600 text-white"} ${!isCODAvailable && "cursor-not-allowed"}`}
            >
              Cash on Delivery
            </button>

            <button
              onClick={() => setMethod("online")}
              className={`w-full py-3 rounded-xl font-semibold transition text-sm
                  ${method == "online" ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-gray-600 text-white"}`}
            >
              Stripe
            </button>
          </div>

          {/* Place Order */}
          <button
            onClick={handleSumbit}
            className={`w-full py-3 rounded-xl font-semibold transition bg-cyan-500 text-black hover:bg-cyan-400`}
          >
            {paymentLoading ? (
              <Loader2 className=" animate-spin mx-auto" />
            ) : (
              " Place Order"
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckOutPage;

/* ---------- Small UI helpers ---------- */

const CenterText = ({ text }: { text: string }) => (
  <div className="min-h-screen flex items-center justify-center text-white">
    {text}
  </div>
);

const Badge = ({
  text,
  icon,
  green,
  red,
}: {
  text: string;
  icon?: ReactNode;
  green?: boolean;
  red?: boolean;
}) => (
  <span
    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs
      ${green && "bg-green-500/15 text-green-400"}
      ${red && "bg-red-500/15 text-red-400"}
      ${!green && !red && "bg-white/10 text-white/70"}
    `}
  >
    {icon} {text}
  </span>
);

const Card = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
  >
    <h3 className="flex items-center gap-2 text-white font-semibold">
      {icon} {title}
    </h3>
    {children}
  </motion.div>
);

const Row = ({
  label,
  value,
  green,
}: {
  label: string;
  value: string | number;
  green?: boolean;
}) => (
  <div className="flex justify-between text-sm text-white/70">
    <span>{label}</span>
    <span className={green ? "text-green-400" : ""}>{value}</span>
  </div>
);
