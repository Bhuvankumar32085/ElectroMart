"use client";

import { IUser } from "@/model/user.model";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Store,
  Phone,
  MapPin,
  BadgeCheck,
  ArrowRight,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

const ShopCard = ({ allVendorData }: { allVendorData: IUser[] }) => {
  const router = useRouter();

  // 🔹 Empty State Design
  if (!allVendorData || allVendorData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
        <Store size={40} className="text-white/20 mb-3" />
        <h3 className="text-lg font-semibold text-white/80">No shops found</h3>
        <p className="text-xs text-white/40">
          Check back later for new vendors.
        </p>
      </div>
    );
  }

  return (
    // Grid Gap kam kiya (gap-4) aur columns adjust kiye
    <div className="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
      {allVendorData.map((vendor, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          whileHover={{ y: -5 }}
          onClick={() => router.push(`/shop/${vendor._id}`)}
          className="group relative bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col"
        >
          {/* 🔹 IMAGE SECTION (Height Reduced: h-32 mobile, h-36 desktop) */}
          <div className="relative h-32 md:h-36 w-full overflow-hidden bg-gray-900">
            <Image
              src={
                vendor.image && vendor.image.length > 0
                  ? vendor.image
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      vendor.shopName || "Shop",
                    )}&background=06b6d4&color=fff&size=200`
              }
              alt={vendor.shopName || "Shop Image"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-[#111827] via-transparent to-transparent opacity-90" />

            {/* Verification Badge (Smaller Text/Icon) */}
            {vendor.verificationStatus === "approved" && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                <BadgeCheck
                  size={10}
                  fill="currentColor"
                  className="text-cyan-400"
                />
                <span>VERIFIED</span>
              </div>
            )}
          </div>

          {/* 🔹 CONTENT SECTION (Padding Reduced) */}
          <div className="p-3 md:p-4 flex flex-col sm:gap-2 flex-1 relative -mt-5">
            {/* Shop Icon Floating (Size Reduced) */}
            <div className="w-10 h-10 rounded-lg bg-[#0b0f1a] border border-white/10 flex items-center justify-center shadow-lg mb-0.5 group-hover:border-cyan-500/50 transition-colors">
              <Store className="text-cyan-400" size={20} />
            </div>

            {/* Shop Name & Owner */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors truncate">
                {vendor.shopName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-white/50 text-[10px] md:text-xs font-medium">
                <User size={10} />
                <span className="truncate">By {vendor.name}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-white/5 my-0.5"></div>

            {/* Details (Compact Font) */}
            <div className="flex flex-col gap-1.5 text-white/70">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-cyan-500/80 shrink-0 mt-0.5"
                />
                <p className="line-clamp-1 text-[11px] md:text-xs leading-relaxed">
                  {vendor.shopAddress || "Location N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-500/80 shrink-0" />
                <p className="text-[11px] md:text-xs">
                  {vendor.phone || "No contact"}
                </p>
              </div>
            </div>

            {/* 🔹 HOVER BUTTON (Smaller Height) */}
            <div className="mt-auto pt-2">
              <button className="w-full py-2 rounded-lg bg-white/5 border border-white/5 text-white text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 transition-all duration-300">
                Visit Shop{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ShopCard;
