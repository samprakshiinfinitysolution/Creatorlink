"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function BrandFinalCTA() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % 3);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const statusMilestones = [
    {
      id: 1,
      title: "Campaign Created",
      detail: "Brief, target audience & escrow budget initialized.",
    },
    {
      id: 2,
      title: "Creator Matched",
      detail: "4 vetted tastemakers accepted the brief.",
    },
    {
      id: 3,
      title: "Content Approved",
      detail: "High-res deliverables verified & escrow released.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">

      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[160px]" />

      <div className="mx-auto max-w-[1360px] relative z-10">

        {/* =========================================================
            LARGE PREMIUM ROUNDED CTA CONTAINER
        ========================================================= */}
        <div className="relative rounded-[32px] sm:rounded-[44px] bg-gradient-to-br from-[#FFF2F6] via-[#FFF7F9] to-[#FDE8EF] dark:from-secondary/15 dark:via-surface dark:to-tertiary/10 border border-[#FFD5E2] dark:border-secondary/30 p-8 sm:p-12 lg:p-16 shadow-2xl shadow-pink-900/[0.05] overflow-hidden">

          {/* Subtle decorative background ring */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-secondary/10 dark:border-secondary/20" />
          <div className="pointer-events-none absolute -right-32 -bottom-32 w-[440px] h-[440px] rounded-full border border-secondary/5 dark:border-secondary/10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">

            {/* -------------------------------------------------------
                LEFT SIDE: EYEBROW, HEADING, DESCRIPTION, BUTTONS
            ------------------------------------------------------- */}
            <div className="lg:col-span-7 text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
                <span className="text-secondary text-xs">•</span>
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-secondary font-sans">
                  READY TO CREATE?
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-6">
                Bring your next campaign to life.
              </h2>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-text-secondary font-sans leading-relaxed max-w-xl mb-8 sm:mb-10">
                No generic influencer spreadsheets. Just vetted tastemakers, protected escrow contracts, and digital campaign workspaces designed for modern brands.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {/* Primary CTA */}
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-md hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-300"
                >
                  <span>Start a Campaign</span>
                  <span className="text-base leading-none group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>

                {/* Secondary CTA */}
                <Link
                  href="/#discovery"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-white dark:bg-surface/90 hover:bg-white/90 text-foreground border border-black/10 dark:border-white/10 hover:border-secondary/40 font-sans font-semibold text-sm tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>Explore Creators</span>
                  <span className="text-base leading-none">→</span>
                </Link>
              </div>
            </div>

            {/* -------------------------------------------------------
                RIGHT SIDE: CAMPAIGN STATUS CARD
            ------------------------------------------------------- */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white/95 dark:bg-surface/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white dark:border-white/10 shadow-xl shadow-pink-950/5 relative">

                {/* Top header badge */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06] dark:border-white/10">
                  <span className="text-xs font-bold tracking-wider uppercase text-text-muted font-sans">
                    Campaign Milestones
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Escrow Protected
                  </div>
                </div>

                {/* Status Rows */}
                <div className="space-y-4">
                  {statusMilestones.map((milestone, idx) => {
                    const isActive = activeStepIndex === idx;

                    return (
                      <div
                        key={milestone.id}
                        className={`group p-3.5 rounded-xl border transition-all duration-300 ${isActive
                            ? "bg-secondary/[0.07] border-secondary/40 shadow-sm"
                            : "bg-surface-muted/40 border-transparent hover:bg-pink-50/40 dark:hover:bg-white/[0.03]"
                          }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Check Icon */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 ${isActive
                                ? "bg-secondary text-white shadow-md shadow-secondary/30 scale-105"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-secondary/15 group-hover:text-secondary"
                              }`}
                          >
                            ✓
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-sans font-semibold transition-colors duration-200 ${isActive ? "text-secondary" : "text-foreground"
                              }`}>
                              {milestone.title}
                            </h4>
                            <p className="text-xs text-text-secondary font-sans mt-0.5">
                              {milestone.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtle bottom note */}
                <div className="mt-5 pt-4 border-t border-black/[0.05] dark:border-white/10 flex items-center justify-between text-[11px] text-text-muted font-sans">
                  <span>Standard Campaign Workflow</span>
                  <span className="font-semibold text-secondary">Verified Escrow ✦</span>
                </div>
              </div>
            </div>

          </div>
        </div>



      </div>
    </section>
  );
}
