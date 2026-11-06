"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksCreate() {
  const supportingPoints = [
    "Describe your campaign.",
    "Share product or service details.",
    "Define content requirements.",
    "Mention deliverables and timelines.",
  ];

  const briefFields = [
    { id: 1, label: "CAMPAIGN GOAL", value: "Product Awareness" },
    { id: 2, label: "CONTENT TYPE", value: "Short-form Video" },
    { id: 3, label: "DELIVERABLES", value: "Reels & Stories" },
    { id: 4, label: "TIMELINE", value: "Flexible / Agreed" },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient soft glow lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & POINTS
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              02 · CREATE
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Have an Idea? Turn It Into a Campaign.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6 max-w-md">
              Brands can share what they want to promote, the type of content they need, their campaign requirements and expected timeline. A clear brief helps creators understand the opportunity.
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
              RIGHT COLUMN: CAMPAIGN BRIEF VISUAL CARD
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-7">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[6px] hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1">
                    CAMPAIGN OVERVIEW
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground leading-snug">
                    Build Your Campaign Brief
                  </h3>
                </div>
                <div className="self-start sm:self-auto">
                  <span className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans inline-flex items-center gap-1.5 shadow-2xs">
                    <span>CLEAR BRIEF</span>
                    <span className="font-bold">✓</span>
                  </span>
                </div>
              </div>

              <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-text-secondary mb-6">
                Give creators a clear picture of your campaign and what you want to achieve.
              </p>

              <div className="border-t border-slate-100 dark:border-white/10 my-6" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-5">
                {briefFields.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-4 sm:p-4.5 hover:-translate-y-[2px] transition-all duration-300"
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 font-sans block mb-1.5">
                      {card.label}
                    </span>
                    <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-foreground block leading-snug">
                      {card.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#FFF5F7]/70 dark:bg-secondary/[0.05] border border-pink-100/80 dark:border-pink-500/15 rounded-2xl p-4.5 sm:p-5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 font-sans block mb-1.5">
                  CREATIVE REQUIREMENTS
                </span>
                <p className="font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  Clear details about product highlights, content tone, format specifications, and expected deliverables.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
