"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksReviewApprove() {
  const supportingPoints = [
    "Review submitted content.",
    "Check campaign requirements.",
    "Share constructive feedback.",
    "Finalize the agreed deliverables.",
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & POINTS
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              07 · REVIEW
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Review, Share Feedback and Get It Right.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6 max-w-md">
              Once the creator submits the agreed content, the brand can review it against the campaign brief. If adjustments are needed, feedback can be discussed before the final content is approved.
            </p>

            <ul className="space-y-2.5 mb-8 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
              {supportingPoints.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: EDITORIAL APPROVAL WORKSPACE CARD
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-7">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[4px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-1">
                    A Better Result Through Collaboration.
                  </h3>
                  <p className="font-sans text-xs text-slate-500 dark:text-text-muted">
                    Keep both sides aligned and work towards the final campaign outcome.
                  </p>
                </div>

                <div className="self-start sm:self-auto">
                  <span className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans inline-block shadow-2xs">
                    REVIEW PROCESS
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/10 mb-5" />

              {/* Feedback Discussion Item */}
              <div className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-4.5 mb-3.5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground font-sans">
                    Constructive Feedback &amp; Suggestions
                  </span>
                  <span className="text-xs text-slate-500 dark:text-text-muted font-sans font-medium">
                    Draft Review
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed">
                  “The concept looks great! Let&apos;s emphasize the main product feature slightly longer in the opening clip.”
                </p>
              </div>

              {/* Creator Adjustment Resolution */}
              <div className="bg-[#FDF2F5]/70 dark:bg-secondary/[0.05] border border-pink-100/80 dark:border-pink-500/15 rounded-2xl p-4.5 mb-6">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 font-sans block mb-1.5">
                  CREATOR UPDATE
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed">
                  “Updated the edit with clearer product highlighting as discussed. Final cut ready for review.”
                </p>
              </div>

              {/* Two Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  className="w-full bg-white dark:bg-slate-900/90 text-slate-900 dark:text-foreground border border-slate-300/80 dark:border-white/20 rounded-full py-3.5 px-6 font-sans font-semibold text-xs sm:text-sm text-center hover:border-secondary hover:text-secondary transition-all duration-300 cursor-pointer shadow-2xs"
                >
                  Share Feedback
                </button>

                <button
                  type="button"
                  className="w-full bg-[#96B79D] dark:bg-emerald-700 text-white border border-emerald-600/30 rounded-full py-3.5 px-6 font-sans font-semibold text-xs sm:text-sm text-center hover:bg-[#85A68C] dark:hover:bg-emerald-600 transition-all duration-300 cursor-pointer shadow-2xs"
                >
                  Approve Deliverables ✓
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
