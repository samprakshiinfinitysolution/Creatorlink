"use client";

import React, { useState } from "react";
import Link from "next/link";

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

function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function AppleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.68-.83 1.14-1.99.98-3.17-1 .04-2.22.67-2.91 1.48-.62.72-1.16 1.89-.99 3.03 1.12.09 2.24-.51 2.92-1.34z" />
    </svg>
  );
}

// =========================================================
// MAIN LOGIN FORM COMPONENT
// =========================================================
export default function LoginForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 lg:p-16">
      {/* =========================================================
          MOBILE TOP BRANDING HEADER (VISIBLE ON SMALL SCREENS)
      ========================================================= */}
      <div className="block lg:hidden text-center mb-6 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-serif text-2xl font-medium tracking-wide text-foreground"
        >
          <span>CREATOR</span>
          <span className="text-secondary text-2xl leading-none">•</span>
        </Link>
      </div>

      {/* =========================================================
          CENTERED LOGIN CARD CONTAINER (SHIFTED SLIGHTLY LEFT ON DESKTOP)
      ========================================================= */}
      <div className="my-auto max-w-md w-full mx-auto lg:-translate-x-[72px]">
        <div className="bg-surface text-foreground rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-border-theme shadow-sm transition-colors duration-300">
          {/* Card Title */}
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-sans mb-8">
            Enter your email to sign in to your Creator account.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans"
              >
                Email
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@maisonsynergie.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              <span>Log in with Email</span>
              <span className="text-base leading-none">→</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-border-theme" />
            <span className="absolute bg-surface px-3 text-xs text-text-secondary font-sans uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-background hover:bg-surface-muted border border-border-theme text-foreground font-sans font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
            >
              <GoogleIcon />
              <span>Log in with Google</span>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-background hover:bg-surface-muted border border-border-theme text-foreground font-sans font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
            >
              <AppleIcon />
              <span>Log in with Apple</span>
            </button>
          </div>

          {/* Sign up Link */}
          <div className="mt-8 text-center text-xs sm:text-sm text-text-secondary font-sans">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="text-secondary font-semibold hover:underline transition-all"
            >
              Sign up here
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM TERMS & PRIVACY POLICY FOOTER
      ========================================================= */}
      <div className="mt-6 text-center text-xs text-text-secondary font-sans">
        <a href="#" className="hover:text-foreground transition-colors">
          Terms
        </a>
        <span className="mx-2 text-border-theme">•</span>
        <a href="#" className="hover:text-foreground transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
