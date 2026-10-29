"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { register, loginWithGoogle, verifyOtp } from "@/redux/auth/auth_slice";
import { getGoogleClientId, resendVerificationOtp } from "@/redux/auth/auth_api";
import { requestGoogleAuthCode } from "@/lib/googleAuth";

// =========================================================
// SVG ICONS
// =========================================================
function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

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
// MAIN SIGNUP FORM COMPONENT
// =========================================================
export default function SignupForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState("form"); // "form" | "otp"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("creator");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleGoogleSignup = async () => {
    if (isLoading || isGoogleLoading) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    try {
      let clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        const config = await getGoogleClientId();
        clientId = config?.data?.clientId;
      }

      if (!clientId) {
        setErrorMsg("Google Client ID is not configured. Please contact support.");
        setIsGoogleLoading(false);
        return;
      }

      const code = await requestGoogleAuthCode(clientId);
      const resultAction = await dispatch(loginWithGoogle({ code, role }));

      if (loginWithGoogle.fulfilled.match(resultAction)) {
        const user = resultAction.payload?.data?.user;
        const userRole = user?.role;

        if (userRole === "creator") {
          router.push("/creator/dashboard");
        } else if (userRole === "brand") {
          router.push("/brand/dashboard");
        } else if (userRole === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/login");
        }
      } else {
        const message =
          resultAction.payload ||
          resultAction.error?.message ||
          "Google sign-up failed. Please try again.";
        setErrorMsg(message);
      }
    } catch (err) {
      setErrorMsg(err.message || "Google sign-up was interrupted. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      setErrorMsg("All fields are required");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: cleanName,
        email: cleanEmail,
        password,
        role
      };

      const resultAction = await dispatch(register(userData));

      if (register.fulfilled.match(resultAction)) {
        // Clear sensitive password from component state
        setPassword("");
        setOtp("");
        setStep("otp");
        setResendCooldown(60);
        setSuccessMsg(
          resultAction.payload?.message ||
          `Verification code sent to ${cleanEmail}. Please enter the 6-digit code.`
        );
      } else {
        const message =
          resultAction.payload ||
          resultAction.error?.message ||
          "Registration failed. Please try again.";
        setErrorMsg(message);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isVerifying) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);

    try {
      const resultAction = await dispatch(
        verifyOtp({
          email: email.trim(),
          otp: cleanOtp
        })
      );

      if (verifyOtp.fulfilled.match(resultAction)) {
        setSuccessMsg("Email verified successfully! Welcome to CreatorLink.");
        const user = resultAction.payload?.data?.user;
        const userRole = user?.role || role;

        setTimeout(() => {
          if (userRole === "creator") {
            router.push("/creator/dashboard");
          } else if (userRole === "brand") {
            router.push("/brand/dashboard");
          } else if (userRole === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/login");
          }
        }, 1200);
      } else {
        const message =
          resultAction.payload ||
          resultAction.error?.message ||
          "Verification failed. Please check the code and try again.";
        setErrorMsg(message);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || resendCooldown > 0) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsResending(true);

    try {
      const response = await resendVerificationOtp(email.trim());
      setResendCooldown(60);
      setSuccessMsg(
        response?.message || "A new verification code has been sent to your email."
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to resend verification code. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsResending(false);
    }
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
          <span>CREATORLINK</span>
          <span className="text-secondary text-2xl leading-none">✦</span>
        </Link>
      </div>

      {/* =========================================================
          CENTERED SIGNUP CARD CONTAINER
      ========================================================= */}
      <div className="my-auto max-w-md w-full mx-auto lg:-translate-x-[72px]">
        <div className="bg-surface text-foreground rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-border-theme shadow-sm transition-colors duration-300">
          {/* Card Header */}
          {step === "form" ? (
            <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-6">
              Join CreatorLink
            </h1>
          ) : (
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground mb-2">
                Verify Your Email
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-foreground">{email}</span>.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-secondary hover:underline cursor-pointer font-medium"
                >
                  Change
                </button>
              </p>
            </div>
          )}

          {/* Error & Success Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-sans font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-sans font-medium leading-relaxed">
              {successMsg}
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === "form" && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans"
              >
                Name
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                  <UserIcon />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@collabstr.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans"
              >
                Password
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-secondary pointer-events-none">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/50 text-sm font-sans focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account Type">
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === "creator"}
                  onClick={() => setRole("creator")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-sans font-semibold border text-center transition-all cursor-pointer ${
                    role === "creator"
                      ? "bg-secondary/10 border-secondary text-secondary shadow-xs"
                      : "bg-background border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  Creator
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === "brand"}
                  onClick={() => setRole("brand")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-sans font-semibold border text-center transition-all cursor-pointer ${
                    role === "brand"
                      ? "bg-secondary/10 border-secondary text-secondary shadow-xs"
                      : "bg-background border-border-theme text-text-secondary hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  Brand
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-sans font-semibold text-sm tracking-wide shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-border-theme" />
            <span className="absolute bg-surface px-3 text-xs text-text-secondary font-sans uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Social Sign up Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading || isGoogleLoading}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-background hover:bg-surface-muted disabled:opacity-60 disabled:cursor-not-allowed border border-border-theme text-foreground font-sans font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
            >
              {isGoogleLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting to Google...</span>
                </span>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Sign up with Google</span>
                </>
              )}
            </button>

            {/* Apple Button */}
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-background hover:bg-surface-muted border border-border-theme text-foreground font-sans font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
            >
              <AppleIcon />
              <span>Sign up with Apple</span>
            </button>
          </div>

          {/* Log in Link */}
          <div className="mt-8 text-center text-xs sm:text-sm text-text-secondary font-sans">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="text-secondary font-semibold hover:underline transition-all"
            >
              Log in here
            </Link>
          </div>
            </>
          )}

          {/* =========================================================
              STEP 2: EMAIL OTP VERIFICATION
          ========================================================= */}
          {step === "otp" && (
            <div className="space-y-5">
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground block font-sans"
                  >
                    6-Digit Verification Code
                  </label>

                  <div className="relative flex items-center">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoComplete="one-time-code"
                      autoFocus
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="••••••"
                      required
                      className="w-full text-center text-2xl tracking-[0.45em] font-mono py-3.5 px-4 rounded-xl bg-background border border-border-theme text-foreground placeholder:text-text-secondary/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary font-sans">
                    The code is valid for 10 minutes. Check your spam folder if you do not see it in your inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otp.trim().length !== 6}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary hover:bg-secondary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-sans font-semibold text-sm tracking-wide shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer mt-2"
                >
                  {isVerifying ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <span>Verify & Complete Registration</span>
                  )}
                </button>
              </form>

              {/* Resend Section */}
              <div className="pt-4 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary font-sans gap-2">
                <span>Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || resendCooldown > 0}
                  className="text-secondary font-semibold hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  {isResending ? (
                    "Sending..."
                  ) : resendCooldown > 0 ? (
                    `Resend code in ${resendCooldown}s`
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </div>

              {/* Back to Form link */}
              <div className="pt-2 text-center text-xs text-text-secondary font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-secondary hover:underline cursor-pointer font-medium"
                >
                  ← Back to registration form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          BOTTOM TERMS AND PRIVACY POLICY FOOTER
      ========================================================= */}
      <div className="mt-6 text-center text-xs text-text-secondary font-sans">
        <a href="#" className="hover:text-foreground transition-colors">
          Terms
        </a>
        <span className="mx-1 text-text-secondary font-normal">and</span>
        <a href="#" className="hover:text-foreground transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
