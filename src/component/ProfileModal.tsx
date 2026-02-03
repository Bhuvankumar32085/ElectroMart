"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiLogOut, FiEdit } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { IUser } from "@/model/user.model";
import Image from "next/image";
import axios from "axios";
import { useAppDispatch } from "@/redux/hooks";
import { setLoggedUser } from "@/redux/selices/userSclice";

interface ProfileModalProps {
  user: IUser | null;
  open: boolean;
  onClose: () => void;
}

const ProfileModal = ({ user, open, onClose }: ProfileModalProps) => {
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || "");
  const [shopName, setShopName] = useState(user?.shopName || "");
  const [shopAddress, setShopAddress] = useState(user?.shopAddress || "");
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.image || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditMode(false);
    setName(user?.name || '');
    setPhone(user?.phone || "");
    setShopName(user?.shopName || "");
    setShopAddress(user?.shopAddress || "");
    setGstNumber(user?.gstNumber || "");
    setImageFile(null);
    setPreview(user?.image || "");
  }, [open, user]);

  // Image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("shopName", shopName);
      formData.append("shopAddress", shopAddress);
      formData.append("gstNumber", gstNumber);
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }
      const res = await axios.post("/api/user/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        alert("Profile updated successfully!");
        dispatch(setLoggedUser(res.data.user));
        setEditMode(false);
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Something went wrong!");
      } else {
        alert("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* MODAL */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[90%] max-w-md bg-[#12172a] rounded-2xl p-6 md:p-8 shadow-2xl"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-cyan-400">Profile</h2>
              <button onClick={onClose}>
                <FiX className="text-xl text-white" />
              </button>
            </div>

            {/* USER INFO */}
            <div
              className={`flex ${editMode ? "flex-col" : ""} items-center gap-4 mb-6`}
            >
              <div className="relative w-15 h-15 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden text-black font-bold text-lg">
                {preview ? (
                  <Image
                    src={preview}
                    alt={name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{name?.[0]?.toUpperCase()}</span>
                )}
              </div>

              {!editMode ? (
                <div className="text-start md:text-left">
                  <p className="text-white font-medium">{name}</p>
                  <p className="text-sm text-white/60">{user?.email}</p>
                  <p className="text-xs text-cyan-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  {/* Image Upload */}
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">
                      Profile Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-white/60 border border-white/20 rounded-xl px-3 py-2 bg-[#0b0f1a] focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1 block">
                      Full Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0f1a] border border-white/20 focus:outline-none focus:border-cyan-400 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1 block">
                      Phone
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0f1a] border border-white/20 focus:outline-none focus:border-cyan-400 text-white"
                    />
                  </div>

                  {user?.role === "vendor" && (
                    <>
                      <div>
                        <label className="text-xs text-white/50 mb-1 block">
                          Shop Name
                        </label>
                        <input
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0b0f1a] border border-white/20 focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1 block">
                          Shop Address
                        </label>
                        <input
                          value={shopAddress}
                          onChange={(e) => setShopAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0b0f1a] border border-white/20 focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1 block">
                          GST Number
                        </label>
                        <input
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0b0f1a] border border-white/20 focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row gap-3">
              {!editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="
                      w-full flex items-center justify-center gap-2
                      px-5 py-3 rounded-2xl
                      text-cyan-400 font-semibold
                      border-2 border-cyan-400
                      shadow-lg shadow-cyan-500/30
                      hover:bg-cyan-400 hover:text-white
                      transition-all duration-300
                      active:scale-95
                    "
                  >
                    <FiEdit className="text-lg" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="
                      w-full flex items-center justify-center gap-2
                      px-5 py-3 rounded-2xl
                      bg-red-500/10 text-red-400 font-semibold
                      border-2 border-red-400
                      shadow-lg shadow-red-500/30
                      hover:bg-red-500/20 hover:text-white
                      transition-all duration-300
                      active:scale-95
                    "
                  >
                    <FiLogOut className="text-lg" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
