"use client";

import { motion } from "framer-motion";
import { FaStore } from "react-icons/fa";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { IUser } from "@/model/user.model";
import { Mail, Phone, MapPin, BadgeCheck, XCircle, Clock } from "lucide-react";

const VendorDetails = () => {
  const { allVendorData } = useAppSelector((store) => store.vendor);

  const pendingVendors: IUser[] = allVendorData?.filter(
    (v) => v.role === "vendor",
  );

  return (
    <div className="min-h-screen bg-[#0b0f1a] px-4 md:px-8 py-10 text-white">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-10"
      >
        <FaStore size={28} className="text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold">Vendor Details</h1>
          <p className="text-sm text-white/50">
            All registered vendors overview
          </p>
        </div>
      </motion.div>

      {/* EMPTY STATE */}
      {pendingVendors?.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-24 text-white/60">
          <FaStore size={48} className="mb-4 opacity-40" />
          <p>No vendor found</p>
        </div>
      )}

      {/* VENDOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-16">
        {pendingVendors?.map((vendor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="
              relative
              bg-[#111827]/90 backdrop-blur-xl
              border border-white/10
              rounded-3xl p-6
              hover:border-cyan-400/40
              hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]
              transition
            "
          >
            {/* STATUS BADGE */}
            <div className="absolute top-4 right-4">
              {vendor.verificationStatus === "approved" && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-400">
                  <BadgeCheck size={14} /> Approved
                </span>
              )}
              {vendor.verificationStatus === "pending" && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400">
                  <Clock size={14} /> Pending
                </span>
              )}
              {vendor.verificationStatus === "rejected" && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-400">
                  <XCircle size={14} /> Rejected
                </span>
              )}
            </div>

            {/* TOP */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10">
                {vendor?.image ? (
                  <Image
                    src={vendor.image}
                    alt="vendor"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center text-xl text-white/60">
                    {vendor?.shopName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-cyan-400">
                  {vendor.shopName}
                </h2>
                <p className="text-sm text-white/60">Owner: {vendor.name}</p>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="h-px bg-white/10 my-4" />

            {/* DETAILS */}
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-400" />
                <span>{vendor.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-400" />
                <span>{vendor.phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-cyan-400" />
                <span>{vendor.shopAddress}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white/40">GST:</span>
                <span className="font-mono text-xs">{vendor.gstNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40">Product:</span>
                <span className="font-mono text-xs">
                  {vendor?.vendorProducts?.length}
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-6 flex justify-between items-center text-xs text-white/40">
              <span>
                Joined:{" "}
                {vendor.createdAt
                  ? new Date(vendor.createdAt).toLocaleDateString()
                  : "-"}
              </span>
              <span>ID: {String(vendor._id).slice(-6)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VendorDetails;
