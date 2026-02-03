"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Truck,
  CheckCircle,
  Store,
  Phone,
  MapPin,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Nav from "@/component/Nav";
import Footer from "@/component/Footer";
import ProductGrid from "@/component/user/ProductGrid";
import { IProduct } from "@/model/product.model";
import axios from "axios";
import { setAllProducts } from "@/redux/selices/vendorSclice";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { allProducts } = useAppSelector((store) => store.vendor);
  const { loggedUser } = useAppSelector((store) => store.user);

  // ✅ HOOKS ALWAYS ON TOP
  const [activeImg, setActiveImg] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const router=useRouter()
  const product = allProducts.find(
    (p: IProduct) => String(p._id) === String(id),
  );
  const relatedProduct = allProducts
    ?.filter((p) => p.category == product?.category && p._id != product._id)
    .slice(0.6);

  console.log("relatedProduct", product);

  const images = product
    ? [
        product.image1?.url,
        product.image2?.url,
        product.image3?.url,
        product.image4?.url,
      ].filter(Boolean)
    : [];

  useEffect(() => {
    if (!images.length) return;

    const timer = setInterval(() => {
      setActiveImg((p) => (p + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [images.length]);

  const handleReview = async () => {
    setReviewLoading(true);
    setReviewImage(null);
    setComment("");
    setRating(0);
    try {
      const formData = new FormData();
      formData.append("rating", String(rating));
      formData.append("comment", comment);
      formData.append("productId", String(product?._id));
      if (reviewImage) formData.append("reviewImage", reviewImage);

      const res = await axios.post("/api/vendor/add-review", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res?.data?.success) {
        console.log(res.data.product);
        const updateData = allProducts.map((p) =>
          String(p._id) == String(res.data.product._id) ? res.data.product : p,
        );
        dispatch(setAllProducts(updateData));
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Product not found
      </div>
    );
  }

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
        console.log(res);
        alert(res.data.message || "add item");
        router.push('/cart')
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
    <>
      <Nav />
      <div className="min-h-screen bg-linear-to-br from-[#050812] via-[#0b0f1a] to-black pt-24 px-4 pb-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14">
          {/* IMAGE SECTION */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7 }}
          >
            <div className="relative h-75 sm:h-105 rounded-3xl overflow-hidden border border-white/10 bg-white/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  {images.length > 0 && (
                    <Image
                      src={images[activeImg]}
                      alt={product.title}
                      fill
                      className="object-contain p-6"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            <div className="flex justify-center gap-4 mt-5">
              {images.map((img, i) => (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-15 h-15 sm:w-20 sm:h-20 rounded-xl overflow-hidden border
                ${activeImg === i ? "border-cyan-400" : "border-white/10"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* DETAILS */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-white space-y-7"
          >
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
              {product.title}
            </h1>

            <div className="text-white/60 text-sm leading-relaxed">
              <p className={showFullDesc ? "" : "line-clamp-3"}>
                {product.description}
              </p>

              {product.description.length > 300 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-2 text-cyan-400 text-sm font-medium hover:underline"
                >
                  {showFullDesc ? "Read Less ▲" : "Read More ▼"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-cyan-400">
                ₹{product.price}
              </span>
              {product.freeDelivery && (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <Truck size={16} /> Free Delivery
                </span>
              )}
              {/* laptop button */}
              <button
                onClick={handelAddCart}
                className="hidden lg:block py-2 px-3 rounded-xl bg-cyan-500 text-black font-semibold"
              >
                {loading ? (
                  <Loader2 className=" animate-spin mx-auto" />
                ) : (
                  " Add to Cart"
                )}
              </button>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-3">
              {product.payOnDelivery && badge("Cash on Delivery")}
              {badge(`Warranty: ${product.warranty}`)}
              {badge(`Replacement: ${product.replacementDays} Days`)}
              {product.isStockAvailable && product.stock > 0 && badge("In Stock")}
            </div>

            {product.sizes &&
              product.isWearable &&
              product.sizes?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Select Size</h3>

                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm transition
                                  ${
                                    selectedSize === size
                                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                                      : "border-white/20 hover:border-cyan-400 hover:text-cyan-400"
                                  }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* DETAILS POINTS */}
            <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck size={18} /> Highlights
              </h3>
              <ul className="space-y-2 text-white/70 text-sm">
                {product?.detailsPoints?.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>

            {/* SHOP */}
            <div className="rounded-2xl bg-[#0f172a] p-5 border border-white/10">
              <div className="flex gap-4">
                <Image
                  src={product?.vendor?.image || ""}
                  alt=""
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h4 className="font-semibold flex items-center gap-1">
                    <Store size={16} /> {product.vendor.shopName}
                  </h4>
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <CheckCircle size={14} /> Verified Seller
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p className="flex items-center gap-2">
                  <Phone size={14} /> {product.vendor.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} /> {product.vendor.shopAddress}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* related product */}
        <div className="max-w-7xl mx-auto sm:px-4 mt-5">
          <h2 className="text-2xl font-semibold text-white mb-8">
            Related Products
          </h2>
          <ProductGrid products={relatedProduct} />
        </div>

        {/* review */}
        <div className="max-w-7xl mx-auto mt-16">
          <div className="rounded-2xl bg-white/5 p-3 sm:p-6 border border-white/10 space-y-4">
            <h3 className="font-semibold text-lg  text-cyan-400">
              Customer Reviews
            </h3>
            <AnimatePresence>
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border border-white/10 rounded-xl p-4 space-y-4"
                >
                  {/* Rating */}
                  <div>
                    <p className="text-sm mb-1  text-gray-400">Your Rating</p>
                    <StarsInput rating={rating} setRating={setRating} />
                  </div>

                  {/* Comment */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review..."
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 
             rounded-lg p-3 text-sm 
             text-white placeholder-white/40
             focus:outline-none focus:border-cyan-400"
                  />

                  {/* Image upload */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setReviewImage(e.target.files?.[0] || null)
                    }
                    className="text-sm text-white/60"
                  />

                  {/* Submit */}
                  <button
                    disabled={!rating || !comment}
                    onClick={handleReview}
                    className="bg-cyan-500 disabled:bg-white/20 disabled:cursor-not-allowed
        text-black px-6 py-2 rounded-lg font-semibold"
                  >
                    {reviewLoading ? (
                      <Loader2 className=" mx-auto animate-spin" />
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {loggedUser && (
              <button
                onClick={() => setShowReviewForm((p) => !p)}
                className="text-sm text-cyan-400 hover:underline"
              >
                {showReviewForm ? "Close Review ✖" : "Write a Review ✍️"}
              </button>
            )}

            {showReview && (
              <>
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review, i) => (
                    <div
                      key={i}
                      className="border-t flex items-center justify-between  border-white/10 pt-4 space-y-2"
                    >
                      {review.image?.url && (
                        <Image
                          src={review.image.url}
                          alt="review"
                          width={80}
                          height={80}
                          className="w-12 h-12 sm:w-20 sm:h-20 rounded-lg mt-2"
                        />
                      )}
                      <p className="text-xs w-40  sm:w-auto sm:text-sm text-white/70 capitalize truncate">
                        {review.comment}
                      </p>
                      <div className="flex items-center gap-3">
                        <Image
                          src={review.user.image || ""}
                          alt=""
                          width={36}
                          height={36}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full"
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-white/30 font-medium capitalize">
                            {review.user.name}
                          </p>
                          <Stars rating={review.rating} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/50">
                    No reviews yet. Be the first to review this product.
                  </p>
                )}
              </>
            )}

            {loggedUser && (
              <button
                onClick={() => setShowReview(!showReview)}
                className="text-sm ml-4 text-cyan-400 hover:underline"
              >
                {showReview ? "Hide Review ✖" : "Show  Review"}
              </button>
            )}
          </div>
        </div>

        {/* MOBILE STICKY BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t border-white/10 p-4 flex gap-4 lg:hidden">
          <span className="text-xl font-bold text-cyan-400 flex-1">
            ₹{product.price}
          </span>
          <button
            onClick={handelAddCart}
            className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-semibold"
          >
            {loading ? (
              <Loader2 className=" animate-spin mx-auto" />
            ) : (
              " Add to Cart"
            )}
          </button>
        </div>
      </div>

      <Footer user={loggedUser} />
    </>
  );
};

const badge = (text: string) => (
  <span className="px-4 py-1.5 text-xs rounded-full bg-white/10">{text}</span>
);

export default ProductPage;

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex  sm:gap-1 text-yellow-400">
    {Array.from({ length: 5 }).map((_, i) => (
      <span className="text-xs sm:text-sm" key={i}>
        {i < rating ? "★" : "☆"}
      </span>
    ))}
  </div>
);

const StarsInput = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (n: number) => void;
}) => (
  <div className="flex gap-2 text-2xl cursor-pointer">
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        onClick={() => setRating(i + 1)}
        className={i < rating ? "text-yellow-400" : "text-white/30"}
      >
        ★
      </span>
    ))}
  </div>
);
