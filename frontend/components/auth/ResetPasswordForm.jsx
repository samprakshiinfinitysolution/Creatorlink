"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/redux/auth/auth_api";

// =========================================================
// SVG ICONS
// =========================================================
function LockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeSlashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertCircleIcon({ className = "w-12 h-12" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

function SpinnerIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// =========================================================
// MAIN RESET PASSWORD FORM COMPONENT
// =========================================================
export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);

    if (!token.trim()) {
      setErrorMsg("Reset token is missing or invalid. Please request a new link.");
      return;
    }

    if (!newPassword) {
      setErrorMsg("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters");
      return;
    }

    if (!confirmPassword) {
      setErrorMsg("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation password do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({
        token: token.trim(),
        newPassword,
        confirmPassword
      });

      setIsSuccess(true);
      setSuccessMsg(
        response?.message ||
          "Password reset successfully. You can now log in with your new password."
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. The link may have expired.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 lg:p-16">
      {/* =========================================================
          MOBILE TOP BRANDING HEADER
      ========================================================= */}
      <div className="block lg:hidden text-center mb-6 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-serif text-2xl font-medium tracking-wide text-foreground"
        >
          <span>CREATORLINK</span>
          <span className="text-secondary text-2xl leading-none">✦</span>
        </Link>
      </div>

      {/* =========================================================
          CENTERED CARD CONTAINER
      ========================================================= */}
      <div className="my-auto max-w-md w-full mx-auto lg:-translate-x-[72px]">
        <div className="bg-surface text-foreground rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-border-theme shadow-sm transition-colors duration-300">
          {!token.trim() ? (
            /* Missing Token State */
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-5">
                <AlertCircleIcon />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-3">
                Invalid or Missing Link
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed mb-8">
                This password reset link is invalid, incomplete, or missing a security token. Please request a new link.
              </p>

              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <span>Request new reset link</span>
                </Link>

                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-foreground font-sans font-medium transition-colors py-2"
                >
                  <ArrowLeftIcon />
                  <span>Return to login</span>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary mb-5">
                <CheckCircleIcon />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-3">
                Password Reset!
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed mb-8">
                {successMsg}
              </p>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-xs hover:shadow-md transition-all duration-300"
              >
                <span>Log in to your account</span>
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Card Title */}
              <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-2">
                Set new password
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary font-sans mb-8">
                Create a strong new password with at least 6 characters.
              </p>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-sans font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans"
                  >
                    New password
                  </label>

                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      autoComplete="new-password"
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 text-text-secondary hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans"
                  >
                    Confirm new password
                  </label>

                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      autoComplete="new-password"
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 text-text-secondary hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-sans font-semibold text-sm tracking-wide shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <SpinnerIcon />
                      <span>Resetting password...</span>
                    </span>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-8 text-center text-xs sm:text-sm text-text-secondary font-sans">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-secondary font-semibold hover:underline transition-all"
                >
                  <ArrowLeftIcon />
                  <span>Back to login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================
          BOTTOM FOOTER
      ========================================================= */}
      <div className="mt-6 text-center text-xs text-text-secondary font-sans">
        <a href="#" className="hover:text-foreground transition-colors">
          Terms
        </a>
        <span className="mx-2 text-border-theme">✦</span>
        <a href="#" className="hover:text-foreground transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

