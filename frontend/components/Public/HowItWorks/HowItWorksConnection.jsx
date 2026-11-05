"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksConnection() {
  const supportingPoints = [
    "Discuss campaign requirements.",
    "Share creative ideas.",
    "Clarify expectations.",
    "Agree on the next steps.",
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient soft glow background */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1240px] relative z-10 text-center">
        {/* -------------------------------------------------------
            SECTION HEADER: EYEBROW, HEADING, DESCRIPTION
        ------------------------------------------------------- */}
        <ScrollReveal direction="up" delay={0} className="max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-3 font-sans">
            03 · CONNECT
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.18] mb-4">
            Start a Conversation. Build a Connection.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Once brands discover creators or creators find an opportunity, both sides can connect and discuss the details. Talk about the campaign, creative ideas, expectations and next steps before moving forward.
          </p>
        </ScrollReveal>

        {/* -------------------------------------------------------
            MAIN CONNECTION CONTAINER
        ------------------------------------------------------- */}
        <ScrollReveal direction="scale" delay={80} className="mx-auto max-w-[1100px]">
          <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-sm text-left">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6 lg:gap-8">
              {/* LEFT CARD — BRANDS */}
              <div className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 font-sans font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-2xs">
                    FOR BRANDS
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-pink-200/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-2 leading-snug">
                  Reach Out with Context
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-4">
                  Contact creators directly with your campaign brief, clear ideas and key requirements.
                </p>

                <div className="space-y-2 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 border-t border-pink-200/40 dark:border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>Direct discussion on deliverables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>Align on vision and schedules</span>
                  </div>
                </div>
              </div>

              {/* CENTER CONNECTION ELEMENT */}
              <div className="flex flex-col items-center justify-center py-2 lg:py-0">
                <div className="w-10 h-10 rounded-full bg-[#FCE7F3] dark:bg-secondary/25 text-secondary border border-pink-200/80 dark:border-pink-500/30 flex items-center justify-center shadow-2xs font-sans text-sm font-semibold">
                  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 dark:text-text-muted mt-2 font-sans">
                  CONNECT
                </span>
              </div>

              {/* RIGHT CARD — CREATORS */}
              <div className="bg-[#FDF2F5] dark:bg-secondary/[0.1] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 font-sans font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-2xs">
                    FOR CREATORS
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-pink-200/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-2 leading-snug">
                  Explore Brand Opportunities
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-4">
                  Review campaigns, share your creative feedback and discuss how to bring your perspective to life.
                </p>

                <div className="space-y-2 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 border-t border-pink-200/40 dark:border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>Share content suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span>
                    <span>Clarify terms before starting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Visual Highlights */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-foreground">
                  Good Ideas Begin With Conversations.
                </h4>
                <p className="font-sans text-xs text-slate-500 dark:text-text-muted mt-0.5">
                  Connect with the right people and explore opportunities together.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-sans text-slate-600 dark:text-slate-300 font-medium">
                {supportingPoints.map((item, i) => (
                  <span key={i} className="bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
