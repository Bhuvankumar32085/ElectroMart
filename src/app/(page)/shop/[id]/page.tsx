"use client";

import { useAppSelector } from "@/redux/hooks";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Package,
  ArrowLeft,
  Star,
  Store,
  Calendar,
} from "lucide-react";
import { IUser } from "@/model/user.model";
import { IProduct } from "@/model/product.model";

interface IReview {
  rating?: number;
}

const Shop = () => {
  const { id } = useParams();
  const vendorId = id as string;
  const router = useRouter();

  const { allVendorData, allProducts } = useAppSelector(
    (store) => store.vendor,
  );

  const vendorData = allVendorData?.find(
    (v: IUser) =>
      (v.verificationStatus === "approved" || v.isApproved) &&
      String(v._id) === vendorId,
  );

  const vendorProducts =
    allProducts?.filter((p) => {
      const pVendorId =
        typeof p.vendor === "object" ? (p.vendor as IUser)._id : p.vendor;
      return String(pVendorId) === vendorId && p.isActive;
    }) || [];

  // Rating Helper
  const getAverageRating = (reviews: IReview[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, curr) => acc + (curr?.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex flex-col items-center justify-center text-white/60">
        <Store size={64} className="mb-4 text-white/20" />
        <h2 className="text-xl font-bold">Shop Not Found</h2>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition text-white"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white pb-20">
      <div className="relative w-full h-48 md:h-64 bg-linear-to-r from-cyan-900 to-[#111827]">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute inset-0 bg-linear-to-t from-[#0b0f1a] via-transparent to-transparent"></div>

        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 md:top-6 md:left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm font-medium hover:bg-white hover:text-black transition flex items-center gap-2 z-20 border border-white/10"
        >
          <ArrowLeft size={16} /> Home
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        {/* Vendor Profile Card */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-6 shadow-2xl">
          {/* Image */}
          <div className="relative -mt-12 md:-mt-16 self-center md:self-start">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl p-1 bg-[#0b0f1a] shadow-xl">
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-gray-800">
                <Image
                  src={
                    vendorData.image && vendorData.image.length > 0
                      ? vendorData.image
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          vendorData.shopName || "Shop",
                        )}&background=06b6d4&color=fff&size=200`
                  }
                  alt={vendorData.shopName || "Shop"}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {vendorData.verificationStatus === "approved" && (
              <div className="absolute -bottom-2 -right-2 bg-black/80 border border-cyan-500 text-cyan-400 p-1.5 rounded-full shadow-lg">
                <BadgeCheck
                  size={14}
                  fill="currentColor"
                  className="text-cyan-400/20"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {vendorData.shopName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-xs md:text-sm text-white/60 mt-1">
                <span className="flex items-center gap-1">
                  <Package size={14} className="text-cyan-400" />
                  {vendorProducts.length} Products
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-cyan-400" />
                  Joined {new Date(vendorData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-white/70 bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone size={14} className="text-cyan-400" /> {vendorData.phone}
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail size={14} className="text-cyan-400" /> {vendorData.email}
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start line-clamp-1">
                <MapPin size={14} className="text-cyan-400" />{" "}
                {vendorData.shopAddress}
              </div>
            </div>
          </div>
        </div>

        {/* ================= COMPACT PRODUCTS GRID ================= */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <Package className="text-cyan-400" size={20} /> Products
          </h3>

          {vendorProducts.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10 text-white/50">
              No products found in this shop.
            </div>
          ) : (
            // 🔹 Compact Grid: Mobile (2 cols), Tablet (3 cols), Desktop (4/5 cols)
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {vendorProducts.map((p: IProduct, i) => {
                const isOutOfStock = !p.isStockAvailable || p.stock <= 0;
                const rating = getAverageRating(p.reviews || []);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/user/product-page/${p._id}`)}
                    className="group bg-[#111827]/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image Area (Compact Aspect Ratio) */}
                    <div className="relative w-full aspect-square bg-black/40 overflow-hidden">
                      <Image
                        src={p.image1?.url}
                        alt={p.title}
                        fill
                        className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                          isOutOfStock ? "grayscale opacity-60" : ""
                        }`}
                      />

                      {/* Minimal Stock Badge */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded">
                            SOLD
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Area (Compact Padding) */}
                    <div className="p-2 md:p-3 flex flex-col gap-1">
                      <div className="flex justify-between items-start text-[9px] md:text-[10px] text-white/50 uppercase tracking-wide">
                        <span className="truncate max-w-[65%]">
                          {p.category}
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400">
                          <Star size={9} fill="currentColor" />{" "}
                          {rating || "New"}
                        </div>
                      </div>

                      <h3 className="text-xs md:text-sm font-medium text-white line-clamp-2 h-8 leading-tight group-hover:text-cyan-400 transition-colors">
                        {p.title}
                      </h3>

                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                        <p className="text-sm md:text-base font-bold text-white">
                          ₹{p.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
