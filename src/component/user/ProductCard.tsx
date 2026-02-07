"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingCart, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { IProduct } from "@/model/product.model";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

interface ProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handelAddCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const productId = product._id;
    const quantity = 1;
    if (!productId) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/user/cart/add-product", {
        productId,
        quantity,
      });
      if (res.data.success) {
        alert(res.data.message || "add item");
        router.push("/cart");
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <motion.div
      onClick={() => router.push(`/user/product-page/${product._id}`)}
      // initial={{ opacity: 0, y: 40 }}
      // whileInView={{ opacity: 1, y: 0 }}
      // viewport={{ once: true }}
      // whileHover={{ scale: 1.03 }}
      // transition={{ duration: 0.4 }}
      className="
        group relative
        rounded-2xl
        bg-linear-to-br from-[#0b1225]/90 to-[#020617]/90
        border border-white/10
        overflow-hidden
        shadow-[0_20px_80px_rgba(0,0,0,0.6)]
        hover:shadow-cyan-500/20
        hover:shadow-[0_0_60px_rgba(34,211,238,0.25)]
        transition
      "
    >
      <div
        className="
        absolute inset-0 opacity-0 group-hover:opacity-100
        bg-linear-to-r from-cyan-500/20 via-transparent to-purple-500/20
        transition duration-500
      "
      />
      {/* IMAGE */}
      <div className="relative w-full h-44 sm:h-52 lg:h-60">
        <Image
          src={product.image1?.url}
          alt={product.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {/* BADGES */}
        <div className="absolute top-3 left-3 flex gap-2">
          {!product.isActive && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-red-500">
              Inactive
            </span>
          )}
          {product.freeDelivery && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-green-500 text-black">
              <Truck size={10} /> Free
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col">
        <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2">
          {product.title}
        </h3>

        <p className="text-white/60 text-xs sm:text-sm mt-1 line-clamp-2">
          {product.description}
        </p>

        {/* PRICE */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-cyan-400 font-bold text-base sm:text-lg">
            ₹{product.price}
          </span>
        </div>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 mt-2">
          {product.payOnDelivery && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-green-500">
              COD
            </span>
          )}
          <span className="flex items-center  text-green-500 gap-1 text-[10px] px-2 py-1 rounded-full bg-white/10">
            <ShieldCheck size={10} />
            {product.warranty}
          </span>
        </div>

        {/* BUTTON */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handelAddCart}
          className="
            mt-4
            w-full
            flex items-center justify-center gap-2
            py-1
            sm:py-2.5
            rounded-lg
            text-xs
            sm:text-sm font-semibold
            bg-cyan-500 hover:bg-cyan-400
            text-black
            transition
            cursor-pointer
            z-30
          "
        >
          {loading ? (
            <Loader2 className=" animate-spin mx-auto" />
          ) : (
            <>
              {" "}
              <ShoppingCart size={16} />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
