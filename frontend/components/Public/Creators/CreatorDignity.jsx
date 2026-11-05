"use client";

import React, { useState } from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function CreatorDignity() {
  const dealFeatures = [
    "Discuss your compensation.",
    "Confirm content deliverables.",
    "Agree on timelines.",
    "Clarify campaign expectations.",
  ];

  const [collaborationDetails] = useState({
    title: "Clear Terms. Better Partnerships.",
    description: "Make sure you and the brand are aligned before the work begins.",
    stages: [
      { name: "PROPOSED", completed: true },
      { name: "AGREED", completed: true },
      { name: "IN PROGRESS", completed: true, isCurrent: true },
      { name: "COMPLETED", completed: false },
    ],
  });

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[160px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <ScrollReveal direction="up" delay={0} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            05 / AGREE ON THE DETAILS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            Know the Plan Before You Start Creating.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Before starting a collaboration, discuss the content requirements, deliverables, pricing, deadlines and usage expectations. Clear communication helps both sides work with confidence.
          </p>
        </ScrollReveal>

        {/* 4 Feature Points Row */}
        <ScrollReveal direction="up" delay={60} className="mb-10 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto">
            {dealFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xs hover:-translate-y-0.5 transition-transform"
              >
                <div className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                <span className="text-xs sm:text-sm font-sans font-medium text-slate-800 dark:text-foreground text-left">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* =========================================================
            2. MAIN CLEAR TERMS CARD
        ========================================================= */}
        <ScrollReveal direction="scale" delay={100} className="max-w-[880px] mx-auto">
          <div className="w-full bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 shadow-sm hover:shadow-[0_12px_36px_-8px_rgba(255,79,135,0.18)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 relative text-left group">
            
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                  ALIGNMENT &amp; EXPECTATIONS
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground">
                  {collaborationDetails.title}
                </h3>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>TERMS ALIGNED</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans mt-2">
              {collaborationDetails.description}
            </p>

            <div className="border-t border-slate-100 dark:border-white/10 my-6 sm:my-8" />

            {/* Terms Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center sm:text-left">
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-surface-muted/40 border border-slate-200/60 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-text-muted font-sans block mb-1">
                  Deliverables
                </span>
                <span className="font-sans font-bold text-sm text-slate-900 dark:text-foreground">
                  Pre-agreed Content Scope
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-surface-muted/40 border border-slate-200/60 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-text-muted font-sans block mb-1">
                  Timeline
                </span>
                <span className="font-sans font-bold text-sm text-slate-900 dark:text-foreground">
                  Clear Review &amp; Post Dates
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-surface-muted/40 border border-slate-200/60 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-text-muted font-sans block mb-1">
                  Pricing
                </span>
                <span className="font-sans font-bold text-sm text-slate-900 dark:text-foreground">
                  Transparent Agreed Rates
                </span>
              </div>
            </div>

            {/* 4-Stage Status Tracker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center">
              {collaborationDetails.stages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {/* Progress Segment Bar */}
                  <div
                    className={`w-full h-1.5 rounded-full shadow-xs ${
                      stage.completed
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                  
                  {/* Stage Label */}
                  <span
                    className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase font-sans text-center mt-2.5 ${
                      stage.isCurrent
                        ? "text-secondary font-extrabold"
                        : stage.completed
                        ? "text-slate-900 dark:text-foreground"
                        : "text-slate-400 dark:text-text-muted"
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
