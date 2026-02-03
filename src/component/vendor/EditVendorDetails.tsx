"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaStore, FaMapMarkerAlt, FaFileInvoice } from "react-icons/fa";

type Props = {
  setOpenEditPage?: (val: boolean) => void;
};

const EditVendorDetails = ({ setOpenEditPage }: Props) => {
  const router = useRouter();
  const [form, setForm] = useState({
    shopName: "",
    shopAddress: "",
    gstNumber: "",
  });
  const [error, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.shopName || !form.shopAddress || !form.gstNumber) {
      alert("Please fill all vendor details");
      return;
    }

    try {
      setLoading(true);
      try {
        const res = await axios.post("/api/vendor/edit-ditalis", form);
        if (res?.data?.success) {
          setOpenEditPage?.(false);
          router.push("/");
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          setErrorMsg(error.response?.data?.message || "Invalid input");
        } else {
          setErrorMsg("Something went wrong");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#0b0f1a] via-[#12172a] to-[#0b0f1a] px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl bg-[#0f1525] border border-white/10 rounded-2xl p-8 shadow-xl"
      >
        {/* ===== HEADER ===== */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-cyan-400"
          >
            Complete Vendor Profile
          </motion.h1>

          <p className="text-sm text-white/60 mt-3">
            Please provide your shop details to access the vendor dashboard
          </p>
        </div>

        {/* ===== FORM ===== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SHOP NAME */}
          <div>
            <label className="text-sm text-white/70 mb-2 flex items-center gap-2">
              <FaStore className="text-cyan-400" />
              Shop Name
            </label>
            <input
              type="text"
              name="shopName"
              placeholder="Enter your shop name"
              value={form.shopName}
              onChange={handleChange}
              className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* SHOP ADDRESS */}
          <div>
            <label className="text-sm text-white/70 mb-2 flex items-center gap-2">
              <FaMapMarkerAlt className="text-cyan-400" />
              Shop Address
            </label>
            <textarea
              name="shopAddress"
              placeholder="Full shop address"
              value={form.shopAddress}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition resize-none"
            />
          </div>

          {/* GST NUMBER */}
          <div>
            <label className="text-sm text-white/70 mb-2 flex items-center gap-2">
              <FaFileInvoice className="text-cyan-400" />
              GST Number
            </label>
            <input
              type="text"
              name="gstNumber"
              placeholder="15 digit GST number"
              value={form.gstNumber}
              onChange={handleChange}
              className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {error && <p className=" text-red-500 text-center">{error}</p>}

          {/* SUBMIT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            type="submit"
            className="w-full mt-4 py-3 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </motion.button>
        </form>

        {/* ===== FOOTER NOTE ===== */}
        <p className="text-xs text-white/40 mt-6 text-center">
          Your details will be verified by admin before approval
        </p>
      </motion.div>
    </div>
  );
};

export default EditVendorDetails;
