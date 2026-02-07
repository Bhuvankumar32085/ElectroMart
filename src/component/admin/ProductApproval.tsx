"use client";

import { motion } from "framer-motion";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IProduct } from "@/model/product.model";
import axios from "axios";
import { useState } from "react";
import mongoose from "mongoose";
import { setAllProducts } from "@/redux/selices/vendorSclice";

const ProductApproval = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allProducts } = useAppSelector((store) => store.vendor);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const vendorProducts = allProducts?.filter(
    (product) => product.verificationStatus !== "approved",
  );
  const [rejectedReason, setRejectedReason] = useState<string>("");


  const handleApproval = async (
    productId: string | mongoose.Types.ObjectId | undefined,
    actionStatus: "approved" | "rejected",
  ) => {
    if (!productId) return;
    if (actionStatus === "rejected" && rejectedReason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/admin/update-product-status", {
        productId,
        status: actionStatus,
        rejectedReason: actionStatus === "rejected" ? rejectedReason : "",
      });

      if (response.data.success) {
        alert(response.data.message);
        setSelectedProduct(null);
        setRejectedReason("");
        // Update the local state to reflect the change
        dispatch(
          setAllProducts(
            allProducts.map((prod: IProduct) =>
              String(prod._id) === String(response.data.product._id)
                ? {
                    ...prod,
                    verificationStatus:
                      response.data.product.verificationStatus,
                  }
                : prod,
            ),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen px-4 py-6 text-white"
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-cyan-400">Products</h1>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {vendorProducts.length === 0 && (
        <div className="h-[60vh] flex flex-col items-center justify-center border border-dashed border-white/20 rounded-2xl bg-[#0b0f1a]">
          <p className="text-white/60">No products added yet</p>
        </div>
      )}

      {/* ================= DESKTOP TABLE ================= */}
      {vendorProducts.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border border-white/10 rounded-xl overflow-hidden">
            <thead className="bg-[#0f152b]">
              <tr className="text-left text-sm text-white/70">
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {vendorProducts.map((product, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  {/* PRODUCT */}
                  <td className="p-4 flex items-center gap-3">
                    <Image
                      src={product.image1.url}
                      alt={product.title}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                    <span className="font-medium line-clamp-1">
                      {product.title}
                    </span>
                  </td>

                  {/* PRICE */}
                  <td className="p-4">₹{product.price}</td>

                  {/* STOCK */}
                  <td className="p-4">{product.stock}</td>

                  {/* VERIFICATION */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        product.verificationStatus === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : product.verificationStatus === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {product.verificationStatus}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                    >
                      <FiEdit2 />
                      Check Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed sm:h-full inset-0 z-50 flex items-center justify-center bg-black/60 mb-20 px-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-[#0f152b] rounded-2xl p-6 no-scrollbar text-white overflow-y-auto max-h-[85vh]"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-400">
                Product Details
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* IMAGE */}
            <Image
              src={selectedProduct.image1.url}
              alt={selectedProduct.title}
              width={400}
              height={300}
              // fill
              className="w-full sm:w-[90%] h-60 sm:h-80 object-cover mx-auto rounded-xl mb-4"
            />

            {/* DETAILS */}
            <div className="space-y-2 text-sm">
              <p>
                <b>Title:</b> {selectedProduct.title}
              </p>
              <p>
                <b>Price:</b> ₹{selectedProduct.price}
              </p>
              <p>
                <b>Stock:</b> {selectedProduct.stock}
              </p>
              <p>
                <b>Category:</b> {selectedProduct.category}
              </p>
              <p>
                <b>Warranty:</b> {selectedProduct.warranty}
              </p>
              <p>
                <b>Replacement:</b> {selectedProduct.replacementDays} days
              </p>
              <p>
                <b>COD:</b> {selectedProduct.payOnDelivery ? "Yes" : "No"}
              </p>
              <p>
                <b>Free Delivery:</b>{" "}
                {selectedProduct.freeDelivery ? "Yes" : "No"}
              </p>
              <p>
                <b>Vendor:</b> {selectedProduct.vendor.name}
              </p>
              <p>
                <b>Shop Name:</b> {selectedProduct.vendor.shopName}
              </p>
            </div>

            {/* DETAIL POINTS */}
            {selectedProduct?.detailsPoints?.length &&
              selectedProduct?.detailsPoints?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Details</h3>
                  <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                    {selectedProduct?.detailsPoints?.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* if admin want to reject then reason input */}

            <div className="mt-4">
              <label className="block text-white/70 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectedReason}
                onChange={(e) => setRejectedReason(e.target.value)}
                className="w-full bg-[#0f152b] border border-white/10 rounded-xl p-3 text-white"
                placeholder="Enter rejection reason If You Want to Reject"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                disabled={loading}
                onClick={() => handleApproval(selectedProduct._id, "approved")}
                className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-xl"
              >
                Approve
              </button>

              <button
                disabled={loading}
                onClick={() => handleApproval(selectedProduct._id, "rejected")}
                className="flex-1 bg-red-500 hover:bg-red-400 text-black font-semibold py-3 rounded-xl"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {vendorProducts.map((product, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f152b] border border-white/10 rounded-2xl p-4"
          >
            <div className="flex gap-3">
              <Image
                src={product.image1.url}
                alt={product.title}
                width={80}
                height={80}
                className="rounded-xl object-cover"
              />

              <div className="flex-1">
                <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                <p className="text-sm text-white/60">₹{product.price}</p>
                <p className="text-xs text-white/40">Stock: {product.stock}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setSelectedProduct(product)}
                className="text-cyan-400 text-sm flex items-center gap-1"
              >
                <FiEdit2 />
                Check Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProductApproval;
