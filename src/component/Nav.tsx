"use client";

import { IUser } from "@/model/user.model";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiUser,
  FiSearch,
  FiPhone,
  FiShoppingCart,
} from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileModal from "./ProfileModal";
import { useAppSelector } from "@/redux/hooks";

const Nav = () => {
  const { loggedUser } = useAppSelector((state) => state.user);
  const user: IUser | null = loggedUser;
  console.log("Nav loggedUser:", loggedUser);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: "Shop", href: "/shop" },
    { name: "Orders", href: "/orders" },
  ];


  return (
    <>
      {/* NAVBAR */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-40
        bg-linear-to-r from-[#0b0f1a]/90 to-[#12172a]/90
        backdrop-blur-xl border-b border-white/10"
      >
        <div
          className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4
        flex items-center justify-between gap-4"
        >
          {/* LOGO */}
          <motion.div
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-extrabold tracking-wide
            text-cyan-400 cursor-pointer select-none"
          >
            Electro<span className="text-white">Mart</span>
          </motion.div>

          {/* SEARCH (DESKTOP) */}
          {user?.role == "user" && (
            <div
              className="hidden lg:flex items-center gap-2
          bg-[#0b0f1a] px-4 py-2 rounded-2xl
          border border-white/10 w-85
          focus-within:border-cyan-400 transition"
            >
              <FiSearch
                onClick={() => {
                  router.push(`/categories?query=${encodeURIComponent(query)}`);
                  setQuery("");
                }}
                className="text-cyan-400 text-lg"
              />
              <input
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-white/40"
              />
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* DESKTOP LINKS */}
            {user?.role == "user" && (
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.name}
                    whileHover={{ y: -3 }}
                    className="relative text-white/70 hover:text-cyan-400
                  transition font-medium"
                  >
                    <Link href={link.href}>{link.name}</Link>
                    <span
                      className="absolute left-0 -bottom-1 h-0.5 w-0
                  bg-cyan-400 group-hover:w-full transition-all"
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* ICONS */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.15 }}
                className="p-2 rounded-xl hover:bg-white/5"
              >
                <FiPhone
                  onClick={() => router.push("/support-chat")}
                  className="text-xl text-cyan-400"
                />
              </motion.button>

              {user?.role == "user" && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  onClick={() => router.push("/cart")}
                  className="p-2 rounded-xl hover:bg-white/5"
                >
                  <FiShoppingCart className="text-xl text-cyan-400" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 px-3 py-2
                rounded-2xl border border-white/20
                hover:border-cyan-400 hover:bg-white/5 transition"
              >
                <FiUser className="text-cyan-400" />
                <span className="text-sm text-white hidden sm:block">
                  {user?.name}
                </span>
              </motion.button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden text-2xl text-white ml-1"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />

            {/* DRAWER */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed top-0 right-0 h-screen w-[85%]
              bg-linear-to-b from-[#0b0f1a] to-[#12172a]
              shadow-2xl p-6 z-50"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-cyan-400">Menu</h2>
                <button onClick={() => setOpen(false)}>
                  <FiX className="text-2xl text-white" />
                </button>
              </div>

              {/* SEARCH */}
              {user?.role == "user" && (
                <div
                  className="flex items-center gap-2
              bg-[#0b0f1a] px-4 py-3 rounded-2xl
              border border-white/10 mb-6"
                >
                  <FiSearch
                    onClick={() => {
                      router.push(
                        `/categories?query=${encodeURIComponent(query)}`,
                      );
                      setQuery("");
                    }}
                    className="text-cyan-400"
                  />
                  <input
                    onChange={(e) => setQuery(e.target.value)}
                    value={query}
                    placeholder="Search..."
                    className="bg-transparent outline-none text-sm w-full text-white"
                  />
                </div>
              )}

              {/* LINKS */}
              {user?.role == "user" && (
                <div className="flex flex-col gap-5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-lg text-white/80 hover:text-cyan-400
                    transition font-medium"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* USER */}
              <div
                className="mt-8 border-t border-white/10 pt-6
              flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-full bg-cyan-500
                flex items-center justify-center text-black font-bold"
                >
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{user?.name}</p>
                  <p className="text-xs text-white/50">{user?.email}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PROFILE MODAL */}
      <ProfileModal
        user={user}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
};

export default Nav;
