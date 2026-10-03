"use client";

import React from "react";

export default function HowItWorksConnection() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1240px] relative z-10 text-center">
        
        {/* -------------------------------------------------------
            SECTION HEADER: EYEBROW, HEADING, DESCRIPTION
        ------------------------------------------------------- */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-text-muted block mb-3 font-sans">
            THE BIG IDEA
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.18] mb-4">
            Everything starts with a connection.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Bridging executive brand strategy with raw, authentic creator craftsmanship under one fluid architectural operating system.
          </p>
        </div>

        {/* -------------------------------------------------------
            MAIN CONNECTION CONTAINER
        ------------------------------------------------------- */}
        <div className="mx-auto max-w-[1100px] bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-sm text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6 lg:gap-8">
            
            {/* ===================================================
                LEFT CARD — THE BRAND
            =================================================== */}
            <div className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:-translate-y-1 hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_14px_32px_-8px_rgba(255,79,135,0.15)] transition-all duration-300 ease-out cursor-default">
              
              {/* Card Header Row: Pill & Icon */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 font-sans font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-2xs">
                  THE BRAND
                </span>

                {/* Strategy Brief Icon */}
                <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-pink-200/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-3 leading-snug">
                Campaign Vision &amp; Scope
              </h3>

              {/* Body */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6">
                Brands arrive with strategic targets, seasonal narratives, precise budgets, and measurable visual objectives.
              </p>

              {/* Features List */}
              <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium border-t border-pink-200/40 dark:border-white/10 pt-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                    ✓
                  </span>
                  <span>Structured campaign brief creation</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                    ✓
                  </span>
                  <span>Guaranteed escrow fund safety</span>
                </div>
              </div>

            </div>


            {/* ===================================================
                CENTER NEXUS CONNECTION ELEMENT
            =================================================== */}
            <div className="flex flex-col items-center justify-center py-2 lg:py-0">
              <div className="w-10 h-10 rounded-full bg-[#FCE7F3] dark:bg-secondary/25 text-secondary border border-pink-200/80 dark:border-pink-500/30 flex items-center justify-center shadow-2xs font-sans text-sm font-semibold">
                {/* Horizontal Arrow Icon */}
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>

              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-text-muted mt-2 font-sans">
                NEXUS
              </span>
            </div>


            {/* ===================================================
                RIGHT CARD — THE CREATOR
            =================================================== */}
            <div className="bg-[#FDF2F5] dark:bg-secondary/[0.1] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:-translate-y-1 hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_14px_32px_-8px_rgba(255,79,135,0.15)] transition-all duration-300 ease-out cursor-default">
              
              {/* Card Header Row: Pill & Icon */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 font-sans font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-2xs">
                  THE CREATOR
                </span>

                {/* Creative Palette Icon */}
                <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-pink-200/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-3 leading-snug">
                Creative Mastery &amp; Audience
              </h3>

              {/* Body */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6">
                Creators contribute distinct visual style, hyper-engaged communities, editorial filming rigor, and authentic storytelling.
              </p>

              {/* Features List */}
              <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium border-t border-pink-200/40 dark:border-white/10 pt-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                    ✓
                  </span>
                  <span>Direct portfolio match casting</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                    ✓
                  </span>
                  <span>Automated instant milestone payouts</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
