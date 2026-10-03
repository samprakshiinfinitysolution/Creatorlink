"use client";

import React from "react";

export default function HowItWorksPay() {
  const pipelineSteps = [
    {
      id: 1,
      title: "PENDING",
      subtitle: "Brief Locked",
      isPaid: false,
      icon: (
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "APPROVED",
      subtitle: "Client OK",
      isPaid: false,
      icon: (
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "PROCESSING",
      subtitle: "Automated",
      isPaid: false,
      icon: (
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      id: 4,
      title: "PAID ✓",
      subtitle: "Instant Wire",
      isPaid: true,
      icon: (
        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & RELEASED PAYOUT CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              08 · PAY
            </span>

            {/* Editorial Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Creators get paid. <br className="hidden sm:inline" />
              Brands stay in <br className="hidden sm:inline" />
              control.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 max-w-md">
              Escrow protection guarantees brand satisfaction before release while offering creators absolute payment certainty. Zero awkward follow-ups, zero 90-day delays.
            </p>

            {/* Released Payout Card */}
            <div className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-5 shadow-2xs hover:-translate-y-[4px] hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_12px_28px_-6px_rgba(255,79,135,0.15)] transition-all duration-300 ease-out cursor-pointer max-w-md">
              <span className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-foreground mb-1 block leading-snug">
                ₹30,000.00 Released
              </span>
              <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
                Instantly transferred to Aarohi Mehta's verified bank account via Creator Hub Escrow Rail.
              </p>
            </div>

          </div>


          {/* -------------------------------------------------------
              RIGHT COLUMN: ESCROW PIPELINE LIFECYCLE CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-7">
            
            {/* Main Outer Escrow Pipeline Card */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[4px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-default text-left">
              
              {/* Top Label */}
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block mb-6">
                ESCROW PIPELINE LIFECYCLE
              </span>

              {/* 4 Pipeline Status Cards (1 Row on Desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
                {pipelineSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`rounded-2xl p-3.5 sm:p-4 text-center transition-all duration-300 ease-out cursor-pointer hover:-translate-y-[4px] hover:scale-[1.01] hover:shadow-xs ${
                      step.isPaid
                        ? "bg-[#EAF5EC] dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400"
                        : "bg-[#FAF4F5]/80 dark:bg-secondary/[0.06] border border-pink-100/80 dark:border-pink-500/15 hover:border-secondary/40"
                    }`}
                  >
                    {step.icon}
                    <span className={`text-xs font-bold font-sans block mb-0.5 ${step.isPaid ? "text-emerald-800 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}>
                      {step.title}
                    </span>
                    <span className={`text-[11px] font-sans font-medium block ${step.isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-text-muted"}`}>
                      {step.subtitle}
                    </span>
                  </div>
                ))}
              </div>

              {/* Compensation Summary Card */}
              <div className="bg-[#FAF4F5]/60 dark:bg-secondary/[0.04] border border-pink-100/70 dark:border-pink-500/15 rounded-2xl p-5 hover:-translate-y-[3px] hover:scale-[1.005] hover:border-secondary/30 hover:shadow-xs transition-all duration-300 ease-out cursor-pointer">
                
                {/* Row 1: Campaign Base Compensation */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-sans mb-2.5">
                  <span className="font-medium text-slate-600 dark:text-text-secondary">
                    Campaign Base Compensation
                  </span>
                  <span className="font-bold text-slate-900 dark:text-foreground">
                    ₹30,000.00
                  </span>
                </div>

                {/* Row 2: Creator Platform Fee (0%) */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
                  <span className="font-medium text-slate-600 dark:text-text-secondary">
                    Creator Platform Fee (0%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-foreground">
                    ₹0.00
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-pink-200/50 dark:border-white/10 my-4" />

                {/* Final Row: Total Payout Dispatched */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
                  <span className="font-bold text-slate-900 dark:text-foreground">
                    Total Payout Dispatched
                  </span>
                  <span className="font-bold text-slate-900 dark:text-foreground">
                    ₹30,000.00
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
