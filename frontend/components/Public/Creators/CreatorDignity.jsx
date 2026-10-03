"use client";

import React, { useState } from "react";

export default function CreatorDignity() {
  // Clean structure ready for future backend integration
  const [payoutData] = useState({
    campaignLabel: "SETTLED CAMPAIGN",
    campaignTitle: "Glow Beauty Rose Peptide Launch",
    payoutStatus: "PAID DIRECT TO BANK",
    netEarnings: "₹30,000",
    deductionNote: "Zero platform transaction deduction on creator fee",
    stages: [
      { name: "PENDING", completed: true },
      { name: "APPROVED", completed: true },
      { name: "PROCESSING", completed: true },
      { name: "PAID ✓", completed: true, isCurrent: true },
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
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            07 / DIGNITY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4 uppercase">
            YOUR CREATIVITY HAS VALUE.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            No chasing invoices, net-90 payment delays, or ambiguous commission deductions. Guaranteed payouts released immediately upon milestone signoff.
          </p>
        </div>

        {/* =========================================================
            2. MAIN SETTLED PAYMENT CARD
        ========================================================= */}
        <div className="max-w-[880px] mx-auto bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 shadow-sm hover:shadow-[0_12px_36px_-8px_rgba(255,79,135,0.18)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 relative text-left group">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                {payoutData.campaignLabel}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground">
                {payoutData.campaignTitle}
              </h3>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>{payoutData.payoutStatus}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/10 my-6 sm:my-8" />

          {/* Earnings Area */}
          <div className="text-center py-2 sm:py-4">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-text-muted font-sans block mb-2">
              NET CREATOR EARNINGS
            </span>
            <span className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-slate-900 dark:text-foreground mb-3 block">
              {payoutData.netEarnings}
            </span>
            <p className="text-xs font-sans text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1.5">
              <span>✦</span>
              <span>{payoutData.deductionNote}</span>
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-white/10 my-6 sm:my-8" />

          {/* 4-Stage Payment Status Tracker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center">
            {payoutData.stages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* Progress Segment Bar */}
                <div className="w-full h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-xs" />
                
                {/* Stage Label */}
                <span
                  className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase font-sans text-center mt-2.5 ${
                    stage.isCurrent
                      ? "text-slate-900 dark:text-foreground font-extrabold"
                      : "text-slate-500 dark:text-text-muted"
                  }`}
                >
                  {stage.name}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
