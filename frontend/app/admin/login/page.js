"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "@/redux/admin/auth/admin_auth_slice";

// =========================================================
// SVG ICONS
// =========================================================
function ShieldLockIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.adminAuth || {});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError("Email and password are required.");
      return;
    }

    const actionResult = await dispatch(
      adminLogin({
        email: email.trim(),
        password
      })
    );

    if (adminLogin.fulfilled.match(actionResult)) {
      router.push("/admin/dashboard");
    } else {
      setFormError(
        actionResult.payload || "Authentication failed. Check your admin credentials."
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 text-emerald-400 mb-2 shadow-inner">
            <ShieldLockIcon className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold tracking-wider uppercase">
            Admin Console
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
            CreatorLink Staff
          </h1>
          <p className="text-xs text-neutral-400">
            Sign in with your authorized administrator credentials to manage platform operations.
          </p>
        </div>

        {/* Error Notification */}
        {(formError || error) && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
            {formError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Staff Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Console"}
          </button>
        </form>

        {/* Footer Security Note */}
        <div className="text-center pt-2 border-t border-neutral-800/60">
          <p className="text-[11px] text-neutral-500">
            Protected by isolated administrative session security.
          </p>
        </div>
      </div>
    </div>
  );
}

