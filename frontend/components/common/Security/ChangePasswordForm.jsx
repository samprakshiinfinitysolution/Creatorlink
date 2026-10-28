"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { changePassword } from "@/redux/auth/auth_slice";

// =========================================================
// SVG ICONS
// =========================================================
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

function KeyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

export default function ChangePasswordForm() {
  const dispatch = useDispatch();

  // Form input states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/Hide password toggle states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Input change handler with auto-clearing of error messages
  const handleChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    setErrorMessage("");
    setSuccessMessage("");
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    } else if (currentPassword && newPassword === currentPassword) {
      errors.newPassword = "New password must be different from current password";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(
        changePassword({
          currentPassword,
          newPassword,
          confirmPassword
        })
      );

      if (changePassword.fulfilled.match(resultAction)) {
        setSuccessMessage("Your password has been changed successfully. All other active sessions have been safely secured.");
        // Reset form inputs after successful update
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFieldErrors({});
      } else {
        const errorPayload = resultAction.payload || "Failed to change password. Please verify your current password.";
        setErrorMessage(typeof errorPayload === "string" ? errorPayload : "Failed to change password");
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || "An unexpected error occurred while changing your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border-theme rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border-theme">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] flex items-center justify-center shrink-0">
            <KeyIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground font-sans">
              Change Account Password
            </h3>
            <p className="text-[11px] text-text-secondary">
              Update your account credentials to keep your profile secure.
            </p>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-sans animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircleIcon className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-600/70 hover:text-emerald-600 dark:text-emerald-400/70 dark:hover:text-emerald-400 text-xs font-semibold cursor-pointer shrink-0 ml-1"
            aria-label="Dismiss success message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-sans animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircleIcon className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-red-500/70 hover:text-red-500 text-xs font-semibold cursor-pointer shrink-0 ml-1"
            aria-label="Dismiss error message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Password Change Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="currentPassword"
            className="text-xs font-semibold text-foreground flex items-center justify-between"
          >
            <span>Current Password</span>
            <span className="text-[11px] text-text-secondary font-normal">Required</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={handleChange(setCurrentPassword, "currentPassword")}
              placeholder="Enter your current password"
              autoComplete="current-password"
              disabled={isSubmitting}
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background border text-xs sm:text-sm font-sans text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 transition-all ${
                fieldErrors.currentPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-border-theme focus:border-[#ff2d6c] focus:ring-[#ff2d6c]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 text-text-secondary hover:text-foreground transition-colors p-1 cursor-pointer"
              title={showCurrent ? "Hide password" : "Show password"}
              aria-label={showCurrent ? "Hide current password" : "Show current password"}
            >
              {showCurrent ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.currentPassword && (
            <p className="text-[11px] text-red-500 font-sans mt-1">
              {fieldErrors.currentPassword}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="newPassword"
            className="text-xs font-semibold text-foreground flex items-center justify-between"
          >
            <span>New Password</span>
            <span className="text-[11px] text-text-secondary font-normal">Min. 6 characters</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="newPassword"
              name="newPassword"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={handleChange(setNewPassword, "newPassword")}
              placeholder="Enter new password (min. 6 characters)"
              autoComplete="new-password"
              disabled={isSubmitting}
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background border text-xs sm:text-sm font-sans text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 transition-all ${
                fieldErrors.newPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-border-theme focus:border-[#ff2d6c] focus:ring-[#ff2d6c]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 text-text-secondary hover:text-foreground transition-colors p-1 cursor-pointer"
              title={showNew ? "Hide password" : "Show password"}
              aria-label={showNew ? "Hide new password" : "Show new password"}
            >
              {showNew ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p className="text-[11px] text-red-500 font-sans mt-1">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-foreground flex items-center justify-between"
          >
            <span>Confirm New Password</span>
            <span className="text-[11px] text-text-secondary font-normal">Must match new password</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={handleChange(setConfirmPassword, "confirmPassword")}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              disabled={isSubmitting}
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background border text-xs sm:text-sm font-sans text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 transition-all ${
                fieldErrors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-border-theme focus:border-[#ff2d6c] focus:ring-[#ff2d6c]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 text-text-secondary hover:text-foreground transition-colors p-1 cursor-pointer"
              title={showConfirm ? "Hide password" : "Show password"}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[11px] text-red-500 font-sans mt-1">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Action Button & Security Note */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] text-text-secondary font-sans order-2 sm:order-1">
            Updating your password securely invalidates old session tokens across other devices.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#252525] hover:bg-[#111111] dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon className="w-4 h-4" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
