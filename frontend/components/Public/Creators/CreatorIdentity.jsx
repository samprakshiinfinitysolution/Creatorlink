"use client";

import React from "react";
import Image from "next/image";

export default function CreatorIdentity() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[150px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP AREA: HEAVY EDITORIAL INTRO + CREATOR PROFILE PILL
        ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          
          {/* Left Intro Text */}
          <div className="max-w-2xl text-left">
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
              02 / IDENTITY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
              Your work says who you are.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
              Show brands your signature aesthetic, palette, and creative cadence before you ever send a formal pitch deck.
            </p>
          </div>

          {/* Right Creator Profile Pill */}
          <div className="flex-shrink-0">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-full px-4 py-2.5 inline-flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary font-sans font-bold text-xs flex items-center justify-center">
                AM
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-bold text-xs text-slate-900 dark:text-foreground">
                    Aarohi Mehta
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </span>
                </div>
                <p className="text-[10px] font-sans font-medium text-slate-500 dark:text-text-muted">
                  Beauty & Lifestyle • 4.8★ Rating
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================
            2. MAIN ASYMMETRIC MASONRY PORTFOLIO GRID
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
          
          {/* -------------------------------------------------------
              COLUMN 1 (Lg: 3 cols): BEAUTY REEL & SPACES
          ------------------------------------------------------- */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-7">
            
            {/* CARD 1: BEAUTY REEL */}
            <div className="group relative w-full h-[320px] sm:h-[350px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-surface border border-black/[0.06] dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
              <Image
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                alt="Beauty Reel"
                fill
                sizes="(max-width: 640px) 100vw, 350px"
                className="object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
              />
              
              {/* Top Tag Pill */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 dark:bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-900 dark:text-foreground border border-black/5 shadow-xs">
                  BEAUTY • REEL
                </span>
              </div>

              {/* Bottom Text Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white text-left z-10 flex items-end justify-between">
                <div>
                  <h4 className="font-sans font-semibold text-sm text-white">
                    Velvet Dew Lip Care
                  </h4>
                  <p className="text-xs text-white/80 font-sans mt-0.5">
                    2.4M Views
                  </p>
                </div>
                {/* Reel icon */}
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs">
                  ▶
                </div>
              </div>
            </div>

            {/* CARD 5: SPACES */}
            <div className="group relative w-full h-[220px] sm:h-[240px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-surface border border-black/[0.06] dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80"
                alt="Interior Spaces"
                fill
                sizes="(max-width: 640px) 100vw, 350px"
                className="object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 dark:bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-900 dark:text-foreground border border-black/5 shadow-xs">
                  SPACES
                </span>
              </div>
            </div>

          </div>

          {/* -------------------------------------------------------
              COLUMN 2 (Lg: 3 cols): TALL LOOKBOOK CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-3">
            {/* CARD 2: LOOKBOOK #04 */}
            <div className="group relative w-full h-[566px] sm:h-[617px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-surface border border-black/[0.06] dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                alt="Lookbook 04"
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover object-top group-hover:scale-[1.05] transition-transform duration-500 ease-out"
              />
              
              {/* Top Tag Pill */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-[#FCEFEF] dark:bg-secondary/20 text-secondary border border-secondary/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs">
                  LOOKBOOK #04
                </span>
              </div>

              {/* Bottom Text Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 text-white text-left z-10">
                <span className="text-[10px] font-bold tracking-widest uppercase text-pink-200 block mb-1">
                  AUTUMN CAPSULE
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-1.5">
                  Architectural Ease
                </h3>
                <p className="text-xs font-sans text-white/80">
                  8 Assets Delivered • 100% Brand Approval
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------
              COLUMN 3 & 4 (Lg: 6 cols): TOP UGC & GASTRONOMY, BOTTOM WIDE FEATURED TRIP
          ------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            
            {/* TOP ROW (2 SMALLER CARDS SIDE BY SIDE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7">
              
              {/* CARD 3: UGC EDITORIAL */}
              <div className="group relative w-full h-[220px] sm:h-[240px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-surface border border-black/[0.06] dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
                <Image
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
                  alt="UGC Editorial Skincare"
                  fill
                  sizes="(max-width: 640px) 100vw, 350px"
                  className="object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-white/90 dark:bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-900 dark:text-foreground border border-black/5 shadow-xs">
                    UGC EDITORIAL
                  </span>
                </div>
              </div>

              {/* CARD 4: GASTRONOMY */}
              <div className="group relative w-full h-[220px] sm:h-[240px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-surface border border-black/[0.06] dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
                <Image
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
                  alt="Gastronomy Table"
                  fill
                  sizes="(max-width: 640px) 100vw, 350px"
                  className="object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#FCEFEF]/90 dark:bg-secondary/20 text-secondary border border-secondary/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs">
                    GASTRONOMY
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white text-left z-10">
                  <h4 className="font-sans font-semibold text-xs text-white">
                    Slow Living Morning Table
                  </h4>
                </div>
              </div>

            </div>

            {/* BOTTOM ROW (WIDE CAMPAIGN CARD: FEATURED TRIP) */}
            <div className="group relative w-full h-[320px] sm:h-[350px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-surface border border-black/[0.06] dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
              <Image
                src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80"
                alt="Amalfi Horizon Campaign"
                fill
                sizes="(max-width: 640px) 100vw, 700px"
                className="object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
              />
              
              {/* Top Tag Pill */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs">
                  FEATURED TRIP
                </span>
              </div>

              {/* Bottom Text Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 text-white text-left z-10">
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-white mb-1">
                  The Amalfi Horizon Campaign
                </h3>
                <p className="text-xs font-sans text-white/80">
                  Client: Luxury Escapes • 4.1M Reach
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
