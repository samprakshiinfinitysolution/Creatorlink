"use client";

import React from "react";
import Link from "next/link";

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function BrandWelcomeBanner({ user, profile, metrics }) {
  const brandName =
    profile?.companyName ||
    profile?.brandName ||
    user?.name ||
    profile?.name ||
    "";

  const creatorApps = metrics?.pendingBookings?.creatorApplications || 0;
  const submittedWorkspaces = metrics?.collaborations?.activeStatusBreakdown?.submitted || 0;

  return (
    <div className="space-y-4 w-full">
      <div className="relative rounded-3xl px-5 sm:px-8 lg:px-10 py-5 sm:py-6 lg:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 min-h-[auto] lg:min-h-[220px] transition-colors overflow-hidden lg:overflow-visible">
      {/* 1. The Card Container Layer with Luminous Wave Background (Light) / Dark Navy Theme (Dark) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden border border-pink-200/90 dark:border-white/10 dark:bg-gradient-to-r dark:from-[#080d1a] dark:via-[#0e1628] dark:to-[#17122a] z-0 shadow-xs pointer-events-none">
        {/* Light Mode: Dreamy Pastel Wave */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Dreamy%20Pastel%20Wave%20Gradient.png"
          alt="Dreamy Pastel Wave Background"
          className="w-full h-full object-cover object-center dark:hidden"
        />

        {/* Dark Mode: Ambient Glow Accents (Eliminates white flashes & patches) */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-14 left-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* 2. Right Side Illustration - Visible ONLY on desktop (lg+), hidden on mobile & tablet */}
      <div className="hidden lg:flex absolute right-0 sm:right-2 bottom-0 pointer-events-none select-none z-10 items-end justify-end lg:h-[116%] lg:max-w-[58%] xl:max-w-[55%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/creator_growth_illustration_trimmed.png"
          alt="Grow Your Brand with Creators"
          className="h-full w-auto max-w-full object-contain object-right-bottom filter drop-shadow-md md:drop-shadow-lg"
        />
      </div>

      {/* 3. Left Content Area */}
      <div className="relative z-20 flex-1 max-w-full lg:max-w-lg space-y-2.5">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-slate-400 font-sans font-medium">
          <span className="hover:text-foreground dark:hover:text-white transition-colors">Workspace</span>
          <span className="text-text-secondary/40 dark:text-slate-600">/</span>
          <span className="text-foreground dark:text-slate-100 font-semibold">Dashboard</span>
          {brandName && (
            <>
              <span className="text-text-secondary/40 dark:text-slate-600">·</span>
              <span className="text-secondary dark:text-pink-400 font-medium">{brandName}</span>
            </>
          )}
        </div>

        {/* Heading & Description */}
        <div className="space-y-1">
          <h1 className="font-serif font-medium text-xl sm:text-2xl lg:text-[34px] xl:text-[36px] text-foreground dark:text-white tracking-tight leading-tight flex items-center gap-2">
            <span>Brand Dashboard</span>
            <span className="text-secondary dark:text-pink-400 text-lg sm:text-xl">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-300 font-sans leading-relaxed">
            Track campaigns, creator partnerships, and deliverables in one place.
          </p>
        </div>

        {/* Action Button & Pending Status Chips */}
        <div className="pt-1 flex flex-wrap items-center gap-2.5">
          <Link
            href="/brand/campaigns"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#252525] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-neutral-950 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#252525]/20 dark:shadow-white/5 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusIcon />
            <span>Create Campaign</span>
          </Link>

          {/* Real Backend Alert Chips if present */}
          {creatorApps > 0 && (
            <Link
              href="/brand/bookings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/30 hover:bg-amber-500/20 dark:hover:bg-amber-400/20 transition-colors"
            >
              <span>{creatorApps} application{creatorApps > 1 ? "s" : ""} to review</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {submittedWorkspaces > 0 && (
            <Link
              href="/brand/workspace"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 dark:border-purple-400/30 hover:bg-purple-500/20 dark:hover:bg-purple-400/20 transition-colors"
            >
              <span>{submittedWorkspaces} deliverable{submittedWorkspaces > 1 ? "s" : ""} submitted</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
      </div>
    </div>

      {/* Onboarding Guidance Banner for incomplete Brand profiles */}
      {!profile?.isOnboarded && (
        <div className="relative rounded-2xl border border-pink-200/90 dark:border-white/10 bg-surface/90 dark:bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 text-[#ff2d6c] flex items-center justify-center shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-sans font-semibold text-sm text-foreground tracking-tight">
                  Complete your Brand Profile
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Setup Incomplete
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add your company essentials, logo, and social links to unlock seamless creator collaborations and verified status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link
              href="/brand/onboarding"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#252525] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-neutral-950 text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Continue Setup</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
