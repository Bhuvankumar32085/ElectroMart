"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSave, FiPhone } from "react-icons/fi";
import axios from "axios";
import { useRouter } from "next/navigation";

type Role = "user" | "vendor" | "admin";

const roles: Role[] = ["user", "vendor", "admin"];

const EditRoleAndPhone = () => {
  const router = useRouter();
  const [role, setRole] = useState<Role>("user");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setSuccess("");

    try {
      const res = await axios.post("/api/user/edit-role-phone", {
        role,
        phone,
      });
      if (res.data.success) {
        console.log(res.data);
        setSuccess(res.data.message || "Profile updated successfully");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Invalid input");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const FeatchAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/get_admin");
        setIsAdmin(res.data.isAdminCreated);
      } catch (error) {
        console.error(error);
      }
    };
    FeatchAdmin();
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0f1a] px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-[#12172a] rounded-2xl shadow-xl p-8"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-cyan-400">
          Edit Profile
        </h1>
        <p className="text-center text-white/60 mt-2">
          Update your role & phone number
        </p>

        {/* ROLE */}
        <div className="mt-8">
          <label className="block mb-3 text-sm font-semibold text-cyan-500">
            Select Role
          </label>

          <div className="grid grid-cols-3 gap-4">
            {roles.map((r) => {
              const isAdminDisabled = r === "admin" && isAdmin;

              return (
                <motion.button
                  key={r}
                  whileTap={{ scale: isAdminDisabled ? 1 : 0.95 }}
                  disabled={isAdminDisabled}
                  onClick={() => {
                    if (isAdminDisabled) return;
                    setRole(r);
                  }}
                  className={`py-3 rounded-xl border capitalize transition relative
          ${
            role === r
              ? "bg-cyan-500 text-black border-cyan-400"
              : "border-white/20 hover:border-cyan-400"
          }
          ${
            isAdminDisabled &&
            "opacity-40 cursor-not-allowed hover:border-white/20"
          }`}
                >
                  {r}

                  {/* 🔒 LOCK LABEL */}
                  {isAdminDisabled && (
                    <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white px-2 py-[2px] rounded-full">
                      Locked
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* PHONE */}
        <div className="mt-6">
          <label className="block mb-3 text-sm font-semibold text-cyan-500">
            Phone Number
          </label>

          <div className="flex items-center gap-3 border border-white/20 rounded-xl px-4 py-3 focus-within:border-cyan-400">
            <FiPhone className="text-cyan-400" />
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>
        </div>

        {/* SUCCESS */}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 text-sm mt-4 text-center"
          >
            {success}
          </motion.p>
        )}

        {/* SAVE BUTTON */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleUpdate}
          disabled={loading}
          className="w-full mt-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold flex items-center justify-center gap-2"
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <FiSave /> Save Changes
            </>
          )}
        </motion.button>
      </motion.div>
    </main>
  );
};

export default EditRoleAndPhone;
