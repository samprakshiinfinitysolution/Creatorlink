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

export default function BrandWelcomeBanner({ user, profile, metrics }) {
  const [imgError, setImgError] = useState(false);

  const brandName =
    profile?.companyName ||
    profile?.brandName ||
    user?.name ||
    profile?.name ||
    "";

  const creatorApps = metrics?.pendingBookings?.creatorApplications || 0;
  const submittedWorkspaces = metrics?.collaborations?.activeStatusBreakdown?.submitted || 0;

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

      {/* Left Content Area */}
      <div className="relative z-10 flex-1 max-w-xl space-y-4">
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
        <div className="space-y-2">
          <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-[40px] text-foreground tracking-tight leading-tight">
            Brand Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
            Track campaigns, creator partnerships, and deliverables in one place.
          </p>
        </div>

        {/* Action Button & Pending Status Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/brand/campaigns"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#ff2d6c] hover:bg-[#e62060] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#ff2d6c]/25 hover:shadow-lg hover:shadow-[#ff2d6c]/35 hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusIcon />
            <span>Create Campaign</span>
          </Link>

          {/* Real Backend Alert Chips if present */}
          {creatorApps > 0 && (
            <Link
              href="/brand/bookings"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <span>{creatorApps} application{creatorApps > 1 ? "s" : ""} to review</span>
              <ArrowUpRightIcon />
            </Link>
          )}

          {submittedWorkspaces > 0 && (
            <Link
              href="/brand/workspace"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <span>{submittedWorkspaces} deliverable{submittedWorkspaces > 1 ? "s" : ""} submitted</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
      </div>

      {/* Right Decorative Composition matching reference */}
      <div className="relative hidden md:flex items-center justify-end w-[350px] lg:w-[420px] h-[190px] lg:h-[210px] shrink-0 select-none">
        {/* 1. "Grow Your Brand" Card with floating animation & staggered bar pulse */}
        <div className="grow-card-floating absolute top-2 left-0 lg:left-4 z-20 bg-white dark:bg-surface border border-pink-100/80 dark:border-border-theme rounded-2xl py-2 px-3.5 shadow-md shadow-pink-500/10 flex items-center gap-3 transition-colors">
          <div className="text-left font-sans leading-tight">
            <span className="block text-[11px] font-bold text-slate-800 dark:text-foreground">Grow</span>
            <span className="block text-[11px] font-bold text-slate-800 dark:text-foreground">Your Brand</span>
          </div>
          <div className="flex items-end gap-1 h-5 pb-0.5">
            <span className="bar-anim-1 w-1.5 h-2 rounded-full bg-pink-200" />
            <span className="bar-anim-2 w-1.5 h-3 rounded-full bg-pink-300" />
            <span className="bar-anim-3 w-1.5 h-4 rounded-full bg-pink-400" />
            <span className="bar-anim-4 w-1.5 h-5 rounded-full bg-[#ff2d6c]" />
          </div>
        </div>

        {/* 2. Floating Pink Megaphone Badge */}
        <div className="absolute top-0 right-[150px] lg:right-[175px] z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-[#ff2d6c] flex items-center justify-center text-white shadow-lg shadow-[#ff2d6c]/30 transform -rotate-12 hover:rotate-0 transition-transform cursor-default">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>

        {/* 3. Circular Creator Photo with outer pink border glow and subtle scale on hover/focus */}
        <div
          tabIndex={0}
          role="img"
          aria-label="Creator collaboration showcase"
          className="group/creator relative w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white dark:border-surface shadow-xl z-10 shrink-0 bg-surface-muted transition-all duration-500 ease-out hover:scale-[1.04] focus:scale-[1.04] focus:outline-none hover:border-[#ff2d6c]/80 dark:hover:border-[#ff4f87] focus:border-[#ff2d6c]/80 dark:focus:border-[#ff4f87] hover:shadow-[0_0_32px_rgba(255,45,108,0.35)] focus:shadow-[0_0_32px_rgba(255,45,108,0.35)] motion-reduce:transform-none motion-reduce:transition-none cursor-pointer"
        >
          {!imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
              alt="Creator collaboration"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/creator:scale-105 group-focus/creator:scale-105 motion-reduce:transform-none"
              onError={() => setImgError(true)}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="https://res.cloudinary.com/atr5osne/image/upload/v1792054762/creatorlink/public/creators/i4nwvw8gvyq69fy8to1e.webp"
              alt="Creator collaboration"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/creator:scale-105 group-focus/creator:scale-105 motion-reduce:transform-none"
            />
          )}
        </div>

        {/* 4. "Collaborate with Top Creators" Card (Kept above image at z-30 with subtle pink shadow on hover/focus) */}
        <div
          tabIndex={0}
          className="absolute -bottom-2 right-0 z-30 bg-white dark:bg-surface border border-pink-100/80 dark:border-border-theme rounded-2xl p-2.5 lg:p-3 shadow-lg shadow-pink-500/10 min-w-[160px] transition-all duration-300 ease-out hover:shadow-[0_10px_30px_rgba(255,45,108,0.22)] focus:shadow-[0_10px_30px_rgba(255,45,108,0.22)] hover:-translate-y-1 focus:-translate-y-1 hover:border-pink-200 dark:hover:border-pink-500/30 focus:outline-none cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-800 dark:text-foreground font-sans leading-tight">
              Collaborate<br />with Top Creators
            </span>
            <span className="w-4 h-4 rounded-full bg-pink-50 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900/60 flex items-center justify-center text-[#ff2d6c] shrink-0">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </span>
          </div>
          <div className="flex items-center -space-x-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp"
              alt="Creator avatar"
              className="w-5 h-5 rounded-full border border-white dark:border-surface object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/atr5osne/image/upload/v1792054701/creatorlink/public/avatars/qooau1mzc4okikpsrqri.webp"
              alt="Creator avatar"
              className="w-5 h-5 rounded-full border border-white dark:border-surface object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/atr5osne/image/upload/v1792054706/creatorlink/public/avatars/qvmu4uqdqpexdchfnvys.webp"
              alt="Creator avatar"
              className="w-5 h-5 rounded-full border border-white dark:border-surface object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
