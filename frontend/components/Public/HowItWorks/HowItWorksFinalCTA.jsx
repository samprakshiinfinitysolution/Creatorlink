"use client";

import React from "react";
import Link from "next/link";

export default function HowItWorksFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">

      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[180px]" />

      <div className="mx-auto max-w-[1240px] relative z-10">

        {/* Large Centered Pale-Rose CTA Card */}
        <div className="bg-[#FCE7F3]/75 dark:bg-secondary/[0.14] border border-pink-200/80 dark:border-pink-500/20 rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 lg:p-20 shadow-xs text-center max-w-[1160px] mx-auto">

          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-700 dark:text-slate-300 block mb-5 font-sans text-center">
            THE FUTURE OF CREATIVE ALLIANCES
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.12] mb-6 text-center max-w-3xl mx-auto">
            Ready to create something <br className="hidden sm:inline" />
            meaningful?
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-700 dark:text-text-secondary font-sans font-medium leading-relaxed mb-10 text-center max-w-xl mx-auto">
            Join the invitation-only registry where prestigious brands and visionary creators produce culture together.
          </p>

          {/* Two Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-10 max-w-md mx-auto sm:max-w-none">

            {/* Button 1: Request Access */}
            <Link
              href="/signup"
              className="text-center bg-slate-900 dark:bg-foreground text-white dark:text-slate-900 font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-secondary hover:text-white dark:hover:bg-secondary dark:hover:text-white hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer shadow-md"
            >
              Request Access
            </Link>

            {/* Button 2: Explore Creators */}
            <Link
              href="/creators"
              className="text-center bg-white dark:bg-slate-900/90 text-slate-900 dark:text-foreground border border-slate-200/80 dark:border-white/20 font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-secondary hover:text-white dark:hover:bg-secondary dark:hover:text-white hover:border-secondary hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer shadow-2xs"
            >
              Explore Creators
            </Link>

          </div>

          {/* Bottom Supporting Text */}
          <p className="text-xs sm:text-sm font-sans font-medium text-slate-600 dark:text-slate-400 text-center max-w-xl mx-auto">
            No credit card required. Free onboarding consultation for qualified brands and talent.
          </p>

        </div>

      </div>

    </section>
  );
}
