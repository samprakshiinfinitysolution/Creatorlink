"use client";

import React from "react";

export default function CreatorCollaboration() {
  return (
    <section className="relative overflow-hidden bg-[#18181B] text-white py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-secondary/[0.04] blur-[170px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            05 / COLLABORATION
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white leading-[1.15] mb-4">
            Create with brands. Stay true to yourself.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Direct dialogue between brand directors and artists. Respectful, transparent, and built on shared aesthetic appreciation.
          </p>
        </div>

        {/* =========================================================
            2. CHAT CONVERSATION INTERFACE
        ========================================================= */}
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-7">
          
          {/* MESSAGE 1 — BRAND (Left Aligned) */}
          <div className="flex items-start gap-3 sm:gap-4 justify-start group">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-1 group-hover:scale-105 transition-transform duration-300 shadow-sm">
              GB
            </div>

            {/* Bubble */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-left max-w-xl hover:border-secondary/50 hover:shadow-[0_8px_24px_-6px_rgba(255,79,135,0.15)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[11px] font-sans font-medium text-zinc-400">
                  Elena Chen • Glow Beauty Brand Director
                </span>
                <span className="text-[10px] font-sans text-zinc-500">
                  10:24 AM
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-zinc-200 leading-relaxed">
                &ldquo;Hi Aarohi! Could you create an organic morning Reel around our new peptide rose serum? We love how you use golden-hour natural shadows.&rdquo;
              </p>
            </div>
          </div>

          {/* MESSAGE 2 — CREATOR (Right Aligned) */}
          <div className="flex items-start gap-3 sm:gap-4 justify-end group">
            {/* Bubble */}
            <div className="bg-[#F5C2CB] text-slate-900 border border-pink-300/40 rounded-2xl p-4 sm:p-5 text-left max-w-xl hover:border-secondary hover:shadow-[0_8px_24px_-6px_rgba(255,79,135,0.25)] hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[11px] font-sans font-bold text-slate-800 dark:text-slate-800">
                  Aarohi Mehta
                </span>
                <span className="text-[10px] font-sans text-slate-600 dark:text-slate-600">
                  10:31 AM
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-slate-900 dark:!text-[#111111] leading-relaxed">
                &ldquo;I already have an idea for the opening shot ✨ A quiet linen tea tray, bare skin, and macro droplet texture. Pure sensory minimalism.&rdquo;
              </p>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-pink-200 text-slate-900 font-sans font-bold text-xs flex items-center justify-center shrink-0 mt-1 shadow-sm group-hover:scale-105 transition-transform duration-300">
              AM
            </div>
          </div>

          {/* MESSAGE 3 — BRAND (Left Aligned) */}
          <div className="flex items-start gap-3 sm:gap-4 justify-start group">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-1 group-hover:scale-105 transition-transform duration-300 shadow-sm">
              GB
            </div>

            {/* Bubble */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-left max-w-md hover:border-secondary/50 hover:shadow-[0_8px_24px_-6px_rgba(255,79,135,0.15)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[11px] font-sans font-medium text-zinc-400">
                  Elena Chen
                </span>
                <span className="text-[10px] font-sans text-zinc-500">
                  10:34 AM
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-zinc-200 leading-relaxed">
                &ldquo;Love it. Let&apos;s do it. Escrow is unlocked for submission.&rdquo;
              </p>
            </div>
          </div>

        </div>

        {/* =========================================================
            3. COLLABORATION AGREEMENT CARD
        ========================================================= */}
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16 bg-zinc-900/90 border border-zinc-800 hover:border-secondary/60 rounded-3xl p-6 sm:p-7 shadow-lg hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group text-left">
          
          {/* Left: Shield & Agreement Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform duration-300">
              🛡️
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-sans block mb-0.5">
                COLLABORATION AGREEMENT
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-white tracking-wide">
                GLOW BEAUTY × AAROHI MEHTA
              </h3>
            </div>
          </div>

          {/* Right: Contract Value & Status */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-sans block mb-0.5">
                CONTRACT VALUE
              </span>
              <span className="font-sans font-bold text-lg sm:text-xl text-white">
                ₹30,000
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-sans block mb-0.5">
                STATUS
              </span>
              <span className="font-sans font-bold text-xs sm:text-sm text-emerald-400 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SECURED IN ESCROW
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
