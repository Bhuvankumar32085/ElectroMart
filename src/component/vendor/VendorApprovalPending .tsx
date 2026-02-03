"use client";

import { motion } from "framer-motion";
import { FaClock, FaTimesCircle, FaEdit } from "react-icons/fa";
import { IUser } from "@/model/user.model";
import Nav from "../Nav";
import { useState } from "react";
import EditVendorDetails from "./EditVendorDetails";

type Props = {
  status: "pending" | "rejected";
  reason?: string;
  user: IUser;
};

const VendorApprovalPending = ({ status, reason, user }: Props) => {
  const isRejected = status === "rejected";
  const [opneEditPage, setOpenEditPage] = useState(false);

  if (opneEditPage) {
    return <EditVendorDetails setOpenEditPage={setOpenEditPage} />;
  }

  return (
    <div className="min-h-screen  bg-linear-to-br from-[#0b0f1a] via-[#12172a] to-[#0b0f1a] flex items-center  text-cyan-400 justify-center px-6">
      <Nav user={user} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full rounded-2xl p-8 text-center
        bg-[#111827]/90 backdrop-blur-xl
        border border-white/10 shadow-xl`}
      >
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full
          flex items-center justify-center
          ${isRejected ? "bg-red-500/20" : "bg-yellow-500/20"}`}
        >
          {isRejected ? (
            <FaTimesCircle className="text-red-400 text-3xl" />
          ) : (
            <FaClock className="text-yellow-400 text-3xl" />
          )}
        </div>

        <h2 className="text-xl font-semibold">
          {isRejected ? "Verification Rejected" : "Approval Pending"}
        </h2>

        <p className="text-sm text-white/70 mt-3">
          {isRejected
            ? "Your vendor verification was rejected by admin."
            : "Your vendor profile is under review. Please wait."}
        </p>

        {isRejected && reason && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
            <strong>Reason:</strong> {reason}
          </div>
        )}

        {isRejected && (
          <button
            onClick={() => setOpenEditPage(true)}
            className="mt-6 inline-flex items-center gap-2
            px-5 py-2.5 rounded-xl bg-cyan-500
            text-black font-medium hover:bg-cyan-400 transition"
          >
            <FaEdit />
            Edit Details
          </button>
        )}

        {!isRejected && (
          <p className="text-xs text-yellow-400 mt-4">
            Usually takes 24–48 hours
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default VendorApprovalPending;
