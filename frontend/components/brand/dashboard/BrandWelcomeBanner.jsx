import React from "react";
import Link from "next/link";

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  const welcomeName =
    profile?.companyName ||
    profile?.brandName ||
    user?.name ||
    profile?.name ||
    user?.email ||
    "Brand";

  const creatorApps = metrics?.pendingBookings?.creatorApplications || 0;
  const submittedWorkspaces = metrics?.collaborations?.activeStatusBreakdown?.submitted || 0;

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-colors">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20">
            Brand Overview
          </span>
          {creatorApps > 0 && (
            <Link
              href="/brand/bookings"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <span>{creatorApps} application{creatorApps > 1 ? "s" : ""} to review</span>
              <ArrowUpRightIcon />
            </Link>
          )}
          {submittedWorkspaces > 0 && (
            <Link
              href="/brand/workspace"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <span>{submittedWorkspaces} deliverable{submittedWorkspaces > 1 ? "s" : ""} submitted</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>

        <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
          Welcome back, {welcomeName} ✦
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
          Here is your campaign performance, creator proposals, and ongoing workspace deliverables today.
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <Link
          href="/brand/campaigns"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <PlusIcon />
          <span>Create Campaign</span>
        </Link>
      </div>
    </div>
  );
}
