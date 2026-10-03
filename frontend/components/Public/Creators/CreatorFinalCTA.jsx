"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CreatorFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 bottom-10 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[180px]" />

      <div className="mx-auto max-w-[1320px] relative z-10">
        
        {/* =========================================================
            MAIN CTA CONTAINER CARD
            Two columns on desktop:
            - Left: Soft pale pink background content area (~60%)
            - Right: Editorial visual image container (~40%)
        ========================================================= */}
        <div className="bg-[#FAF0ED] dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: CONTENT & ACTION
          ------------------------------------------------------- */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-left">
            <div>
              {/* Eyebrow */}
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 sm:mb-4">
                JOIN CREATOR HUB TODAY
              </span>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4 sm:mb-6">
                Ready to make your mark?
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 sm:mb-10 max-w-lg">
                Create your profile. Show your work. Meet brands that appreciate your aesthetic and pay on time.
              </p>

              {/* CTA Button & Instant Verification Note */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10 sm:mb-12">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2.5 bg-slate-900 dark:bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase px-7 sm:px-9 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex-shrink-0"
                >
                  <span>JOIN CREATOR HUB</span>
                  <span className="text-base group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>

                <span className="text-xs sm:text-sm font-sans text-slate-500 dark:text-text-muted font-medium">
                  Instant verification review
                </span>
              </div>
            </div>

            {/* Subtle Divider & Benefits Row */}
            <div>
              <div className="border-t border-slate-200/80 dark:border-white/10 mb-6 sm:mb-8" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm font-sans font-medium text-slate-700 dark:text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>No platform exclusivity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>Keep 100% of your earnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>Direct brand contracts</span>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------
              RIGHT COLUMN: EDITORIAL VISUAL WITH FLOATING BADGES
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 relative min-h-[360px] sm:min-h-[440px] lg:min-h-full overflow-hidden bg-slate-100 dark:bg-white/5 group">
            
            {/* Visual Image */}
            <Image src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80" alt="Elite Fashion & Lifestyle Creator" fill className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 50vw" />

            {/* Subtle Inner Image Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

            {/* FLOATING BADGE 1: TOP-LEFT */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white font-sans text-[10px] sm:text-xs font-bold tracking-wider uppercase px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border border-slate-200/60 dark:border-white/10 flex items-center gap-1.5 pointer-events-none">
              <span>CREATOR VERIFIED ✓</span>
            </div>

            {/* FLOATING BADGE 2: TOP-RIGHT */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-[#FCE7F3] dark:bg-secondary/30 backdrop-blur-md text-slate-900 dark:text-pink-100 font-sans text-[10px] sm:text-xs font-bold tracking-wider uppercase px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border border-pink-200/60 dark:border-pink-500/20 flex items-center gap-1.5 pointer-events-none">
              <span>PAID ON TIME ✓</span>
            </div>

            {/* FLOATING BADGE 3: BOTTOM-LEFT */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white font-sans text-[10px] sm:text-xs font-bold tracking-wider uppercase px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md border border-white/10 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>5.0 ★ RATED CREATOR</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
