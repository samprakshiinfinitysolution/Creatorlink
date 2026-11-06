"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksGrow() {
  const supportingPoints = [
    {
      id: 1,
      title: "Build Professional Relationships",
      description: "Turn positive first collaborations into trusted, repeat creative partnerships.",
    },
    {
      id: 2,
      title: "Explore Future Opportunities",
      description: "Brands and creators can easily collaborate again on seasonal or ongoing campaigns.",
    },
    {
      id: 3,
      title: "Grow Your Creative Portfolio",
      description: "Showcase genuine completed brand work to attract high-value brand deals.",
    },
    {
      id: 4,
      title: "Create More Meaningful Campaigns",
      description: "Collaborations improve over time as understanding and shared vision deepen.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10 text-center">
        
        {/* -------------------------------------------------------
            SECTION HEADER: EYEBROW, HEADING, DESCRIPTION
        ------------------------------------------------------- */}
        <ScrollReveal direction="up" delay={0} className="max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans text-center">
            09 · GROW TOGETHER
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5 text-center">
            One Collaboration Can Lead to Many More.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto text-center">
            Every successful project can open doors to new opportunities. Creators can build lasting relationships with brands, while brands can discover creative partners for future campaigns.
          </p>
        </ScrollReveal>


        {/* -------------------------------------------------------
            MAIN CARD: KEEP CREATING. KEEP GROWING.
        ------------------------------------------------------- */}
        <ScrollReveal direction="scale" delay={80} className="max-w-[920px] mx-auto">
          <div className="w-full bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-sm hover:-translate-y-[4px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-default text-left">
            
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8">
              <div>
                <span className="bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 border border-pink-200/60 dark:border-pink-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full font-sans inline-block shadow-2xs mb-3">
                  LONG-TERM PARTNERSHIPS
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground">
                  Keep Creating. Keep Growing.
                </h3>
              </div>
              <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-text-muted max-w-xs sm:text-right">
                Build connections that go beyond a single campaign.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-white/10 mb-6 sm:mb-8" />

            {/* 4 Supporting Points Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {supportingPoints.map((point) => (
                <div
                  key={point.id}
                  className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-5 hover:-translate-y-[2px] hover:border-secondary/40 transition-all duration-300 ease-out text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/15 dark:bg-secondary/30 text-secondary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-foreground mb-1">
                        {point.title}
                      </h4>
                      <p className="font-sans text-xs text-slate-600 dark:text-text-secondary leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </ScrollReveal>

      </div>

    </section>
  );
}
