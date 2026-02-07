"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBox, FaCheckCircle, FaShoppingBag, FaStore } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import Dashboard from "./Dashboard";
import VendorDetails from "./VendorDetails";
import UserOrders from "./UserOrders";
import VendorApproval from "./VendorApproval";
import ProductApproval from "./ProductApproval";
import { useAppSelector } from "@/redux/hooks";

const sideMenu = [
  { id: "dashboard", label: "Dashboard", icon: MdDashboard },
  { id: "vendor", label: "Vendor", icon: FaStore },
  { id: "orders", label: "Orders", icon: FaShoppingBag },
  {
    id: "vendor-approval",
    label: "Vendor Approval",
    icon: FaCheckCircle,
  },
  {
    id: "product-approval",
    label: "Product Approval",
    icon: FaBox,
  },
];

const AdminDashBoard = () => {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex pt-18 min-h-screen w-full bg-[#0b0f1a] text-white overflow-hidden">
      {/*  SIDEBAR  */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-60 hidden md:flex flex-col
        bg-[#111827]/90 backdrop-blur-xl
        border-r border-white/10 max-h-screen"
      >
        <nav className="flex-1 space-y-2 px-4 mt-5">
          {sideMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300
                ${
                  active === item.id
                    ? "bg-cyan-500 text-black shadow-lg"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </motion.aside>

      {/*  MAIN CONTENT  */}
      <div className="flex-1  max-h-screen  p-6 md:p-10  overflow-y-auto no-scrollbar pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
          >
            {renderComponent(active)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/*MOBILE BOTTOM MENU  */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-50
  md:hidden bg-[#111827]/95 backdrop-blur-xl
  border-t border-white/10"
      >
        <div className="flex justify-around items-center h-16">
          {sideMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex flex-col items-center justify-center
  transition-all duration-300
  ${active === item.id ? "text-cyan-400 scale-110" : "text-white/70"}`}
              >
                <Icon size={22} />
                {active === item.id && (
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashBoard;

const renderComponent = (active: string) => {
  switch (active) {
    case "dashboard":
      return <Dashboard />;

    case "vendor":
      return <VendorDetails />;

    case "orders":
      return <UserOrders />;

    case "vendor-approval":
      return <VendorApproval />;

    case "product-approval":
      return <ProductApproval />;

    default:
      return null;
  }
};
