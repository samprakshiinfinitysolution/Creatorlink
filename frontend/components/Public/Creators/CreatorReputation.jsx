"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function CreatorReputation() {
  const supportingPoints = [
    {
      title: "Showcase completed work.",
      desc: "Add your best brand deliverables and creative projects to your public profile.",
    },
    {
      title: "Maintain a professional profile.",
      desc: "Keep your bio, niche, social channels and recent content up to date.",
    },
    {
      title: "Build meaningful brand relationships.",
      desc: "Turn positive first collaborations into recurring campaign partnerships.",
    },
    {
      title: "Learn and improve with every project.",
      desc: "Refine your creative process and content deliverables with every experience.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[160px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <ScrollReveal direction="up" delay={0} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            07 / BUILD YOUR REPUTATION
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            Every Project Is a Chance to Grow.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Your work, communication and completed collaborations help shape your professional journey. Build experience, maintain strong working relationships and let your portfolio reflect your progress.
          </p>
        </ScrollReveal>

        {/* =========================================================
            2. MAIN CONTENT (TWO COLUMNS: VISUAL CARD & SUPPORTING POINTS)
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: VISUAL CARD (Lg: 6 Cols)
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={80} className="lg:col-span-6">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 shadow-sm hover:shadow-[0_12px_36px_-8px_rgba(255,79,135,0.18)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 relative text-left group">
              
              <span className="bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 border border-pink-200/60 dark:border-pink-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full font-sans inline-block mb-6 shadow-2xs">
                PROFESSIONAL PORTFOLIO
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground mb-4 leading-snug">
                Let Your Work Speak for Itself.
              </h3>

              <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-text-secondary leading-relaxed mb-8">
                Build a creator journey through real work and genuine professional connections. Every completed project adds to your credibility and opens doors to new opportunities.
              </p>

              <div className="border-t border-slate-100 dark:border-white/10 pt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-foreground block">
                    Authentic Track Record
                  </span>
                  <span className="text-xs text-slate-500 dark:text-text-muted font-sans">
                    Demonstrate your creative consistency over time
                  </span>
                </div>
              </div>

            </div>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: 4 SUPPORTING POINTS (Lg: 6 Cols)
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={160} className="lg:col-span-6 text-left space-y-4 sm:space-y-5">
            {supportingPoints.map((point, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 hover:-translate-y-0.5 hover:border-secondary/40 transition-all duration-300"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-foreground mb-1">
                      {point.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-sans text-slate-600 dark:text-text-secondary leading-relaxed">
                      {point.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
