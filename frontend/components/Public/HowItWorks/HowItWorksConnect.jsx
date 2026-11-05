"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksConnect() {
  const supportingPoints = [
    "Finalize deliverables.",
    "Discuss timelines.",
    "Confirm campaign expectations.",
    "Align on the agreed terms.",
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient soft glow lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & POINTS
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              04 · PLAN TOGETHER
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Get on the Same Page Before You Begin.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6 max-w-md">
              Every successful collaboration starts with clear expectations. Discuss the deliverables, content format, timeline, budget and other campaign details so both the brand and creator understand what has been agreed.
            </p>

            <ul className="space-y-2.5 mb-8 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {supportingPoints.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: CONVERSATION & PLANNING WORKSPACE CARD
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-7">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[5px] hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out text-left">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-1 leading-tight">
                    Clear Plans. Better Collaborations.
                  </h3>
                  <p className="text-xs font-sans text-slate-500 dark:text-text-muted">
                    Make sure everyone understands the campaign before the work begins.
                  </p>
                </div>

                <div className="self-start sm:self-auto">
                  <span className="bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 border border-pink-200/60 dark:border-pink-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full font-sans inline-block shadow-2xs">
                    ALIGNED
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/10 mb-6" />

              {/* Messages / Discussion Preview */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-slate-200/70 dark:border-white/10 mt-1 shadow-2xs">
                    BR
                  </div>
                  <div className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl rounded-tl-xs p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed max-w-[90%] sm:max-w-[82%]">
                    Here are the agreed deliverables: 1 high-resolution reel and 2 story posts scheduled for next week.
                  </div>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#FDF2F5] dark:bg-secondary/[0.12] border border-pink-100/90 dark:border-pink-500/25 rounded-2xl rounded-tr-xs p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed max-w-[90%] sm:max-w-[82%] text-left">
                    Looks clear! I will share the concept draft and schedule preview before shooting.
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 font-sans font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-pink-200/60 dark:border-pink-500/20 mt-1 shadow-2xs">
                    CR
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-sans">
                <span className="font-medium text-slate-500 dark:text-text-muted">
                  Campaign Scope: <strong className="font-semibold text-slate-700 dark:text-slate-300">Deliverables &amp; Timelines Confirmed</strong>
                </span>
                <span className="font-bold text-slate-900 dark:text-foreground">
                  Ready to Start
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
