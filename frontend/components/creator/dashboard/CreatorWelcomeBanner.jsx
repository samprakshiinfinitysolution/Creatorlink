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

function CompassIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 7.071-7.071 3.536 3.536-7.071 7.071-3.536z" />
    </svg>
  );
}

export default function CreatorWelcomeBanner({ user, creator, profile, metrics }) {
  const welcomeName =
    profile?.displayName ||
    profile?.name ||
    creator?.name ||
    user?.name ||
    profile?.user?.name ||
    "Creator";

  const proposalsReceived = metrics?.pendingRequests?.proposalsReceived || 0;
  const submittedWorkspaces = metrics?.activeCollaborations?.breakdown?.submitted || 0;
  const revisionsRequested =
    metrics?.activeCollaborations?.breakdown?.revisionRequested ||
    metrics?.pendingRequests?.revisionsRequested ||
    0;
  const unreadMessages = metrics?.unreadCounts?.messages || 0;

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-colors">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20">
            Creator Overview
          </span>

          {proposalsReceived > 0 && (
            <Link
              href="/creator/campaigns"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <span>{proposalsReceived} brand proposal{proposalsReceived > 1 ? "s" : ""} received</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {submittedWorkspaces > 0 && (
            <Link
              href="/creator/workspace"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <span>{submittedWorkspaces} deliverable{submittedWorkspaces > 1 ? "s" : ""} under review</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {revisionsRequested > 0 && (
            <Link
              href="/creator/workspace"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              <span>{revisionsRequested} revision{revisionsRequested > 1 ? "s" : ""} requested</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {unreadMessages > 0 && (
            <Link
              href="/creator/messages"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
            >
              <span>{unreadMessages} unread message{unreadMessages > 1 ? "s" : ""}</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>

        <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
          Welcome back, {welcomeName} ✦
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
          Here is your collaboration performance, upcoming deliverables, and client feedback today.
        </p>
      </div>

      <div className="shrink-0 flex flex-wrap items-center gap-3">
        <Link
          href="/creator/campaigns/discover"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-theme bg-surface hover:bg-surface-muted text-foreground text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
        >
          <CompassIcon />
          <span>Discover Campaigns</span>
        </Link>
        <Link
          href="/creator/services"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <PlusIcon />
          <span>Add Service</span>
        </Link>
      </div>
    </div>
  );
}
