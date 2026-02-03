"use client";

import { IUser } from "@/model/user.model";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

type FooterProps = {
  user?: IUser | null;
};

const Footer = ({ user }: FooterProps) => {
  const router = useRouter();
  const quickLinks = (() => {
    if (!user) {
      return ["Home", "Login", "Register", "Shop"];
    }

    if (user.role === "admin") {
      return [
        "Platform Management",
        "Vendor Control",
        "Orders & Revenue",
        "System Security",
      ];
    }

    if (user.role === "vendor") {
      return [
        "Product Upload & Edit",
        "Order & Delivery Tracking",
        "Sales & Profile Analytics",
        "Wallet & Settlement",
        user.isApproved ? "Add Product" : "Approval Pending",
      ];
    }

    // normal user
    return ["Home", "Shop", "Categories", "My Orders"];
  })();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-[#0b0f1a] w-full border-t border-white/10 text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* ================= BRAND ================= */}
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">ElectroMart</h2>
          <p className="text-sm text-white/70 mt-4 leading-relaxed">
            Smart marketplace for users, vendors & admins. Secure • Fast •
            Reliable
          </p>

          {user && (
            <p className="mt-4 text-xs text-cyan-400">
              Logged in as: <span className="capitalize">{user.role}</span>
              {user.role === "vendor" && !user.isApproved && (
                <span className="text-yellow-400 ml-2">(Approval Pending)</span>
              )}
            </p>
          )}
        </div>

        {/* ================= QUICK LINKS ================= */}
        <div>
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {user?.role == "user" ? "Quick Links" : `${user?.role} Role`}
          </h3>
          <ul className="space-y-3 text-sm text-white/70">
            {quickLinks.map((item) => (
              <li
                key={item}
                onClick={() =>
                  item == "Home"
                    ? router.push("/")
                    : item == "Shop"
                    ? router.push("/shop")
                    : item == "Categories"
                    ? router.push("/categories")
                    : item == "My Orders" && router.push("/orders")
                }
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ================= SUPPORT ================= */}
        {user?.role == "user" ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {["Help Center", "Orders"].map((item) => (
                <li
                  key={item}
                  onClick={() =>
                    item == "Help Center"
                      ? router.push("/support")
                      : item == "Orders" && router.push("/orders")
                  }
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>

            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-cyan-400" />
                <span>New Delhi, India</span>
              </li>

              <li className="flex items-center gap-3">
                <FaEnvelope className="text-cyan-400" />
                <span>{user?.email}</span>
              </li>

              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-cyan-400" />
                <span>+{user?.phone}</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/60">
        © {new Date().getFullYear()} ElectroMart. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;
