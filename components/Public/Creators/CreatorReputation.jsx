"use client";

import React, { useState } from "react";

export default function CreatorReputation() {
  // Clean structure ready for future backend integration
  const [reputationData] = useState({
    ratingStars: 5,
    quote: "Aarohi's creative direction is peerless. Her visual storytelling generated over 2.4 million organic impressions and lifted brand trust instantly. We've re-booked her for our entire holiday campaign.",
    authorName: "Elena Chen",
    authorTitle: "VP Marketing, Glow Beauty",
    verificationTag: "Verified Collaboration Review",
    stats: [
      {
        value: "4.9 ★",
        label: "CREATOR REPUTATION SCORE",
        desc: "Based on on-time delivery, creative quality, and communication ease.",
      },
      {
        value: "28",
        label: "COMPLETED COLLABORATIONS",
        desc: "100% on-time milestone fulfillment over 18 months.",
      },
      {
        value: "12",
        label: "REPEAT LUXURY BRANDS",
        desc: "Long-term retainer relationships cultivated organically.",
      },
    ],
  });

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[160px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            08 / REPUTATION
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            Every collaboration leaves a mark.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Build cumulative creative capital. High ratings and authentic reviews unlock higher-tier luxury brand private invites.
          </p>
        </div>

        {/* =========================================================
            2. MAIN CONTENT (TWO COLUMNS: TESTIMONIAL CARD & STATS)
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: LARGE WHITE TESTIMONIAL CARD (Lg: 7 Cols / ~60%)
          ------------------------------------------------------- */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 shadow-sm hover:shadow-[0_12px_36px_-8px_rgba(255,79,135,0.18)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 relative text-left group">
              
              {/* Star Rating */}
              <div className="flex items-center gap-1.5 text-secondary text-base sm:text-lg mb-6">
                {[...Array(reputationData.ratingStars)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              {/* Testimonial Quote */}
              <blockquote className="font-serif text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-foreground leading-relaxed font-medium mb-8 block">
                &ldquo;{reputationData.quote}&rdquo;
              </blockquote>

              <div className="border-t border-slate-100 dark:border-white/10 pt-6" />

              {/* Author Area */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-sans font-bold text-sm text-slate-900 dark:text-foreground block mb-0.5">
                    {reputationData.authorName}
                  </span>
                  <span className="text-xs font-sans text-slate-500 dark:text-text-muted">
                    {reputationData.authorTitle}
                  </span>
                </div>

                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-text-muted font-medium flex-shrink-0">
                  {reputationData.verificationTag}
                </span>
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------
              RIGHT COLUMN: THREE REPUTATION STATS (Lg: 5 Cols / ~40%)
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left space-y-6 sm:space-y-8">
            {reputationData.stats.map((stat, idx) => (
              <React.Fragment key={idx}>
                <div>
                  <span className="font-serif text-4xl sm:text-5xl font-medium text-slate-900 dark:text-foreground mb-1 block">
                    {stat.value}
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-secondary font-sans block mb-1.5">
                    {stat.label}
                  </span>
                  <p className="text-xs font-sans text-slate-500 dark:text-text-muted leading-relaxed">
                    {stat.desc}
                  </p>
                </div>

                {idx < reputationData.stats.length - 1 && (
                  <div className="border-t border-slate-200/70 dark:border-white/10" />
                )}
              </React.Fragment>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
