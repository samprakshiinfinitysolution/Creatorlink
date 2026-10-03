"use client";

import React from "react";

export default function HowItWorksCreate() {
  const infoCards = [
    {
      id: 1,
      label: "GOAL",
      value: "Awareness",
    },
    {
      id: 2,
      label: "BUDGET",
      value: "₹50,000",
    },
    {
      id: 3,
      label: "DELIVERABLES",
      value: "2 Reels · 3 Stories",
    },
    {
      id: 4,
      label: "DEADLINE",
      value: "June 30",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & CHECK ROW
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              02 · CREATE
            </span>

            {/* Editorial Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Turn an idea into a <br className="hidden sm:inline" />
              campaign.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 max-w-md">
              Structured creative briefs clarify creative guardrails, deliverable requirements, format aspects, and milestone schedules—preventing misalignment before production begins.
            </p>

            {/* Check Icon / Status Row */}
            <div className="flex items-center gap-3 font-sans text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              <div className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                <svg className="w-3 h-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Pre-templated moodboard &amp; deliverable modules</span>
            </div>

          </div>


          {/* -------------------------------------------------------
              RIGHT COLUMN: CAMPAIGN BRIEF DASHBOARD CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-7">
            
            {/* Main Campaign Brief Card Container */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[6px] hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-pointer text-left">
              
              {/* Top Header: Label, Title & Approved Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-1">
                    CAMPAIGN INITIATION BRIEF
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground leading-snug">
                    Summer Beauty Launch
                  </h3>
                </div>

                {/* Status Badge */}
                <div className="self-start sm:self-auto">
                  <span className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans inline-flex items-center gap-1.5 shadow-2xs">
                    <span>CAMPAIGN CREATED</span>
                    <span className="font-bold">✓</span>
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-white/10 my-6" />

              {/* Four Information Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-5">
                {infoCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-4 sm:p-4.5 hover:-translate-y-[2px] hover:border-secondary/30 hover:shadow-xs transition-all duration-300 ease-out cursor-pointer"
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 font-sans block mb-1.5">
                      {card.label}
                    </span>
                    <span className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-foreground block leading-snug">
                      {card.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Larger Visual Guidelines Content Card */}
              <div className="bg-[#FFF5F7]/70 dark:bg-secondary/[0.05] border border-pink-100/80 dark:border-pink-500/15 rounded-2xl p-4.5 sm:p-5 hover:-translate-y-[2px] hover:border-secondary/30 hover:shadow-xs transition-all duration-300 ease-out cursor-pointer">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 font-sans block mb-2">
                  VISUAL GUIDELINES
                </span>
                <p className="font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  “Morning bathroom sunlight, tactile product application on bare skin, minimalist soundtrack, close-up droplet macro cuts.”
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
