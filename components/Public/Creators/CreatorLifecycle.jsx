"use client";

import React, { useState } from "react";

export default function CreatorLifecycle() {
  // Clean static data structure ready for future backend integration
  const [lifecycleSteps] = useState([
    {
      number: "01",
      title: "Identity",
      description: "Publish your visual lookbook and rate card with zero clutter.",
    },
    {
      number: "02",
      title: "Discover",
      description: "Let compatible fashion & lifestyle brands come directly to you.",
    },
    {
      number: "03",
      title: "Collaborate",
      description: "Lock deliverables, timeline, and escrow upfront with clear mutual terms.",
    },
    {
      number: "04",
      title: "Create",
      description: "Produce high-fidelity imagery and reels true to your aesthetic voice.",
    },
    {
      number: "05",
      title: "Earn",
      description: "Guaranteed instant payouts deposited the second deliverables approve.",
    },
    {
      number: "06",
      title: "Grow",
      description: "Accumulate verified reviews, private brand retainers, and reputation equity.",
    },
  ]);

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            09 / THE LIFECYCLE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            Create. Collaborate. Grow.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            A seamless lifelong loop for the modern independent aesthetic entrepreneur.
          </p>
        </div>

        {/* =========================================================
            2. MAIN CARDS GRID: 6 EQUAL ROUNDED CARDS
            Breakpoints:
            - Desktop: 6 columns
            - Tablet: 3 columns (3 × 2)
            - Mobile: 2 columns (2 × 3)
            - Very small mobile: 1 column
        ========================================================= */}
        <div className="grid grid-cols-1 max-[400px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-4 xl:gap-5 items-stretch">
          {lifecycleSteps.map((step) => (
            <article
              key={step.number}
              className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.18)] hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300 ease-out flex flex-col justify-between text-left h-full"
            >
              <div>
                {/* Number Accent */}
                <span className="text-xs sm:text-sm font-sans font-semibold text-slate-400 dark:text-text-muted group-hover:text-secondary transition-colors duration-300 block mb-4 sm:mb-6">
                  {step.number}
                </span>

                {/* Title */}
                <h3 className="font-serif text-lg sm:text-xl font-medium text-slate-900 dark:text-foreground transition-colors duration-300 mb-2.5">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm font-sans text-slate-500 dark:text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
