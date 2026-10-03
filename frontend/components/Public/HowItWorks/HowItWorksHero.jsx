"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground pt-24 sm:pt-28 lg:pt-39 pb-16 sm:pb-20 lg:pb-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">

      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 -translate-y-1/2 h-[550px] w-[750px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[180px]" />

      <div className="mx-auto max-w-[1320px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION, CTAS & STATS
          ------------------------------------------------------- */}
          <div className="lg:col-span-6 text-left">

            {/* 1. Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 bg-[#FCE7F3]/70 dark:bg-secondary/20 border border-pink-200/80 dark:border-pink-500/20 rounded-full px-4 py-1.5 mb-6 shadow-2xs">
              <span className="text-secondary font-bold text-xs">•</span>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-800 dark:text-foreground font-sans">
                HOW CREATOR HUB WORKS
              </span>
            </div>

            {/* 2. Main Editorial Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.12] mb-6">
              From the first idea <br className="hidden sm:inline" />
              to the{" "}
              <span className="inline-block bg-[#FCE7F3] dark:bg-secondary/30 text-slate-900 dark:text-pink-100 rounded-2xl sm:rounded-[22px] px-3.5 sm:px-4 py-0.5 sm:py-1 font-serif text-3xl sm:text-4xl lg:text-[52px] align-baseline shadow-2xs">
                final
              </span>
              <br />
              <span className="inline-block bg-[#FCE7F3] dark:bg-secondary/30 text-slate-900 dark:text-pink-100 rounded-2xl sm:rounded-[22px] px-4 sm:px-6 py-0.5 sm:py-1 font-serif text-3xl sm:text-4xl lg:text-[52px] align-baseline shadow-2xs mt-1">
                collaboration.
              </span>
            </h1>

            {/* 3. Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 sm:mb-10 max-w-xl">
              Creator Hub brings brands and creators together through one simple, structured collaboration journey. No endless email threads, no ambiguous contracts—just pure creative velocity.
            </p>

            {/* 4. Two Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-10 sm:mb-12">
              <Link
                href="/signup"
                className="text-center bg-[#FCE7F3] dark:bg-secondary/30 text-slate-900 dark:text-foreground font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-secondary hover:text-white dark:hover:bg-secondary dark:hover:text-white hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-2xs"
              >
                Start Exploring
              </Link>

              <Link
                href="/signup"
                className="text-center bg-white dark:bg-slate-900/90 text-slate-900 dark:text-foreground font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full border border-slate-200/80 dark:border-white/20 hover:border-secondary hover:text-secondary dark:hover:text-pink-200 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-2xs"
              >
                See How It Works ↓
              </Link>
            </div>

            {/* 5. Stats Row */}
            <div className="pt-8 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-3 gap-4 sm:gap-6 text-left">
              <div className="border-r border-slate-200/80 dark:border-white/10 pr-4 sm:pr-6">
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-foreground block mb-0.5">
                  1,400+
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-text-muted">
                  Curated Creators
                </span>
              </div>

              <div className="border-r border-slate-200/80 dark:border-white/10 pr-4 sm:pr-6">
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-foreground block mb-0.5">
                  99.4%
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-text-muted">
                  Escrow Fulfillment
                </span>
              </div>

              <div>
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-foreground block mb-0.5">
                  48 hrs
                </span>
                <span className="text-xs font-sans text-slate-500 dark:text-text-muted">
                  Average Match Time
                </span>
              </div>
            </div>

          </div>

          {/* -------------------------------------------------------
              RIGHT COLUMN: EDITORIAL VISUAL WITH OVERLAY CARDS & PILLS
          ------------------------------------------------------- */}
          <div className="lg:col-span-6 relative flex flex-col items-center lg:items-end justify-center min-h-[560px] pt-8 pb-28 lg:py-6">

            {/* Outer relative visual box with max-width and right alignment on desktop */}
            <div className="relative w-full max-w-[480px] lg:w-[490px] lg:max-w-[490px]">

              {/* Floating Category Tags Top Left */}
              <div className="absolute -top-7 left-2 sm:-top-8 sm:-left-8 lg:-left-16 z-20 flex flex-col gap-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase rounded-full px-3.5 sm:px-4 py-1.5 shadow-2xs hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 cursor-pointer">
                    DISCOVER
                  </span>
                  <span className="bg-[#FCE7F3] dark:bg-secondary/40 text-slate-900 dark:text-pink-100 border border-pink-200/80 dark:border-pink-500/20 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase rounded-full px-3.5 sm:px-4 py-1.5 shadow-2xs hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 cursor-pointer">
                    COLLABORATE
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="bg-[#FCE7F3]/70 dark:bg-slate-900/95 text-slate-800 dark:text-white border border-pink-200/70 dark:border-white/10 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase rounded-full px-3.5 sm:px-4 py-1.5 shadow-2xs hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 cursor-pointer">
                    PAY
                  </span>
                </div>
              </div>

              {/* Main Image Container */}
              <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[480px] rounded-[32px] sm:rounded-[36px] overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xl group ml-auto">
                <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80" alt="Glow Botanical Mist Campaign" fill className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 50vw" />

                {/* Subtle bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

                {/* Internal Badge & Title */}
                <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 z-10 text-left pointer-events-none">
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase mb-2 inline-block">
                    CASE STUDY · BEAUTY
                  </span>
                  <h3 className="font-sans text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                    Glow Botanical Mist Launch
                  </h3>
                </div>
              </div>

              {/* Floating Live Brief Card (Overlapping bottom-left of image) */}
              <div className="absolute -bottom-12 left-2 sm:-left-10 lg:-left-20 z-30 w-[280px] sm:w-[325px] bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 shadow-xl hover:-translate-y-1 hover:scale-[1.01] hover:border-secondary/40 transition-all duration-300 ease-out cursor-pointer text-left">

                {/* Top Row: Live Brief Label & Approved Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans">
                    LIVE BRIEF
                  </span>
                  <span className="bg-emerald-100/90 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                    APPROVED
                  </span>
                </div>

                {/* Brief Title */}
                <h4 className="font-sans text-base sm:text-lg font-bold text-slate-900 dark:text-foreground mb-3 leading-snug">
                  Glow Botanical Mist<br />Campaign
                </h4>

                <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-text-muted font-medium">
                  <span>₹45,000 Escrow</span>
                  <span>3 Content Units</span>
                </div>
              </div>

              {/* Approval Notification Pill (Centered underneath Live Brief card) */}
              <div className="absolute -bottom-24 left-3 sm:-left-4 lg:-left-10 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-full px-4 py-2 text-xs font-sans text-slate-700 dark:text-text-secondary shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer max-w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span>"Concept reel approved by creative director."</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
