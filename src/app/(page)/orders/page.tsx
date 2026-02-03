"use client";

import { IOrder } from "@/model/order.model";
import axios from "axios";
import { useEffect, useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrderDetailsModal from "@/component/orderPage/OrderDetailsModal";
import MobileOrderCard from "@/component/orderPage/MobileOrderCard";
import DesktopOrderRow from "@/component/orderPage/DesktopOrderRow";
import Nav from "@/component/Nav";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const OrderPage = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/order/get-orders");
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

  if (loading) return <LoadingScreen />;
  if (!orders.length) return <EmptyState />;

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-[#050812] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#1a233b] via-[#050812] to-black pt-24 px-4 sm:px-6 pb-24 text-white">
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
            <div className="hidden md:block overflow-hidden bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl">
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
                  {orders.map((order) => (
                    <DesktopOrderRow
                      key={order._id?.toString()}
                      order={order}
                      onView={() => setSelectedOrder(order)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS (Hidden on Desktop) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <MobileOrderCard
                  key={order._id?.toString()}
                  order={order}
                  onView={() => setSelectedOrder(order)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* DETAILS MODAL */}
        <AnimatePresence>
          {selectedOrder && (
            <OrderDetailsModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              setOrders={setOrders}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default OrderPage;

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
