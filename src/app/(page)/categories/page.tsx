"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Filter } from "lucide-react";
import Nav from "@/component/Nav";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { IProduct } from "@/model/product.model";
import { useAppSelector } from "@/redux/hooks";

interface IReview {
  rating?: number;
  comment?: string;
}

const categories = [
  "All",
  "Fashion & Lifestyle",
  "Electronics & Gadgets",
  "Food & Grocery",
  "Sports & Fitness",
  "Books & Stationery",
  "Home & Living",
  "Beauty & Personal Care",
  "Toys, Kids & Baby",
];

const CategoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allProducts = useAppSelector((state) => state.vendor.allProducts);
  const initialCategory = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  const [products, setProducts] = useState<IProduct[]>(allProducts);
  const [loading, setLoading] = useState(false);

  const getAverageRating = (reviews: IReview[]) => {
    if (!reviews || !reviews.length) return 0;
    const total = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const query = searchParams.get("query");

        if (activeCategory && activeCategory !== "All") {
          params.set("category", activeCategory);
        }

        if (query) {
          params.set("query", query);
        }

        const res = await axios.get(`/api/search?${params.toString()}`);

        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [activeCategory, searchParams]); // Sirf activeCategory change hone par run hoga


  return (
    <>
      <Nav />

      <div className="min-h-screen bg-[#050812] text-white sm:pt-24 pb-12 px-2 md:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: CATEGORIES */}
          <div className="md:col-span-3 sticky top-24 h-fit z-20 bg-[#050812]/90 backdrop-blur-md py-2 md:py-0">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm md:text-xl font-bold">Categories</h2>
            </div>

            <div className="overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <ul className="flex md:flex-col gap-2 px-1">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`whitespace-nowrap px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all border w-full text-left flex justify-between items-center
                      ${
                        activeCategory === cat
                          ? "bg-linear-to-r from-cyan-600 to-cyan-400 border-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {cat}
                      {activeCategory === cat && (
                        <div className="hidden md:block w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: PRODUCTS GRID */}
          <div className="md:col-span-9">
            <div className="mb-4 px-2">
              <h1 className="text-xl md:text-3xl font-bold text-white">
                {activeCategory === "All" ? "All Products" : activeCategory}
              </h1>
              <p className="text-xs text-white/50 mt-1">
                {products.length} items found
              </p>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                // Loading State
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
              ) : products.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <p className="text-white/50 text-lg">No products found.</p>
                </div>
              ) : (
                // Product Grid
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                >
                  {products.map((product: IProduct) => {
                    const rating = getAverageRating(product.reviews || []);
                    const isOutOfStock =
                      !product.isStockAvailable || product.stock <= 0;

                    return (
                      <motion.div
                        key={String(product._id)}
                        onClick={() =>
                          router.push(`/user/product-page/${product._id}`)
                        }
                        className="group cursor-pointer bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all shadow-md relative"
                      >
                        <div className="relative w-full aspect-4/5 overflow-hidden bg-black/30">
                          <Image
                            src={product.image1.url}
                            alt={product.title}
                            fill
                            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                              isOutOfStock ? "grayscale opacity-50" : ""
                            }`}
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                              <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full">
                                SOLD OUT
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-3 md:p-4 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[10px] md:text-xs text-white/40">
                            <span className="truncate max-w-[60%] capitalize">
                              {product.category}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star fill="currentColor" size={11} />
                              <span>{Number(rating) > 0 ? rating : "New"}</span>
                            </div>
                          </div>

                          <h3 className="text-sm md:text-base font-medium text-gray-200 leading-snug line-clamp-2 h-10">
                            {product.title}
                          </h3>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-base md:text-lg font-bold text-white">
                              ₹{product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
