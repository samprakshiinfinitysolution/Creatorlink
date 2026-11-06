"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import ChangePasswordForm from "@/components/common/Security/ChangePasswordForm";

// =========================================================
// SVG ICONS
// =========================================================
function ShieldLockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function UserCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ArrowTopRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}

export default function CreatorSettingsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user: authUser } = useSelector((state) => state.auth || {});

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Settings Main Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 max-w-4xl w-full mx-auto min-w-0">
          {/* Header Title & Actions Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="mb-2">
                <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                  ACCOUNT MANAGEMENT
                </span>
              </div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide">
                Creator Settings
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
                Manage your creator security credentials, password, and session security.
              </p>
            </div>

            {/* Quick Profile Link */}
            <Link
              href="/creator/profile"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#252525] hover:bg-[#111111] dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <UserCircleIcon className="w-4 h-4" />
              <span>Edit Profile Details</span>
              <ArrowTopRightIcon className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Security & Authentication Section */}
          <section className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-theme">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff0f4] dark:bg-[#2a171f] text-black dark:text-white flex items-center justify-center shrink-0">
                  <ShieldLockIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground font-sans">
                    Security & Authentication
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Manage your password, account credentials, and session security.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Protected
              </span>
            </div>

            {/* Change Password Form Component */}
            <ChangePasswordForm />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-text-secondary">
              <div className="p-3 rounded-xl bg-surface-muted/30 border border-border-theme">
                <span className="block font-medium text-foreground mb-1">Session Protection</span>
                <span>HttpOnly secure cookies protect your authentication tokens from client-side script tampering.</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-muted/30 border border-border-theme">
                <span className="block font-medium text-foreground mb-1">Account Role</span>
                <span className="capitalize">{authUser?.role || "Creator"} Account</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
