"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function CreatorCollaboration() {
  const connectionFeatures = [
    "Receive or explore collaboration opportunities.",
    "Understand the brand's expectations.",
    "Discuss campaign details.",
    "Respond according to your interest.",
  ];

  return (
    <section className="relative overflow-hidden bg-[#18181B] text-white py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-secondary/[0.04] blur-[170px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <ScrollReveal direction="up" delay={0} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            04 / CONNECT WITH BRANDS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white leading-[1.15] mb-4">
            Turn Your Profile Into New Connections.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            When a brand finds your work or invites you to a campaign, you can explore the opportunity and discuss the details. Share your ideas, ask questions and understand what the brand is looking for.
          </p>
        </ScrollReveal>

        {/* 4 Feature Points */}
        <ScrollReveal direction="up" delay={60} className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto">
            {connectionFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 text-left shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                <span className="text-xs sm:text-sm font-sans font-medium text-zinc-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Visual Heading & Description Banner */}
        <ScrollReveal direction="up" delay={80} className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-secondary font-sans block mb-1">
            DIRECT COLLABORATION
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-2">
            Start Conversations That Matter.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans">
            Build direct professional connections with brands and campaign teams.
          </p>
        </ScrollReveal>

        {/* =========================================================
            2. CHAT CONVERSATION INTERFACE
        ========================================================= */}
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-7">
          
          {/* MESSAGE 1 — BRAND (Left Aligned) */}
          <ScrollReveal direction="left" delay={80}>
            <div className="flex items-start gap-3 sm:gap-4 justify-start group">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-1 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                BR
              </div>

              {/* Bubble */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-left max-w-xl hover:border-secondary/50 hover:shadow-[0_8px_24px_-6px_rgba(255,79,135,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[11px] font-sans font-medium text-zinc-400">
                    Brand Campaign Manager
                  </span>
                  <span className="text-[10px] font-sans text-zinc-500">
                    10:24 AM
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-zinc-200 leading-relaxed">
                  &ldquo;Hello! We loved your recent lifestyle videos and would love to partner for our upcoming product launch. Would you be interested in collaborating?&rdquo;
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* MESSAGE 2 — CREATOR (Right Aligned) */}
          <ScrollReveal direction="right" delay={160}>
            <div className="flex items-start gap-3 sm:gap-4 justify-end group">
              {/* Bubble */}
              <div className="bg-[#F5C2CB] text-slate-900 border border-pink-300/40 rounded-2xl p-4 sm:p-5 text-left max-w-xl hover:border-secondary hover:shadow-[0_8px_24px_-6px_rgba(255,79,135,0.25)] hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[11px] font-sans font-bold text-slate-800 dark:text-slate-800">
                    Creator
                  </span>
                  <span className="text-[10px] font-sans text-slate-600 dark:text-slate-600">
                    10:31 AM
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-slate-900 dark:!text-[#111111] leading-relaxed">
                  &ldquo;Thank you for reaching out! The campaign looks exciting. Here is an idea on how we can naturally integrate it into my regular morning content style ✨&rdquo;
                </p>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-pink-200 text-slate-900 font-sans font-bold text-xs flex items-center justify-center shrink-0 mt-1 shadow-sm group-hover:scale-105 transition-transform duration-300">
                CR
              </div>
            </div>
          </ScrollReveal>

          {/* MESSAGE 3 — BRAND (Left Aligned) */}
          <ScrollReveal direction="left" delay={240}>
            <div className="flex items-start gap-3 sm:gap-4 justify-start group">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-1 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                BR
              </div>

              {/* Bubble */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-left max-w-md hover:border-secondary/50 hover:shadow-[0_8px_24px_-6px_rgba(255,79,135,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[11px] font-sans font-medium text-zinc-400">
                    Brand Campaign Manager
                  </span>
                  <span className="text-[10px] font-sans text-zinc-500">
                    10:34 AM
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-zinc-200 leading-relaxed">
                  &ldquo;That fits our brief perfectly. Let&apos;s finalize the timeline and deliverables so you can get started.&rdquo;
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>

        {/* =========================================================
            3. COLLABORATION AGREEMENT CARD
        ========================================================= */}
        <ScrollReveal direction="up" delay={120} className="max-w-4xl mx-auto mt-12 sm:mt-16">
          <div className="bg-zinc-900/90 border border-zinc-800 hover:border-secondary/60 rounded-3xl p-6 sm:p-7 shadow-lg hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group text-left">
            
            {/* Left: Shield & Agreement Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform duration-300">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-sans block mb-0.5">
                  COLLABORATION DETAILS
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-white tracking-wide">
                  Mutual Agreement &amp; Timeline Alignment
                </h3>
              </div>
            </div>

            {/* Right: Terms & Status */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-sans block mb-0.5">
                  DELIVERABLES
                </span>
                <span className="font-sans font-medium text-sm sm:text-base text-white">
                  1 Reel + 2 Stories
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-sans block mb-0.5">
                  STATUS
                </span>
                <span className="font-sans font-bold text-xs sm:text-sm text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AGREED &amp; CONFIRMED
                </span>
              </div>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
