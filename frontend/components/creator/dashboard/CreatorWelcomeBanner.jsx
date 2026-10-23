"use client";

import React, { useState } from "react";
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

function CompassIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 7.071-7.071 3.536 3.536-7.071 7.071-3.536z" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

export default function CreatorWelcomeBanner({ user, creator, profile, metrics }) {
  const [imgError, setImgError] = useState(false);

  const welcomeName =
    profile?.displayName ||
    profile?.name ||
    creator?.name ||
    user?.name ||
    profile?.user?.name ||
    "Creator";

  const rawAvatar = profile?.profileImage || creator?.profileImage || user?.avatar || null;

  const initials = (welcomeName || "Creator")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CR";

  const avgRating = Number(metrics?.reviews?.averageRating) || 0;

  const proposalsReceived = metrics?.pendingRequests?.proposalsReceived || 0;
  const submittedWorkspaces = metrics?.activeCollaborations?.breakdown?.submitted || 0;
  const revisionsRequested =
    metrics?.activeCollaborations?.breakdown?.revisionRequested ||
    metrics?.pendingRequests?.revisionsRequested ||
    0;
  const unreadMessages = metrics?.unreadCounts?.messages || 0;
  const activeCount = metrics?.activeCollaborations?.total || 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-pink-50/70 via-pink-50/40 to-[#ffe4ec]/80 dark:from-[#1e151a] dark:via-surface dark:to-[#1a1418] border border-pink-100/80 dark:border-border-theme rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-8 transition-colors">
      {/* Keyframe animations for gentle floating and staggered bar pulse */}
      <style>{`
        @keyframes floatGrowCard {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulseBar1 {
          0%, 100% { transform: scaleY(1); opacity: 0.9; }
          50% { transform: scaleY(0.72); opacity: 0.7; }
        }

        @keyframes pulseBar2 {
          0%, 100% { transform: scaleY(1); opacity: 0.9; }
          50% { transform: scaleY(0.65); opacity: 0.7; }
        }

        @keyframes pulseBar3 {
          0%, 100% { transform: scaleY(1); opacity: 0.95; }
          50% { transform: scaleY(0.70); opacity: 0.75; }
        }

        @keyframes pulseBar4 {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(0.62); opacity: 0.8; }
        }

        .grow-card-floating {
          animation: floatGrowCard 5s ease-in-out infinite;
        }

        .bar-anim-1 {
          transform-origin: bottom;
          animation: pulseBar1 3.2s ease-in-out infinite 0s;
        }

        .bar-anim-2 {
          transform-origin: bottom;
          animation: pulseBar2 3.2s ease-in-out infinite 0.35s;
        }

        .bar-anim-3 {
          transform-origin: bottom;
          animation: pulseBar3 3.2s ease-in-out infinite 0.7s;
        }

        .bar-anim-4 {
          transform-origin: bottom;
          animation: pulseBar4 3.2s ease-in-out infinite 1.05s;
        }

        @media (prefers-reduced-motion: reduce) {
          .grow-card-floating,
          .bar-anim-1,
          .bar-anim-2,
          .bar-anim-3,
          .bar-anim-4 {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient background soft glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Content Area */}
      <div className="relative z-10 flex-1 max-w-xl space-y-4">
        {/* Breadcrumb Navigation & Status */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-sans font-medium">
          <span className="hover:text-foreground transition-colors">Creator Studio</span>
          <span className="text-text-secondary/40">/</span>
          <span className="text-foreground font-semibold">Dashboard</span>
          <span className="text-text-secondary/40">·</span>
          <span className="text-secondary font-medium">{welcomeName}</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="font-heading font-medium text-3xl sm:text-4xl lg:text-[42px] text-foreground tracking-tight leading-tight">
            Welcome back, {welcomeName} ✦
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
            Manage your brand partnerships, track deliverable milestones, and grow your creator collaborations.
          </p>
        </div>

        {/* Primary / Secondary Actions & Actionable Alerts */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/creator/campaigns/discover"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer"
          >
            <CompassIcon />
            <span>Discover Campaigns</span>
          </Link>

          <Link
            href="/creator/services"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-pink-200/80 dark:border-border-theme bg-surface/90 hover:bg-surface text-foreground text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:border-secondary/40 hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusIcon />
            <span>Manage Services</span>
          </Link>

          {/* Actionable Indicator Chips */}
          {proposalsReceived > 0 && (
            <Link
              href="/creator/campaigns"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <span>{proposalsReceived} brand proposal{proposalsReceived > 1 ? "s" : ""}</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {submittedWorkspaces > 0 && (
            <Link
              href="/creator/workspace"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <span>{submittedWorkspaces} under review</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {revisionsRequested > 0 && (
            <Link
              href="/creator/workspace"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              <span>{revisionsRequested} revision{revisionsRequested > 1 ? "s" : ""}</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {unreadMessages > 0 && (
            <Link
              href="/creator/messages"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
            >
              <span>{unreadMessages} unread message{unreadMessages > 1 ? "s" : ""}</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
      </div>

      {/* Right Decorative Composition Matching Brand Dashboard Quality */}
      <div className="relative hidden md:flex items-center justify-end w-[350px] lg:w-[420px] h-[190px] lg:h-[210px] shrink-0 select-none">
        {/* 1. Decorative Studio Visual Card */}
        <div
          aria-hidden="true"
          className="grow-card-floating absolute top-2 left-0 lg:left-4 z-20 bg-white dark:bg-surface border border-pink-100/80 dark:border-border-theme rounded-2xl py-2 px-3.5 shadow-md shadow-pink-500/10 flex items-center gap-3 transition-colors"
        >
          <div className="text-left font-sans leading-tight">
            <span className="block text-[11px] font-semibold text-slate-800 dark:text-foreground">Creator</span>
            <span className="block text-[11px] font-semibold text-slate-800 dark:text-foreground">Studio</span>
          </div>
          <div className="flex items-end gap-1 h-5 pb-0.5">
            <span className="bar-anim-1 w-1.5 h-2 rounded-full bg-black" />
            <span className="bar-anim-2 w-1.5 h-3 rounded-full bg-black" />
            <span className="bar-anim-3 w-1.5 h-4 rounded-full bg-black" />
            <span className="bar-anim-4 w-1.5 h-5 rounded-full bg-black" />
          </div>
        </div>

        {/* 2. Floating Pink Sparkle / Star Badge */}
        <div className="absolute top-0 right-[150px] lg:right-[175px] z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg shadow-black/25 transform rotate-12 hover:rotate-0 transition-transform cursor-default">
          <SparklesIcon className="w-5 h-5" />
        </div>

        {/* 3. Circular Creator Photo or Monogram Initials Placeholder */}
        <div
          tabIndex={0}
          role="img"
          aria-label={`${welcomeName}'s profile avatar`}
          className="group/creator relative w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white dark:border-surface shadow-xl z-10 shrink-0 bg-gradient-to-br from-pink-100 via-pink-50 to-[#ffe4ec] dark:from-[#2a1722] dark:via-[#1e151a] dark:to-surface flex items-center justify-center transition-all duration-500 ease-out hover:scale-[1.04] focus:scale-[1.04] focus:outline-none hover:border-[#ff2d6c]/80 dark:hover:border-[#ff4f87] focus:border-[#ff2d6c]/80 dark:focus:border-[#ff4f87] hover:shadow-[0_0_32px_rgba(255,45,108,0.35)] focus:shadow-[0_0_32px_rgba(255,45,108,0.35)] motion-reduce:transform-none motion-reduce:transition-none cursor-pointer"
        >
          {rawAvatar && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={rawAvatar}
              alt={welcomeName}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/creator:scale-105 group-focus/creator:scale-105 motion-reduce:transform-none"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center select-none text-secondary dark:text-pink-300">
              <span className="font-heading font-medium text-4xl lg:text-5xl tracking-wider">
                {initials}
              </span>
              <span className="text-[10px] font-sans font-medium text-text-secondary mt-1 tracking-wide">
                Creator Profile
              </span>
            </div>
          )}
        </div>

        {/* 4. Active Collaborations Floating Card */}
        <div
          tabIndex={0}
          className="absolute -bottom-2 right-0 z-30 bg-white dark:bg-surface border border-pink-100/80 dark:border-border-theme rounded-2xl p-2.5 lg:p-3 shadow-lg shadow-pink-500/10 min-w-[160px] transition-all duration-300 ease-out hover:shadow-[0_10px_30px_rgba(255,45,108,0.22)] focus:shadow-[0_10px_30px_rgba(255,45,108,0.22)] hover:-translate-y-1 focus:-translate-y-1 hover:border-pink-200 dark:hover:border-pink-500/30 focus:outline-none cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-800 dark:text-foreground font-sans leading-tight">
              Brand Deals &<br />Workspaces
            </span>
            <Link
              href="/creator/workspace"
              className="w-4 h-4 rounded-full bg-pink-50 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900/60 flex items-center justify-center text-[#ff2d6c] shrink-0"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Link>
          </div>
          <div className="flex items-center justify-between text-[10px] font-sans">
            <span className="text-text-secondary">
              {activeCount > 0 ? `${activeCount} in progress` : "0 active"}
            </span>
            {avgRating > 0 ? (
              <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500">
                <span>★</span>
                <span>{avgRating.toFixed(1)}</span>
              </span>
            ) : (
              <span className="text-text-secondary/70">Ready</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
