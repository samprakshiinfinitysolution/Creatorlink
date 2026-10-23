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
    <div className="relative mt-2 sm:mt-3 lg:mt-14 rounded-3xl px-5 sm:px-8 lg:px-10 py-5 sm:py-6 lg:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 min-h-[auto] lg:min-h-[220px] transition-colors overflow-hidden lg:overflow-visible">
      {/* 1. The Card Container Layer with Luminous Wave Background & Full Border */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden border border-pink-200/90 dark:border-border-theme z-0 shadow-xs pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Dreamy%20Pastel%20Wave%20Gradient.png"
          alt="Dreamy Pastel Wave Background"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle dark-mode protection overlay */}
        <div className="absolute inset-0 hidden dark:block bg-black/40" />
      </div>

      {/* 2. Right Side Illustration - Visible ONLY on desktop (lg+), hidden on mobile & tablet */}
      <div className="hidden lg:flex absolute right-0 sm:right-2 bottom-0 pointer-events-none select-none z-10 items-end justify-end lg:h-[126%] lg:max-w-[58%] xl:max-w-[55%]">
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
        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-sans font-medium">
          <span className="hover:text-foreground transition-colors">Workspace</span>
          <span className="text-text-secondary/40">/</span>
          <span className="text-foreground font-semibold">Dashboard</span>
          {brandName && (
            <>
              <span className="text-text-secondary/40">·</span>
              <span className="text-secondary font-medium">{brandName}</span>
            </>
          )}
        </div>

        {/* Heading & Description */}
        <div className="space-y-1">
          <h1 className="font-serif font-medium text-xl sm:text-2xl lg:text-[34px] xl:text-[36px] text-foreground tracking-tight leading-tight flex items-center gap-2">
            <span>Brand Dashboard</span>
            <span className="text-secondary text-lg sm:text-xl">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
            Track campaigns, creator partnerships, and deliverables in one place.
          </p>
        </div>

        {/* Action Button & Pending Status Chips */}
        <div className="pt-1 flex flex-wrap items-center gap-2.5">
          <Link
            href="/brand/campaigns"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#252525] hover:bg-[#111111] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#252525]/20 hover:shadow-lg hover:shadow-[#252525]/30 hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusIcon />
            <span>Create Campaign</span>
          </Link>

          {/* Real Backend Alert Chips if present */}
          {creatorApps > 0 && (
            <Link
              href="/brand/bookings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <span>{creatorApps} application{creatorApps > 1 ? "s" : ""} to review</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {submittedWorkspaces > 0 && (
            <Link
              href="/brand/workspace"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <span>{submittedWorkspaces} deliverable{submittedWorkspaces > 1 ? "s" : ""} submitted</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
