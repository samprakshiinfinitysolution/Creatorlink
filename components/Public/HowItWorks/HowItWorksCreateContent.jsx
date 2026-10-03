"use client";

import React from "react";
import Image from "next/image";

export default function HowItWorksCreateContent() {
  const categoryPills = ["CAMERA", "PRODUCT", "LIGHTING", "CONCEPT", "STORY"];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & PILLS
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              05 · CREATE CONTENT
            </span>

            {/* Editorial Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Now the idea <br className="hidden sm:inline" />
              becomes content.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 max-w-md">
              Creators film with full creative freedom while honoring agreed brief pillars. High-resolution raw and cut drafts are delivered straight into the shared review stream.
            </p>

            {/* Category Pills Row */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 max-w-full">
              {categoryPills.map((pill, idx) => (
                <span
                  key={idx}
                  className="bg-[#FFF5F7] dark:bg-secondary/[0.08] text-slate-800 dark:text-slate-200 border border-pink-100/90 dark:border-pink-500/20 text-[10px] sm:text-xs font-bold font-sans tracking-wider uppercase rounded-full px-3.5 sm:px-4 py-1.5 shadow-2xs hover:-translate-y-0.5 hover:border-secondary/40 transition-all duration-300 cursor-pointer"
                >
                  {pill}
                </span>
              ))}
            </div>

          </div>


          {/* -------------------------------------------------------
              RIGHT COLUMN: TALL PORTRAIT MEDIA CARD (STATIC IMAGE)
          ------------------------------------------------------- */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            
            {/* Media Card Wrapper (Ready for future Video/API replacement) */}
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[9/14] sm:aspect-[9/13] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-slate-900 shadow-xl hover:-translate-y-[6px] hover:scale-[1.01] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out cursor-pointer group text-left">
              
              {/* Static Media Image */}
              <Image src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80" alt="Creator Filming Content" fill className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 50vw" />

              {/* Gradient Vignette Overlay for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

              {/* Top Left Recording Pill Overlay */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] sm:text-xs font-bold tracking-wider font-sans uppercase px-3 py-1 rounded-full shadow-md z-10">
                REC • 4K 60FPS
              </div>

              {/* Top Right Status Pill Overlay */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-emerald-500/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold tracking-wider font-sans uppercase px-3 py-1 rounded-full shadow-md z-10">
                READY
              </div>

              {/* Bottom Content Overlay */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 pointer-events-none">
                
                {/* Content Submitted Pill */}
                <span className="bg-emerald-100/90 dark:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 backdrop-blur-md text-[10px] sm:text-xs font-bold font-sans uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2.5 shadow-2xs">
                  CONTENT SUBMITTED ✓
                </span>

                {/* Main Media Title */}
                <h3 className="font-serif text-lg sm:text-xl font-medium text-white drop-shadow-md mb-1 leading-snug">
                  Reel Cut 01 · Morning Dew Drops
                </h3>

                {/* Subtitle */}
                <p className="font-sans text-xs text-slate-300 drop-shadow-sm font-medium">
                  Deliverables Attached: 2 Reels · 3 Stories
                </p>

              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
