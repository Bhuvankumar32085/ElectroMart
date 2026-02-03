"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handelSubmit = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/sign-up", {
        name,
        email,
        password,
      });

      if (res?.data?.success) {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || "Invalid input");
      } else {
        setErrorMsg("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0f1a] px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-[#12172a] rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center text-cyan-400">
          ElectroMart Signup
        </h1>
        <p className="text-center text-white/60 mt-2">
          Create your account
        </p>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 space-y-4"
        >
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="new-email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400"
          />

          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          <button
            onClick={handelSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold"
          >
            {loading ? (
              <FiLoader className="mx-auto animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>

          <hr className="border-white/10 my-4" />

          {/* Google Signup */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/sign-in" })}
            className="w-full py-3 rounded-xl border border-white/20 flex items-center justify-center gap-3 hover:border-cyan-400"
          >
            <FcGoogle size={22} />
            Sign up with Google
          </button>

          <p className="text-center text-sm text-white/60 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/sign-in")}
              className="text-cyan-400 cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
