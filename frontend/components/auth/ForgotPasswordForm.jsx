"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/redux/auth/auth_api";

// =========================================================
// SVG ICONS
// =========================================================
function MailIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
// MAIN FORGOT PASSWORD FORM COMPONENT
// =========================================================
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("Please enter your email address");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg("Please provide a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(cleanEmail);

      const notRegisteredMessage =
        "This email is not registered. Please check your email or create an account.";
      if (response?.message === notRegisteredMessage) {
        setErrorMsg(notRegisteredMessage);
        return;
      }

      setIsSuccess(true);
      setSuccessMsg(
        response?.message ||
          "If an account with that email exists, a password reset link has been sent."
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to request password reset. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setErrorMsg(null);
    setEmail("");
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
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary mb-5">
                <CheckCircleIcon />
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-3">
                Check your email
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed mb-6">
                {successMsg}
              </p>

              <div className="p-3.5 rounded-xl bg-background border border-border-theme text-xs text-text-secondary font-sans leading-relaxed mb-6 text-left">
                <p className="font-semibold text-foreground mb-1">What to do next:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your inbox and spam folder for <span className="text-foreground font-medium">{email}</span></li>
                  <li>Click the link inside to set a new password within 15 minutes</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <ArrowLeftIcon />
                  <span>Return to login</span>
                </Link>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full text-xs text-text-secondary hover:text-foreground font-sans font-medium transition-colors py-2 cursor-pointer"
                >
                  Need to try a different email?
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Card Title */}
              <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-2">
                Forgot password?
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary font-sans mb-8">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-sans font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans"
                  >
                    Email address
                  </label>

                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                      <MailIcon />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@creatorlink.com"
                      required
                      autoComplete="email"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
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
                      <span>Sending reset link...</span>
                    </span>
                  ) : (
                    <span>Send Reset Link</span>
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

