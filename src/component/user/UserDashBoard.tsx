"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ShoppingBasket,
  Dumbbell,
  Car,
  Gift,
  BookOpen,
  Shirt,
  Laptop,
  Home,
  Sparkles,
  Baby,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import ProductGrid from "./ProductGrid";
import { useRouter } from "next/navigation";
import ShopCard from "../ShopCard";

/* ---------------- HERO SLIDER DATA ---------------- */
const images = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
    title: "Smartphones & Accessories",
    desc: "Latest technology at best price",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89",
    title: "High Performance Laptops",
    desc: "Work • Gaming • Creativity",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
    title: "Gaming Zone",
    desc: "Next-level gaming experience",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7",
    title: "Smart Home Devices",
    desc: "Upgrade your lifestyle",
  },
];

/* ---------------- CATEGORY DATA ---------------- */
const categories = [
  { name: "Food & Grocery", icon: ShoppingBasket },
  { name: "Sports & Fitness", icon: Dumbbell },
  { name: "Automotive Accessories", icon: Car },
  { name: "Gift & Handicraft", icon: Gift },
  { name: "Books & Stationery", icon: BookOpen },
  { name: "Fashion & Lifestyle", icon: Shirt },
  { name: "Electronics & Gadgets", icon: Laptop },
  { name: "Home & Living", icon: Home },
  { name: "Beauty & Personal Care", icon: Sparkles },
  { name: "Toys, Kids & Baby", icon: Baby },
];

const UserDashBoard = () => {
  const { allProducts } = useAppSelector((store) => store.vendor);
  const { allVendorData } = useAppSelector((store) => store.vendor);
  console.log("allVendorData", allVendorData);
  const router = useRouter();
  const filtedProducts = allProducts?.filter((P) => P.isActive);
  const [index, setIndex] = useState(0);
  const categoryRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useRef<"left" | "right">("right");
  const verifiedVendor = allVendorData?.filter(
    (v) => v.verificationStatus === "approved",
  );
  /* HERO AUTO SLIDE */
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* CATEGORY AUTO SCROLL */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!categoryRef.current) return;

      const container = categoryRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (scrollDirection.current === "right") {
        container.scrollBy({ left: 220, behavior: "smooth" });

        if (container.scrollLeft >= maxScroll) {
          scrollDirection.current = "left";
        }
      } else {
        container.scrollBy({ left: -220, behavior: "smooth" });

        if (container.scrollLeft <= 0) {
          scrollDirection.current = "right";
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const scrollLeft = () => {
    categoryRef.current?.scrollBy({ left: -220, behavior: "smooth" });
  };

  const scrollRight = () => {
    categoryRef.current?.scrollBy({ left: 220, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-[#0b0f1a] pt-24 space-y-24 overflow-hidden"
    >
      {/* ================= HERO SLIDER ================= */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative h-65 sm:h-90 md:h-120 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,255,255,0.15)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={images[index].id}
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={images[index].url}
                alt={images[index].title}
                fill
                priority
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />

              <div className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 max-w-xl">
                <motion.h2
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl font-bold text-cyan-400"
                >
                  {images[index].title}
                </motion.h2>

                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-white/80"
                >
                  {images[index].desc}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ================= CATEGORY SLIDER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white">
            Shop by Categories
          </h2>

          <div className="flex gap-3">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full border border-white/20 text-white hover:bg-cyan-500 hover:text-black transition"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full border border-white/20 text-white hover:bg-cyan-500 hover:text-black transition"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden ">
          <div
            ref={categoryRef}
            className="flex gap-6 overflow-x-scroll scroll-smooth no-scrollbar  p-4"
          >
            {[...categories, ...categories].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() =>
                    router.push(
                      `/categories?category=${encodeURIComponent(cat.name)}`,
                    )
                  }
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.08 }}
                  className="min-w-30 h-30 md:min-w-45
          bg-[#111827]/80 backdrop-blur-md
          border border-white/10 rounded-2xl
          p-5 flex flex-col items-center justify-center
          hover:border-cyan-400
          hover:shadow-[0_0_25px_rgba(0,255,255,0.25)]
          transition"
                >
                  <Icon className="w-9 h-9 text-cyan-400 mb-3" />
                  <p className="text-xs text-white text-center">{cat.name}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ================= PRODUCTS ================= */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-white mb-8">Products</h2>

        <ProductGrid products={filtedProducts} />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-white mb-8">
          Explore Trusted Shops & Verified Sellers
        </h2>
        <ShopCard allVendorData={verifiedVendor} />
      </div>
    </motion.div>
  );
};

export default UserDashBoard;
