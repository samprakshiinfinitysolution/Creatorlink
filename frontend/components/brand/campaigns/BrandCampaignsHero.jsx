"use client";

import React from "react";

function BuildingIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function BarChartIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function TrendingUpIcon({ className = "w-2.5 h-2.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function InstagramIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.08c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.41z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.82 4.49 6.27 6.27 0 001.87-4.49V8.62a8.28 8.28 0 004.9-1.93v-3z" />
    </svg>
  );
}

export default function BrandCampaignsHero({ onCreateClick = () => { } }) {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-pink-50/70 via-pink-50/40 to-[#ffe4ec]/80 dark:from-[#1e151a] dark:via-surface dark:to-[#1a1418] border border-pink-100/80 dark:border-border-theme rounded-3xl p-6 sm:p-7 lg:p-8 shadow-xs transition-colors">
      {/* Keyframe animations for staggered decorative bar pulses */}
      <style>{`
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
          .bar-anim-1,
          .bar-anim-2,
          .bar-anim-3,
          .bar-anim-4 {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient soft background glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout matching Dashboard Horizontal Balance */}
      <div className="relative z-10 flex flex-col justify-between gap-5 lg:gap-6">
        {/* Top/Main Row: Left Text Section + Right 3 Compact Cards */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-6 xl:gap-8">
          {/* ========================================================= */}
          {/* LEFT SECTION: Breadcrumb + Badge in 1 line, Two-Line Heading, Description */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-3.5">
            {/* Breadcrumb & Badge aligned horizontally on the same line */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary font-sans font-medium">
                <span className="hover:text-foreground transition-colors">Workspace</span>
                <span className="text-text-secondary/40">/</span>
                <span className="text-foreground font-semibold">Campaigns</span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-pink-100/70 dark:bg-pink-950/60 text-secondary border border-pink-200/80 dark:border-pink-900/60 font-sans">
                <BuildingIcon className="w-3 h-3 text-secondary" />
                <span>BRAND WORKSPACE</span>
              </span>
            </div>

            {/* Heading displayed on exactly two lines on desktop */}
            <div className="space-y-0.5">
              <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] text-foreground tracking-tight leading-[1.12]">
                <span className="block">Create Impactful</span>
                <span className="block font-serif italic font-normal text-secondary mt-0.5 sm:mt-1">
                  Campaigns
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed max-w-sm sm:max-w-md pt-0.5">
              Plan, launch, and track your brand collaborations with top creators across multiple platforms.
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SECTION: 3 Compact Cards aligned horizontally */}
          {/* ========================================================= */}
          <div className="w-full lg:flex-1 flex flex-wrap lg:flex-nowrap items-end justify-start lg:justify-end gap-3 lg:gap-3.5 pt-1 lg:pt-0">
            {/* CARD A: Grow Your Brand (~300–320px wide, ~125–135px high) */}
            <div className="w-full sm:w-[300px] lg:w-[300px] xl:w-[315px] min-h-[125px] sm:min-h-[130px] bg-white dark:bg-surface border border-pink-100/90 dark:border-border-theme rounded-2xl p-3.5 shadow-sm shadow-pink-500/5 flex flex-col justify-between shrink-0 rotate-[-2deg] hover:rotate-0 hover:-translate-y-1 transition-all duration-300 ease-out hover:shadow-md hover:shadow-pink-500/10 motion-reduce:transform-none motion-reduce:transition-none cursor-pointer">
              {/* Icon Tile + Title + Description */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/70 border border-pink-100 dark:border-pink-900/50 text-[#ff2d6c] flex items-center justify-center shrink-0">
                  <BarChartIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground font-sans leading-tight">
                    Grow Your Brand
                  </h3>
                  <p className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-text-secondary font-sans leading-snug mt-0.5">
                    Collaborate with the right creators and reach the right audience.
                  </p>
                </div>
              </div>

              {/* Bottom row: Overlapping creator avatars + pink plus icon + +34% reach badge */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-border-theme/60 mt-2">
                <div className="flex items-center -space-x-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp"
                    alt="Creator avatar"
                    className="w-4.5 h-4.5 rounded-full border border-white dark:border-surface object-cover"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://res.cloudinary.com/atr5osne/image/upload/v1792054701/creatorlink/public/avatars/qooau1mzc4okikpsrqri.webp"
                    alt="Creator avatar"
                    className="w-4.5 h-4.5 rounded-full border border-white dark:border-surface object-cover"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://res.cloudinary.com/atr5osne/image/upload/v1792054706/creatorlink/public/avatars/qvmu4uqdqpexdchfnvys.webp"
                    alt="Creator avatar"
                    className="w-4.5 h-4.5 rounded-full border border-white dark:border-surface object-cover"
                  />
                  <span className="w-4.5 h-4.5 rounded-full bg-pink-50 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-900/80 text-[#ff2d6c] flex items-center justify-center text-[9px] font-bold">
                    +
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-sans shrink-0">
                  <TrendingUpIcon className="w-2.5 h-2.5" />
                  <span>+34% reach</span>
                </span>
              </div>
            </div>

            {/* CAPTION + CARD B (Multiple Platforms) */}
            <div className="w-full sm:w-[170px] lg:w-[170px] xl:w-[180px] flex flex-col items-start gap-1 shrink-0">
              {/* Handwritten caption above Card B */}
              <div className="w-full flex items-center justify-between px-1">
                <span className="font-serif italic text-xs text-[#e11d48] dark:text-pink-400 font-semibold tracking-wide select-none">
                  From ideas to impact 💫
                </span>
              </div>

              {/* CARD B: Multiple Platforms (~180–190px wide, ~75–85px high) */}
              <div className="w-full h-[78px] sm:h-[82px] bg-white dark:bg-surface border border-pink-100/90 dark:border-border-theme rounded-2xl p-2.5 sm:p-3 shadow-sm shadow-pink-500/5 flex flex-col justify-between transition-colors">
                <span className="block text-[9.5px] font-bold tracking-wider uppercase text-slate-400 dark:text-text-secondary font-sans">
                  MULTIPLE PLATFORMS
                </span>
                <div className="flex items-center gap-2 pb-0.5">
                  <span
                    className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-2xs transition-transform hover:scale-105"
                    title="Instagram"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </span>
                  <span
                    className="w-6 h-6 rounded-full bg-[#ff0000] text-white flex items-center justify-center shadow-2xs transition-transform hover:scale-105"
                    title="YouTube"
                  >
                    <YouTubeIcon className="w-3.5 h-3.5" />
                  </span>
                  <span
                    className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-2xs transition-transform hover:scale-105"
                    title="TikTok"
                  >
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* CARD C: Track Performance (~180–190px wide, ~75–85px high) */}
            <div className="w-full sm:w-[170px] lg:w-[170px] xl:w-[180px] h-[78px] sm:h-[82px] bg-white dark:bg-surface border border-pink-100/90 dark:border-border-theme rounded-2xl p-2.5 sm:p-3 shadow-sm shadow-pink-500/5 flex items-center justify-between gap-2 shrink-0 transition-colors">
              <div>
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-text-secondary font-sans">
                  Track
                </span>
                <span className="block text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground font-sans leading-tight mt-0.5">
                  Performance
                </span>
              </div>

              {/* Decorative vibrant pink bar-chart icon with 4 ascending bars */}
              <div className="flex items-end gap-1 h-6 pb-0.5 shrink-0 px-1">
                <span className="bar-anim-1 w-1.5 h-2.5 rounded-full bg-pink-200 dark:bg-pink-900/60" />
                <span className="bar-anim-2 w-1.5 h-4 rounded-full bg-pink-300 dark:bg-pink-700/60" />
                <span className="bar-anim-3 w-1.5 h-5 rounded-full bg-pink-400 dark:bg-pink-600/70" />
                <span className="bar-anim-4 w-1.5 h-6 rounded-full bg-[#ff2d6c]" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM-RIGHT: Pink Create Campaign Button */}
        {/* ========================================================= */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onCreateClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#ff2d6c] hover:bg-[#e62060] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#ff2d6c]/25 hover:shadow-lg hover:shadow-[#ff2d6c]/35 hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
}
