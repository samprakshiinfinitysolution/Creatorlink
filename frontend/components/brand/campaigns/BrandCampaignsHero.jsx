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

export default function BrandCampaignsHero({ onCreateClick = () => { } }) {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-pink-50/70 via-pink-50/40 to-[#ffe4ec]/80 dark:from-[#1e151a] dark:via-surface dark:to-[#1a1418] border border-pink-100/80 dark:border-border-theme rounded-3xl min-h-[auto] lg:min-h-[285px] px-5 sm:px-8 lg:px-10 py-6 sm:py-7 lg:py-8 flex flex-col justify-center shadow-xs transition-colors">
      {/* Ambient soft background glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Right Side Illustration - Visible ONLY on desktop (lg+), hidden on mobile & tablet */}
      <div className="hidden lg:flex absolute right-0 bottom-0 pointer-events-none select-none z-10 lg:w-[58%] xl:w-[54%] 2xl:w-[50%] lg:h-[106%] items-end justify-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cheerful_campaigns_illustration_trimmed.png"
          alt="Cheerful Creator Growth Dashboard Illustration"
          className="w-full h-full object-contain object-right-bottom filter drop-shadow-md transition-transform duration-300"
        />
      </div>

      {/* Left Content Section with Create Campaign Button on the LEFT */}
      <div className="relative z-20 w-full max-w-full lg:max-w-lg xl:max-w-xl space-y-3.5">
        {/* Breadcrumb & Badge */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary font-sans font-medium">
            <span className="hover:text-foreground transition-colors">Workspace</span>
            <span className="text-text-secondary/40">/</span>
            <span className="text-foreground font-semibold">Campaigns</span>
          </div>

          <span className="text-[11px] font-bold tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
            BRAND WORKSPACE
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-0.5">
          <h1 className="font-serif font-medium text-2xl sm:text-3xl lg:text-[40px] xl:text-[44px] text-foreground tracking-tight leading-[1.15]">
            <span className="block">Create Impactful</span>
            <span className="flex items-center gap-2 text-secondary mt-0.5 sm:mt-1">
              <span>Campaigns</span>
              <span className="text-xl sm:text-2xl">✦</span>
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed max-w-full lg:max-w-md pt-0.5">
          Plan, launch, and track your brand collaborations with top creators across multiple platforms.
        </p>

        {/* Action Button on the LEFT side */}
        <div className="pt-2 sm:pt-2.5 flex items-center">
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#252525] hover:bg-[#111111] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-[#252525]/20 hover:shadow-lg hover:shadow-[#252525]/30 hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
}
