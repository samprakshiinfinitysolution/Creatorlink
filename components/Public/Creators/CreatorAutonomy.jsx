"use client";

import React, { useState } from "react";

export default function CreatorAutonomy() {
  const [accepted, setAccepted] = useState(false);

  const features = [
    "Right audience alignment (Beauty / Clean Wellness)",
    "Creative freedom guaranteed on hook & framing",
    "Fair market compensation locked in escrow upfront",
    "Direct chat without intermediate agency friction",
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      
      {/* Background ambient blur */}
      <div className="pointer-events-none absolute right-10 bottom-10 h-[450px] w-[450px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[160px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* =========================================================
              LEFT COLUMN: HEADING, DESCRIPTION & 4 FEATURE ROWS
          ========================================================= */}
          <div className="lg:col-span-6 text-left">
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
              04 / AUTONOMY
            </span>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Not every opportunity needs to be yours.
            </h2>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-xl mb-8">
              Your feed is your curation. Creator Hub gives you full clarity on deliverable expectations, commercial rights, and artistic freedom before you ever commit.
            </p>

            {/* 4 Feature Rows */}
            <div className="space-y-3.5 max-w-xl">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/50 rounded-full px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3.5"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ✓
                  </div>
                  <span className="text-xs sm:text-sm font-sans font-medium text-slate-800 dark:text-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: LARGE INVITATION SHEET CARD
          ========================================================= */}
          <div className="lg:col-span-6">
            <div className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 relative text-left">
              
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                    INVITATION SHEET #089
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground">
                    Glow Beauty Campaign Invitation
                  </h3>
                </div>

                <span className="bg-secondary/20 dark:bg-secondary/20 text-secondary text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-secondary/30 flex-shrink-0">
                  ACTIVE INVITATION
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-white/10 my-5" />

              {/* Two Deliverable Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Deliverable 1 */}
                <div className="bg-slate-50/60 dark:bg-surface-muted/40 border border-slate-200/60 dark:border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                    Primary Deliverable
                  </span>
                  <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-foreground mb-0.5">
                    2× 9:16 Instagram Reels
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-text-muted font-sans">
                    Aesthetic routine integration
                  </p>
                </div>

                {/* Deliverable 2 */}
                <div className="bg-slate-50/60 dark:bg-surface-muted/40 border border-slate-200/60 dark:border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                    Secondary Support
                  </span>
                  <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-foreground mb-0.5">
                    3× High-Res Story Frames
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-text-muted font-sans">
                    With direct swipeable brand tag
                  </p>
                </div>

              </div>

              {/* Green Escrow Panel */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3 my-5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  🔒
                </div>
                <p className="text-xs font-sans text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white">₹30,000 Guaranteed Escrow:</strong> Funds already secured in third-party vault. Auto-released upon approval.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                
                {/* Accept Button (Toggles state) */}
                <button
                  type="button"
                  aria-label={accepted ? "Collaboration confirmed" : "Accept collaboration"}
                  onClick={() => setAccepted(true)}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary hover:bg-theme-hover text-white font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-md active:scale-98 cursor-pointer"
                >
                  {accepted ? (
                    <span>COLLABORATION CONFIRMED ✓</span>
                  ) : (
                    <span>Accept Collaboration</span>
                  )}
                </button>

                {/* Decline Button */}
                <button
                  type="button"
                  aria-label="Decline respectfully"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-surface border border-slate-200/80 dark:border-white/20 text-slate-700 dark:text-foreground hover:border-secondary hover:text-secondary font-sans font-bold text-xs tracking-wider transition-all duration-300 shadow-xs cursor-pointer"
                >
                  <span>Decline Respectfully</span>
                </button>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
