"use client";

import { motion } from "framer-motion";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IProduct } from "@/model/product.model";
import axios from "axios";
import { setAllProducts } from "@/redux/selices/vendorSclice";
import { useState } from "react";

const VendorProducts = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allProducts } = useAppSelector((store) => store.vendor);
  const { loggedUser } = useAppSelector((store) => store.user);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const vendorProducts: IProduct[] =
    allProducts?.filter((p: IProduct) => p.vendor._id === loggedUser?._id) ||
    [];


  const handleToggleActive = async (
    productId: string | undefined,
    currentStatus: boolean,
    verificationStatus?: string,
  ) => { 
    if (verificationStatus !== "approved") {
      alert("Only approved products can be activated/deactivated.");
      return;
    }
    try {
      // API CALL
      const res = await axios.put(`/api/vendor/product-isActive-toggle`, {
        productId: productId,
        isActive: !currentStatus,
      });

      if (res.data.success) {
        // update redux
        dispatch(
          setAllProducts(
            allProducts.map((prod: IProduct) =>
              String(prod._id) === String(res.data.product._id)
                ? { ...prod, isActive: res.data.product.isActive }
                : prod,
            ),
          ),
        );
      }
    } catch (error) {
      console.error("Toggle failed", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data.message || "Error toggling product status");
      } else {
        alert("Error toggling product status");
      }
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
        <h1 className="text-3xl font-bold text-cyan-400">My Products</h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/vendor/add-product")}
          className="
            flex items-center gap-2
            px-5 py-3 rounded-2xl
            bg-cyan-500 text-black font-semibold
            shadow-lg shadow-cyan-500/30
            hover:bg-cyan-400 transition
          "
        >
          <FiPlus />
          Add Product
        </motion.button>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {vendorProducts.length === 0 && (
        <div className="h-[60vh] flex flex-col items-center justify-center border border-dashed border-white/20 rounded-2xl bg-[#0b0f1a]">
          <p className="text-white/60">No products added yet</p>
        </div>
      )}

      {/* ================= DESKTOP TABLE ================= */}
      {vendorProducts.length > 0 && (
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full border border-white/10 rounded-xl overflow-hidden">
            <thead className="bg-[#0f152b]">
              <tr className="text-left text-sm text-white/70">
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Active</th>
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
                    {product.verificationStatus === "rejected" && (
                      <button
                        onClick={() =>
                          setRejectReason(product.rejectedReason || "No reason")
                        }
                        className="text-xs text-red-400 underline"
                      >
                        View Rejected Reason
                      </button>
                    )}
                  </td>

                  {/* PRICE */}
                  <td className="p-4">₹{product.price}</td>

                  {/* STOCK */}
                  <td className="p-4">{product.stock}</td>

                  {/* VERIFICATION */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-3 py-1 w-fit rounded-full text-xs font-semibold
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
                    </div>
                  </td>

                  {/* ACTIVE */}

                  <td className="p-4 text-center">
                    <ToggleSwitch2
                      checked={product.isActive as boolean}
                      onChange={() =>
                        handleToggleActive(
                          product?._id?.toString(),
                          product.isActive as boolean,
                          product.verificationStatus as string,
                        )
                      }
                    />
                  </td>

                  {/* ACTION */}
                  <td className="p-4">
                    <button
                      onClick={() =>
                        router.push(`/vendor/update-product/${product._id}`)
                      }
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                    >
                      <FiEdit2 />
                      Edit
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <p
                  className={`text-xs  capitalize ${
                    product.verificationStatus === "approved"
                      ? "text-green-400"
                      : product.verificationStatus === "pending"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  <span className=" text-white/40">Status: </span>
                  {product.verificationStatus}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <ToggleSwitch2
                checked={product.isActive as boolean}
                onChange={() =>
                  handleToggleActive(
                    product?._id?.toString(),
                    product.isActive as boolean,
                    product.verificationStatus as string
                  )
                }
              />
              {product.verificationStatus === "rejected" && (
                <button
                  onClick={() =>
                    setRejectReason(product.rejectedReason || "No reason")
                  }
                  className="text-xs text-red-400 underline"
                >
                  View Rejected Reason
                </button>
              )}

              <button
                onClick={() =>
                  router.push(`/vendor/update-product/${product._id}`)
                }
                className="text-cyan-400 text-sm flex items-center gap-1"
              >
                <FiEdit2 />
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {rejectReason && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-[#0f152b] p-6 rounded-xl w-[90%] max-w-md"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Rejection Reason
            </h3>
            <p className="text-sm text-white/80">{rejectReason}</p>

            <button
              onClick={() => setRejectReason(null)}
              className="mt-4 w-full bg-cyan-500 text-black py-2 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VendorProducts;

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch2 = ({
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) => {
  return (
    <button
      disabled={disabled}
      onClick={onChange}
      className={`
        relative w-12 h-6 rounded-full transition-colors duration-300
        ${checked ? "bg-green-500" : "bg-red-500"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="
          absolute top-0.5 left-0.5
          w-5 h-5 rounded-full bg-white shadow-md
        "
        style={{
          x: checked ? 24 : 0,
        }}
      />
    </button>
  );
};
