"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { IOrder } from "@/model/order.model";
import {
  Loader2,
  LucideIcon,
  Package,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { socket } from "@/HookHelper";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const map: Record<
    OrderStatus,
    { text: string; className: string; icon: LucideIcon }
  > = {
    pending: {
      text: "Pending",
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      icon: Loader2,
    },
    confirmed: {
      text: "Confirmed",
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      icon: Package,
    },
    shipped: {
      text: "Shipped",
      className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: Truck,
    },
    delivered: {
      text: "Delivered",
      className: "bg-green-500/10 text-green-400 border-green-500/20",
      icon: Package,
    },
    cancelled: {
      text: "Cancelled",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: X,
    },
    returned: {
      text: "Returned",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: X,
    },
  };

  const config = map[status];
  const Icon = config.icon;

  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon size={12} className={status === "pending" ? "animate-spin" : ""} />
      {config.text}
    </span>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const VendorOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/order/get-vendor-orders");
        if (res.data?.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);


  useEffect(() => {
    socket.on("add-user-order-on-vendorOrders", (data) => {
      const { order } = data;
      if (!order?._id) return;

      setOrders((prev) => {
        const alreadyExists = prev.some(
          (o) => o._id?.toString() === order._id.toString(),
        );

        if (alreadyExists) return prev; // 🔥 yahin bug fix

        return [order, ...prev];
      });
    });

    return () => {
      socket.off("add-user-order-on-vendorOrders");
    };
  }, []);

  useEffect(() => {
    socket.on("order-returned", ({ order }) => {
      if (!order?._id) return;
      setOrders((prev) => prev?.map((o) => (o._id === order._id ? order : o)));
    });

    return () => {
      socket.off("order-returned");
    };
  }, [setOrders]);

  useEffect(() => {
    socket.on("order-cancelled", ({ order }) => {
      if (!order?._id) return;
      setOrders((prev) => prev?.map((o) => (o._id === order._id ? order : o)));
    });

    return () => {
      socket.off("order-cancelled");
    };
  }, []);

  const ORDER_STATUS_OPTIONS: OrderStatus[] = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
  ];

  if (loading) return <LoadingScreen />;
  if (!orders.length) return <EmptyState />;

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await axios.post("/api/order/update-status", {
        orderId,
        status,
      });

      if (res.data?.success) {
        if (status === "delivered") {
          setSelectedOrderId(orderId);
          setOtp("");
          setOtpModalOpen(true);
          return;
        } else {
          setOrders((prev) =>
            prev.map((order) =>
              order._id?.toString() === res?.data?.order?._id?.toString()
                ? { ...order, orderStatus: status }
                : order,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Status update failed", error);

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !selectedOrderId) {
      alert("Enter valid 6 digit OTP");
      return;
    }

    try {
      setOtpLoading(true);

      const res = await axios.post("/api/order/verify-delivery", {
        orderId: selectedOrderId,
        otp,
      });

      if (res.data?.success) {
        const updatedData = res?.data?.order;
        setOrders((prev) =>
          prev.map((order) =>
            order._id?.toString() === selectedOrderId ? updatedData : order,
          ),
        );

        setOtpModalOpen(false);
        alert(res?.data?.message);
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen  text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
              My Orders
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Manage and track your recent purchases
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-white/60">
            Total Orders:{" "}
            <span className="text-cyan-400 font-bold">{orders.length}</span>
          </div>
        </motion.div>

        {/* RESPONSIVE LAYOUT */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* DESKTOP TABLE (Hidden on Mobile) */}
          <div className="hidden md:block overflow-hidden overflow-x-auto no-scrollbar bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl">
            <table className="w-full text-sm text-white">
              <thead className="bg-white/5 text-white/50 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-5 text-left font-medium">Order ID</th>
                  <th className="p-5 text-left font-medium">Product</th>
                  <th className="p-5 text-left font-medium">Date</th>
                  <th className="p-5 text-left font-medium">Status</th>
                  <th className="p-5 text-left font-medium">Total</th>
                  <th className="p-5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const item = order.products[0];

                  return (
                    <motion.tr
                      key={order._id?.toString()}
                      // variants={itemVariants}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="p-5 text-white/60 font-mono">
                        #{String(order._id)?.slice(-6)}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50">
                            <ShoppingBag size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-white/90 truncate max-w-37.5">
                              {item.product.title}
                            </p>
                            <p className="text-xs text-white/40">
                              {order.productVendor?.shopName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-white/60">
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </td>
                      <td className="p-5 flex flex-col items-center gap-2">
                        <div className="flex gap-1 capitalize text-xs">
                          {order.paymentMethod}{" "}
                          {order.isPaid && (
                            <p className="text-yellow-400">Paid</p>
                          )}
                        </div>
                        <StatusBadge
                          status={order.orderStatus as OrderStatus}
                        />
                      </td>

                      <td className="p-5 font-semibold text-cyan-400">
                        ₹{order.totalAmount}
                      </td>
                      <td className="p-5 text-right">
                        {order.orderStatus == "delivered" ? (
                          <p className="text-green-400 ">Delivered</p>
                        ) : order.orderStatus == "cancelled" ? (
                          <p className="text-green-400">cancelled</p>
                        ) : order.orderStatus == "returned" ? (
                          <div className="flex flex-col ">
                            <span className="text-green-400">Returned</span>{" "}
                            <span className="text-yellow-400">
                              {order?.returnedAmount}
                            </span>
                          </div>
                        ) : (
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                order._id!.toString(),
                                e.target.value as OrderStatus,
                              )
                            }
                            className="bg-[#0f1422] border border-white/10 text-white text-xs
             rounded-lg px-3 py-2 outline-none
             focus:border-cyan-400 hover:border-cyan-400 transition"
                          >
                            {ORDER_STATUS_OPTIONS.map((status) => (
                              <option
                                key={status}
                                value={status}
                                className="bg-[#0f1422]"
                              >
                                {status.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS (Hidden on Desktop) */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {orders.map((order) => {
              const item = order.products[0];
              return (
                <motion.div
                  key={order._id?.toString()}
                  // variants={itemVariants}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md active:scale-[0.99] transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-white/10 to-transparent flex items-center justify-center text-cyan-400">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white/90 line-clamp-1">
                          {item.product.title}
                        </h3>
                        <p className="text-xs text-white/50">
                          #{String(order._id)?.slice(-6)} •{" "}
                          {new Date(order.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className=" flex flex-col items-center text-xs gap-1">
                      <StatusBadge status={order.orderStatus as OrderStatus} />
                      <span className="flex gap-1 capitalize text-green-400">
                        {order.paymentMethod}{" "}
                        {order.isPaid && (
                          <p className=" text-yellow-400">Paid</p>
                        )}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-xs text-white/40">Total Amount</p>
                      <p className="text-lg font-bold text-cyan-400">
                        ₹{order.totalAmount}
                      </p>
                    </div>
                    {order.orderStatus == "delivered" ? (
                      <p className="text-green-400 text-sm">Delivered</p>
                    ) : order.orderStatus == "cancelled" ? (
                      <p className="text-green-400 text-sm">cancelled</p>
                    ) : order.orderStatus == "returned" ? (
                      <div className="flex flex-col text-sm">
                        <span className="text-green-400">Returned</span>{" "}
                        <span className="text-yellow-400">
                          {order?.returnedAmount}
                        </span>
                      </div>
                    ) : (
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id!.toString(),
                            e.target.value as OrderStatus,
                          )
                        }
                        className="bg-[#0f1422] border border-white/10 text-white text-xs
             rounded-lg px-3 py-2 outline-none"
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* overlay */}
            <div
              onClick={() => setOtpModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-[#0f1422] border border-white/10 rounded-2xl p-6 w-full max-w-sm z-10"
            >
              <h2 className="text-lg font-bold text-white mb-1">
                Verify Delivery OTP
              </h2>
              <p className="text-xs text-white/50 mb-4">
                Ask customer for 6 digit OTP
              </p>

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6 digit OTP"
                className="w-full text-center tracking-widest text-lg bg-black/30
                   border border-white/10 rounded-xl py-3 text-white
                   focus:border-cyan-400 outline-none"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400
                     text-black font-bold disabled:opacity-60"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#050812] flex flex-col items-center justify-center gap-4 text-white">
    <Loader2 size={40} className="animate-spin text-cyan-500" />
    <p className="text-white/40 animate-pulse">Fetching orders...</p>
  </div>
);

const EmptyState = () => (
  <div className="min-h-screen bg-[#050812] flex flex-col items-center justify-center gap-4 text-white">
    <div className="p-6 bg-white/5 rounded-full border border-white/10">
      <Package size={40} className="text-white/20" />
    </div>
    <h3 className="text-xl font-bold text-white/80">No orders found</h3>
    <p className="text-white/40">
      It looks like you have not placed any orders yet.
    </p>
  </div>
);

export default VendorOrders;
