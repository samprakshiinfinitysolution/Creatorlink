"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
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

function BellIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
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

export default function BrandSettingsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [proposalAlerts, setProposalAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const { user: authUser } = useSelector((state) => state.auth || {});
  const { profile: brandProfile } = useSelector((state) => state.brandProfile || {});

  const companyName = brandProfile?.companyName || authUser?.name || "Brand Account";
  const email = authUser?.email || "Not specified";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Settings Main Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 max-w-[1400px] w-full mx-auto min-w-0">
          {/* Header Title & Actions Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] border border-[#ff2d6c]/20 mb-2 font-sans">
                ACCOUNT MANAGEMENT
              </span>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide">
                Brand Settings
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
                Manage your brand credentials, account security, and notification preferences.
              </p>
            </div>

            {/* Quick Profile Link */}
            <Link
              href="/brand/profile"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#252525] hover:bg-[#111111] dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <UserCircleIcon className="w-4 h-4" />
              <span>Edit Profile Details</span>
              <ArrowTopRightIcon className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Settings Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Security & Authentication Section */}
              <section className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-theme">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] flex items-center justify-center shrink-0">
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
                    <span className="capitalize">{authUser?.role || "Brand"} Account</span>
                  </div>
                </div>
              </section>

              {/* 2. Notification Preferences Section */}
              <section className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border-theme">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-surface-muted text-slate-700 dark:text-text-secondary flex items-center justify-center shrink-0">
                    <BellIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground font-sans">
                      Notification Preferences
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Choose which updates and alerts you wish to receive.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Item 1 */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted/30 border border-border-theme cursor-pointer hover:bg-surface-muted/50 transition-colors">
                    <div className="pr-4">
                      <span className="text-xs font-semibold text-foreground block">Email Notifications</span>
                      <span className="text-[11px] text-text-secondary block mt-0.5">
                        Receive important campaign milestones and delivery receipts via email.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#ff2d6c] cursor-pointer"
                    />
                  </label>

                  {/* Item 2 */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted/30 border border-border-theme cursor-pointer hover:bg-surface-muted/50 transition-colors">
                    <div className="pr-4">
                      <span className="text-xs font-semibold text-foreground block">Creator Proposals & Applications</span>
                      <span className="text-[11px] text-text-secondary block mt-0.5">
                        Get alerted instantly when creators apply to your campaigns.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={proposalAlerts}
                      onChange={(e) => setProposalAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#ff2d6c] cursor-pointer"
                    />
                  </label>

                  {/* Item 3 */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted/30 border border-border-theme cursor-pointer hover:bg-surface-muted/50 transition-colors">
                    <div className="pr-4">
                      <span className="text-xs font-semibold text-foreground block">Platform Announcements & Tips</span>
                      <span className="text-[11px] text-text-secondary block mt-0.5">
                        Product updates, marketing insights, and best practices.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
                      className="w-4 h-4 accent-[#ff2d6c] cursor-pointer"
                    />
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Account Snapshot & Quick Links */}
            <div className="space-y-6">
              <section className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border-theme">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-surface-muted text-slate-700 dark:text-text-secondary flex items-center justify-center shrink-0">
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground font-sans">
                      Account Snapshot
                    </h3>
                    <p className="text-[11px] text-text-secondary">
                      Identity & Brand Profile
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-text-secondary block">Company / Brand Name</span>
                    <span className="font-semibold text-foreground block mt-0.5">{companyName}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-text-secondary block">Account Email</span>
                    <span className="font-semibold text-foreground block mt-0.5">{email}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-text-secondary block">Role</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] border border-[#ff2d6c]/20">
                      {authUser?.role || "Brand"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-theme">
                  <Link
                    href="/brand/profile"
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-surface-muted hover:bg-slate-200/60 dark:hover:bg-surface-muted/80 text-foreground transition-colors"
                  >
                    <span>Manage Full Profile</span>
                    <ArrowTopRightIcon className="w-3.5 h-3.5 text-text-secondary" />
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
