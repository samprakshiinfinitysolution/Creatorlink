'use client';

import React from 'react';

export default function AboutHorizon() {
  return (
    <section className="relative py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Local Keyframe Styles for Fade-up Animations */}
      <style>{`
        @keyframes horizonFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .horizon-animate-fade {
          animation: horizonFadeUp 0.8s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .horizon-animate-fade {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[900px] h-[350px] sm:h-[600px] lg:h-[900px] bg-secondary/10 blur-[140px] sm:blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            MAIN HORIZON CONTAINER
        ==================================================== */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto horizon-animate-fade">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-[10px] sm:text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-6 sm:mb-8 shadow-sm">
            <span className="text-secondary text-xs sm:text-sm">🧭</span>
            <span>THE HORIZON</span>
          </div>

          {/* Main Editorial Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-6 sm:mb-8">
            Building an enduring board for modern craft.
          </h2>

          {/* Supporting Paragraph */}
          <p className="text-sm sm:text-base lg:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl mb-10 sm:mb-14">
            The creative economy is evolving past fleeting viral clicks toward intentional, lasting guilds. We are crafting the curated architecture for that next epoch.
          </p>

          {/* ====================================================
              JOURNEY INDICATORS (NON-INTERACTIVE DECORATIVE UI)
          ==================================================== */}
          <div
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 select-none"
            aria-label="Creator journey roadmap"
          >
            {/* Step 01: Discover */}
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-surface border border-border-theme shadow-sm font-mono text-[10px] sm:text-xs font-bold text-foreground tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse" aria-hidden="true" />
              <span>01 DISCOVER</span>
            </div>

            {/* Separator Arrow 1 */}
            <span className="text-text-secondary text-sm font-mono select-none px-0.5 sm:px-1" aria-hidden="true">
              →
            </span>

            {/* Step 02: Co-Pin */}
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-surface border border-border-theme shadow-sm font-mono text-[10px] sm:text-xs font-bold text-foreground tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse" aria-hidden="true" />
              <span>02 CO-PIN</span>
            </div>

            {/* Separator Arrow 2 */}
            <span className="text-text-secondary text-sm font-mono select-none px-0.5 sm:px-1" aria-hidden="true">
              →
            </span>

            {/* Step 03: Grow Together */}
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-foreground text-background shadow-md font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-sm" aria-hidden="true" />
              <span>03 GROW TOGETHER</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
