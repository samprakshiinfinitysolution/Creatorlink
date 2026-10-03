"use client";

import React from "react";

export default function HowItWorksReviewApprove() {
  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & STATUS ROWS
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              06 &amp; 07 · REVIEW &amp; APPROVE
            </span>

            {/* Editorial Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              See it. Refine it. <br className="hidden sm:inline" />
              Approve it.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 max-w-md">
              Time-coded feedback prevents ambiguous markups. One click to request specific visual adjustments or provide immediate greenlight approval.
            </p>

            {/* Approval Status Rows */}
            <div className="space-y-3.5 font-sans text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              
              {/* Row 1: Content Approved Badge */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span>✓ CONTENT APPROVED badge unlocked</span>
              </div>

              {/* Row 2: Deliverables Complete */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>✓ DELIVERABLES COMPLETE</span>
              </div>

            </div>

          </div>


          {/* -------------------------------------------------------
              RIGHT COLUMN: EDITORIAL APPROVAL ENGINE CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-7">
            
            {/* Main Editorial Approval Engine Card */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[4px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-default text-left">
              
              {/* Card Header: Label & Status Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans block">
                  EDITORIAL APPROVAL ENGINE
                </span>

                <div className="self-start sm:self-auto">
                  <span className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans inline-block shadow-2xs">
                    READY FOR SIGN-OFF
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-white/10 mb-6" />

              {/* Feedback Card (Soft Pink Surface) */}
              <div className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-5 mb-4 hover:-translate-y-[2px] hover:shadow-xs transition-all duration-300 ease-out cursor-pointer">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground font-sans">
                    Feedback from Glow Beauty Lead
                  </span>
                  <span className="text-xs text-slate-500 dark:text-text-muted font-sans font-medium">
                    Timestamp: 0:14
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed">
                  “Love the concept. Could we make the product shot slightly more visible on the transition to the shelf?”
                </p>
              </div>

              {/* Creator Resolution Card */}
              <div className="bg-[#FDF2F5]/70 dark:bg-secondary/[0.05] border border-pink-100/80 dark:border-pink-500/15 rounded-2xl p-5 mb-6 hover:-translate-y-[2px] hover:shadow-xs transition-all duration-300 ease-out cursor-pointer">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 font-sans block mb-2">
                  CREATOR RESOLUTION V2
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed">
                  “Applied 1.2s longer hold on product hero frame. Ready for final mark!”
                </p>
              </div>

              {/* Two Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Button 1: Request Revision */}
                <button
                  type="button"
                  className="w-full bg-white dark:bg-slate-900/90 text-slate-900 dark:text-foreground border border-slate-300/80 dark:border-white/20 rounded-full py-3.5 px-6 font-sans font-semibold text-xs sm:text-sm text-center hover:-translate-y-[2px] hover:scale-[1.02] hover:border-secondary hover:text-secondary dark:hover:text-pink-200 hover:bg-[#FFF5F7] dark:hover:bg-secondary/20 hover:shadow-md transition-all duration-300 cursor-pointer shadow-2xs"
                >
                  Request Revision
                </button>

                {/* Button 2: Approve Content ✓ */}
                <button
                  type="button"
                  className="w-full bg-[#96B79D] dark:bg-emerald-700 text-white border border-emerald-600/30 rounded-full py-3.5 px-6 font-sans font-semibold text-xs sm:text-sm text-center hover:-translate-y-[2px] hover:scale-[1.02] hover:bg-[#85A68C] dark:hover:bg-emerald-600 hover:shadow-md transition-all duration-300 cursor-pointer shadow-2xs"
                >
                  Approve Content ✓
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
