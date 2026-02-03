"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const OrderSuccess = () => {
  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
      >
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-white">
          Payment Successful 🎉
        </h1>

        <p className="text-white/60 mt-2 text-sm">
          Your order has been placed successfully.
          You can track your order from the orders page.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/orders"
            className="w-full py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
          >
            View My Orders
          </Link>

          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
