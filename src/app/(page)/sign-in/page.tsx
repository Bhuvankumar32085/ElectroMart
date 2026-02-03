"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const session = useSession();
  console.log(session?.data?.user);

  const handleSignin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Signin success", res);
      router.push("/");
    } catch (error) {
      console.error(error);
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
        className="w-full max-w-md bg-[#12172a] rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center text-cyan-400">
          Welcome Back
        </h1>
        <p className="text-center text-white/60 mt-2">
          Sign in to your ElectroMart account
        </p>

        {/* Form */}
        <div className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400"
          />

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            onClick={handleSignin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Google Signin */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full py-3 rounded-xl border border-white/20 flex items-center justify-center gap-3 hover:border-cyan-400"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/60 mt-6">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/sign-up")}
            className="text-cyan-400 cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </motion.div>
    </main>
  );
}
