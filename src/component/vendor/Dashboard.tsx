"use client";

import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { useAppSelector } from "@/redux/hooks";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  Box,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { IOrder } from "@/model/order.model";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

// Modern Color Palette for Charts
const COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const { allProducts } = useAppSelector((s) => s.vendor);
  const { loggedUser } = useAppSelector((state) => state.user);
  const [orders, setOrders] = useState<IOrder[]>([]);

  const vendorProduct = allProducts.filter(
    (p) => p.vendor._id == loggedUser?._id,
  );
  const vendorOrder = orders.filter(
    (p) => p.productVendor._id == loggedUser?._id,
  );

  useEffect(() => {
    axios
      .get("/api/order/get-all-orders")
      .then((res) => res.data?.success && setOrders(res.data.orders))
      .catch(console.error);
  }, []);

  /* ================= CORE METRICS ================= */
  const totalRevenue = vendorOrder.reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = vendorOrder.length;

  const activeProducts = vendorProduct.filter((p) => p.isActive).length;
  const outOfStock = vendorProduct.filter((p) => p.stock === 0).length;

  console.log(vendorProduct);

  const pendingProducts = vendorProduct.filter(
    (p) => p.verificationStatus === "pending",
  ).length;

  /* ================= NEW LOGIC: TODAY'S DELIVERED CHART ================= */
  const todayStr = new Date().toDateString(); // e.g. "Tue Feb 03 2026"

  const todaysDeliveredData = vendorOrder
    .filter((o) => {
      // Sirf wahi orders jo 'delivered' hain aur aaj ki date ke hain
      if (o.orderStatus !== "delivered" || !o.deliveryDate) return false;
      return new Date(o.deliveryDate).toDateString() === todayStr;
    })
    .map((o) => ({
      name: new Date(o.deliveryDate!).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }), // Time on X-Axis
      value: o.totalAmount, // Amount on Y-Axis
    }));

  /* ================= EXISTING LOGIC: PIE CHART ================= */
  const orderStatusChart = [
    {
      name: "Pending",
      value: vendorOrder.filter((o) => o.orderStatus === "pending").length,
    },
    {
      name: "Delivered",
      value: vendorOrder.filter((o) => o.orderStatus === "delivered").length,
    },
    {
      name: "Cancelled",
      value: vendorOrder.filter((o) => o.orderStatus === "cancelled").length,
    },
    {
      name: "Returned",
      value: vendorOrder.filter((o) => o.orderStatus === "returned").length,
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto lg:p-8 space-y-8"
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Welcome back, here is what’s happening with your store today.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Data
          </div>
        </div>

        {/* PRIMARY STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={IndianRupee}
            gradient="from-cyan-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={ShoppingCart}
            gradient="from-emerald-500 to-green-600"
            delay={0.1}
          />
          <StatCard
            title="Active Products"
            value={activeProducts}
            icon={Package}
            gradient="from-violet-500 to-purple-600"
            delay={0.2}
          />
        </div>

        {/* ATTENTION SECTION (ALERTS) */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Stock Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AlertStat
              title="Out of Stock Items"
              value={outOfStock}
              type="danger"
              icon={Package}
            />
            <AlertStat
              title="Pending Approvals"
              value={pendingProducts}
              type="warning"
              icon={Box}
            />
          </div>
        </motion.div>

        {/* ================= CHARTS SECTION (2 COLUMNS) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. NEW CHART: TODAY'S DELIVERED ORDERS */}
          <ChartCard title="Today's Delivered Revenue">
            {todaysDeliveredData.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                <Box size={40} className="mb-4 opacity-50" />
                <p>No orders delivered today</p>
              </div>
            ) : (
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={todaysDeliveredData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "#334155", opacity: 0.2 }}
                    />
                    <Bar
                      dataKey="value"
                      name="Revenue"
                      fill="#22d3ee"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          {/* 2. EXISTING CHART: PIE CHART */}
          <ChartCard title="Order Status Breakdown">
            {orders.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                <Box size={40} className="mb-4 opacity-50" />
                <p>No orders data available yet</p>
              </div>
            ) : (
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusChart}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {orderStatusChart.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-slate-300 ml-1">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= STYLED COMPONENTS (No Changes Here) ================= */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  gradient,
}) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
    whileHover={{ y: -5 }}
    className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-black/20 group"
  >
    <div
      className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
    />
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-white mt-1 tracking-tight">
          {value}
        </h3>
      </div>
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
      >
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

interface AlertStatProps {
  title: string;
  value: number;
  type: "warning" | "danger" | "info";
  icon: LucideIcon;
}

const AlertStat: React.FC<AlertStatProps> = ({
  title,
  value,
  type,
  icon: Icon,
}) => {
  const styles = {
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    danger: "bg-red-500/10 border-red-500/20 text-red-500",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  };
  const textColors = {
    warning: "text-amber-400",
    danger: "text-red-400",
    info: "text-blue-400",
  };
  return (
    <div
      className={`flex items-center justify-between p-5 rounded-xl border ${styles[type]} backdrop-blur-sm transition-colors hover:bg-opacity-20`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg bg-slate-950/30 ${textColors[type]}`}>
          <Icon size={20} />
        </div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
      </div>
      <p className={`text-2xl font-bold ${textColors[type]}`}>{value}</p>
    </div>
  );
};

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.95 },
      show: { opacity: 1, scale: 1 },
    }}
    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl"
  >
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
        <TrendingUp size={18} className="text-slate-500" />
      </button>
    </div>
    <div className="w-full bg-slate-800/50 rounded-xl border border-slate-800/50 p-2">
      {children}
    </div>
  </motion.div>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload<number, string>[];
  label?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="font-semibold text-slate-200 mb-1">{String(label)}</p>
        <p className="text-cyan-400">
          {payload[0].name}:{" "}
          <span className="font-bold text-white">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};
