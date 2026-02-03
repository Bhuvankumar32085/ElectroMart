"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStore, FaCheck, FaTimes } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { IUser } from "@/model/user.model";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { setAllVendorData } from "@/redux/selices/vendorSclice";

const VendorApproval = () => {
  const { allVendorData } = useAppSelector((store) => store.vendor);
  const [status, setStatus] = useState<string>("");
  const dispatch = useAppDispatch();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<IUser | null>(null);
  const [reason, setReason] = useState("");
  const [loadingVendorId, setLoadingVendorId] = useState<string | null>(null);

  const pendingVendors: IUser[] = allVendorData?.filter(
    (v) => v.role === "vendor" && v.verificationStatus === "pending",
  );

  const openRejectModal = (vendor: IUser) => {
    setSelectedVendor(vendor);
    setReason("");
    setShowRejectModal(true);
    setStatus("rejected");
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedVendor(null);
    setReason("");
    setStatus("");
  };

  const handleRejectAndApproableSubmit = async (
    vendor: IUser | null,
    actionStatus: "approved" | "rejected",
  ) => {
    if (actionStatus === "rejected" && !reason.trim()) {
      alert("Please enter rejection reason");
      return;
    }
    if (!vendor?._id) {
      alert("Invalid vendor selected");
      return;
    }
    setLoadingVendorId(vendor?._id?.toString() || null);
    try {
      const res = await axios.post("/api/admin/update-vendor-status", {
        vendorId: vendor?._id,
        status: actionStatus,
        rejectedReason: reason,
      });

      if (res?.data?.success) {
        alert(res?.data?.message || "Vendor status updated successfully");
        const aupdateVendorData = allVendorData?.filter(
          (v) => v._id !== vendor._id,
        );
        dispatch(setAllVendorData(aupdateVendorData));
        closeRejectModal();
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoadingVendorId(null);
    }
  };

  return (
    <div className="space-y-6 ">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <FaStore size={26} className="text-cyan-400" />
        <h1 className="text-2xl font-semibold">Vendor Approval</h1>
      </motion.div>

      {/* EMPTY */}
      {pendingVendors?.length === 0 && (
        <div className="text-white/60 text-center mt-20">
          No pending vendor requests 🚀
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {pendingVendors?.map((vendor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="
              bg-[#111827]/90 backdrop-blur-xl
              border border-white/10
              rounded-2xl p-6
            "
          >
            {/* TOP */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  {vendor?.image ? (
                    <Image
                      src={vendor?.image || "/user.png"}
                      alt={"image"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-xl text-white/60">
                      {vendor?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold">{vendor.shopName}</h2>
                  <p className="text-sm text-white/60">Owner: {vendor.name}</p>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400">
                Pending
              </span>
            </div>

            {/* DETAILS */}
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <p>
                <span className="text-white/40">Email:</span> {vendor.email}
              </p>
              <p>
                <span className="text-white/40">Phone:</span> {vendor.phone}
              </p>
              <p>
                <span className="text-white/40">GST:</span> {vendor.gstNumber}
              </p>
              <p>
                <span className="text-white/40">Address:</span>{" "}
                {vendor.shopAddress}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  handleRejectAndApproableSubmit(vendor, "approved");
                }}
                className="flex-1 bg-cyan-500 text-black py-2 cursor-pointer rounded-xl"
              >
                {loadingVendorId === vendor._id?.toString() ? (
                  <Loader2 className="mx-auto animate-spin" />
                ) : (
                  <>
                    <FaCheck className="inline mr-2" />
                    Approve
                  </>
                )}
              </button>

              <button
                onClick={() => openRejectModal(vendor)}
                className="flex-1 bg-red-500/10 text-red-400 py-2 rounded-xl cursor-pointer"
              >
                <FaTimes className="inline mr-2" />
                Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* REJECT MODAL */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="
                bg-[#111827] border border-white/10
                rounded-2xl p-6 w-full max-w-md
              "
            >
              <h2 className="text-lg font-semibold mb-2">Reject Vendor</h2>
              <p className="text-sm text-white/60 mb-4">
                {selectedVendor?.shopName} — {selectedVendor?.name}
              </p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="
                  w-full min-h-25
                  bg-[#0b0f1a] border border-white/10
                  rounded-xl p-3 text-sm text-white
                  focus:outline-none focus:border-red-400
                "
              />

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => {
                    closeRejectModal();
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleRejectAndApproableSubmit(selectedVendor, "rejected");
                    setStatus("rejected");
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white"
                >
                  {loadingVendorId === selectedVendor?._id?.toString() ? (
                    <Loader2 className="mx-auto animate-spin" />
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorApproval;
