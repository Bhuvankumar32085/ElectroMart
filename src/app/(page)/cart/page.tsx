"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IImage {
  public_id: string;
  url: string;
}

interface IVendor {
  shopName: string;
  isVerified?: boolean;
}

interface IProduct {
  _id: string;
  title: string;
  price: number;
  image1: IImage;
  category: string;
  vendor?: IVendor;
  stock: number;
}

interface CartItem {
  _id?: string;
  product: IProduct;
  quantity: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getCart = async () => {
      try {
        const res = await axios.get("/api/user/cart/get-cart-products");
        if (res.data.success) {
          setCartItems(res.data.cartDatas || []);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    getCart();
  }, []);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0,
    );
    const taxAmt = sub * 0; // Example  GST (Adjust logic as needed)
    return {
      subtotal: sub,
      tax: taxAmt,
      total: sub + taxAmt,
    };
  }, [cartItems]);

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await axios.post("/api/user/cart/add-product", {
        productId: id,
        quantity: 1,
        newQty,
      });
      if (res.data.success) {
        alert("Update SuccessFully");
        setCartItems((prev) =>
          prev.map((item) =>
            item.product._id === id ? { ...item, quantity: newQty } : item,
          ),
        );
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const res = await axios.post("/api/user/cart/delete-product", {
        productId,
      });
      if (res.data.success) {
        alert("Delete SuccessFully");
        setCartItems((prev) =>
          prev.filter((item) => item.product._id !== productId),
        );
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    }
  };

  // ================= LOADING SKELETON =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050812] pt-24 px-4 flex justify-center">
        <div className="w-full max-w-7xl space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded mb-8"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-64 bg-white/5 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // ================= EMPTY STATE =================
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050812] text-white px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 p-8 rounded-full mb-6 border border-white/10"
        >
          <ShoppingBag size={64} className="text-cyan-400" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Looks like you have not added anything to your cart yet.
        </p>
        <Link
          href="/"
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 px-8 rounded-full transition-all flex items-center gap-2"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // ================= MAIN UI =================
  return (
    <div className="min-h-screen bg-linear-to-br from-[#050812] via-[#090c16] to-black text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-end gap-3 mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500">
            Shopping Cart
          </h1>
          <span className="text-lg text-gray-400 mb-1">
            ({cartItems.length} Items)
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* LEFT: CART ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, i) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group flex flex-col sm:flex-row gap-4 bg-white/3 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300 shadow-lg"
                >
                  {/* PRODUCT IMAGE */}
                  <div className="relative w-full sm:w-32 h-32 sm:h-auto rounded-xl overflow-hidden bg-white shadow-inner shrink-0">
                    <Image
                      src={item.product?.image1?.url || "/placeholder.jpg"}
                      alt={item.product?.title || "Product"}
                      fill
                      className="object-contain p-2 hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-lg text-gray-100 line-clamp-2 leading-tight">
                          {item.product?.title}
                        </h3>
                        {/* Mobile Delete Button (Top Right) */}
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="sm:hidden text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Vendor & Category */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          Vendor:{" "}
                          <span className="text-cyan-400">
                            {item.product?.vendor?.shopName || "ElectroMart"}
                          </span>
                        </span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">
                          {item.product?.category}
                        </span>
                      </div>
                    </div>

                    {/* PRICE & CONTROLS ROW */}
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Price</span>
                        <span className="text-xl font-bold text-white">
                          ₹ {item.product?.price * item?.quantity}
                        </span>
                      </div>

                      <div className=" flex gap-2">
                        {/* QUANTITY CONTROL */}
                        <div className="flex items-center gap-2 sm:gap-3 bg-black/40 rounded-lg px-2 py-1.5 border border-white/10">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                item.quantity - 1,
                              )
                            }
                            className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                item.quantity + 1,
                              )
                            }
                            className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition"
                            // Add disabled logic if stock is known
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            router.push(`/checkout/${item.product._id}`)
                          }
                          className="w-fill  py-1 px-2 text-xs sm:text-sm  bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex justify-center items-center gap-1"
                        >
                          Checkout <ShieldCheck size={18} />
                        </button>
                      </div>

                      {/* DESKTOP DELETE */}
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="hidden sm:block p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT: ORDER SUMMARY (Sticky) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-28 bg-white/3 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm text-gray-300 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">
                    ₹ {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>₹ {tax.toLocaleString()}</span>
                </div>
                {/* <div className="flex justify-between text-green-400">
                  <span>Shipping</span>
                  <span className="flex items-center gap-1 font-medium">
                    Free
                  </span>
                </div> */}
              </div>

              <div className="border-t border-dashed border-white/20 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-base font-semibold text-white">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-cyan-400">
                    ₹ {total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  Including all taxes
                </p>
              </div>

              {/* Secure Badge */}
              <div className="mt-6 flex justify-center items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} /> Secure Encryption Payment
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
