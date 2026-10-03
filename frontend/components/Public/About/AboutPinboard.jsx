'use client';

import React from 'react';
import Image from 'next/image';

export default function AboutPinboard() {
  return (
    <section className="relative py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ====================================================
            1. TOP EDITORIAL HEADER CONTENT
        ==================================================== */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-6 shadow-sm">
            <span className="text-secondary text-sm">⚑</span>
            <span>PINBOARD STORY N° 01</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-6">
            Great ideas happen when the right people find each other's boards.
          </h2>

          {/* Supporting Paragraph */}
          <p className="text-base sm:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl">
            Brands have stories waiting for translation. Creators hold the authentic visual vernacular. Creator Hub is the collaborative pinboard where both assemble singular campaigns without frictional agency layers.
          </p>
        </div>

        {/* ====================================================
            2. MAIN PINBOARD CANVAS
        ==================================================== */}
        <div className="relative p-5 sm:p-8 lg:p-12 rounded-[32px] sm:rounded-[40px] bg-surface/60 dark:bg-theme-dark-surface/60 border border-border-theme backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-secondary/30">

          {/* Decorative Washi Tape Accents on Canvas Corners */}
          <div className="absolute -top-3 left-10 sm:left-16 w-24 sm:w-28 h-5 bg-secondary/25 border border-secondary/35 rounded-sm backdrop-blur-sm -rotate-3 z-20 shadow-sm pointer-events-none" />
          <div className="absolute -top-3 right-10 sm:right-16 w-24 sm:w-28 h-5 bg-secondary/25 border border-secondary/35 rounded-sm backdrop-blur-sm rotate-3 z-20 shadow-sm pointer-events-none" />

          {/* Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center relative z-10">

            {/* --------------------------------------------------
                LEFT CARD: PIN #01 · THE BRAND BRIEF
                Equal size twin card. Rotates left by default (-3.5deg).
                Straightens to 0deg on hover.
            -------------------------------------------------- */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#FDF2F5] dark:bg-secondary/[0.08] border border-secondary/20 dark:border-secondary/30 shadow-md flex flex-col justify-between h-full min-h-[380px] sm:min-h-[420px] transition-all duration-500 ease-out lg:-rotate-[1deg] hover:rotate-0 hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl hover:shadow-secondary/15 hover:border-secondary group/card">

              {/* Card Top Label & Editorial Note */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-foreground tracking-wider uppercase">
                  PIN #01 · THE BRAND BRIEF
                </span>
                <span className="text-xs font-serif italic text-text-secondary">
                  mood: refined editorial
                </span>
              </div>

              {/* Main Image with Overlay Badge */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] h-44 sm:h-52 bg-surface-muted mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  alt="Maison Nord Autumn Scope"
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-full bg-background/90 text-foreground text-[10px] font-mono font-medium border border-border-theme shadow-sm backdrop-blur-md">
                  Maison Nord · Autumn Scope
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="flex items-end justify-between gap-2 pt-1">
                <div>
                  <span className="block text-[9px] font-mono font-bold tracking-widest text-text-secondary uppercase mb-0.5">
                    THE BRAND VISION
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground leading-snug group-hover/card:text-secondary transition-colors">
                    Architectural Campaign Ideation
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface text-secondary text-[10px] font-mono font-semibold border border-secondary/20 shrink-0">
                  Pinned Identity
                </span>
              </div>

            </div>

            {/* --------------------------------------------------
                CENTER CONNECTOR
            -------------------------------------------------- */}
            <div className="lg:col-span-2 flex justify-center items-center py-2 lg:py-0 relative z-20">
              {/* Background Connecting Line on Desktop */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1px] bg-border-theme -translate-y-1/2 z-0" />

              {/* Connector Circular Badge */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-surface border border-secondary/30 shadow-lg flex flex-col items-center justify-center text-center p-2 transition-all duration-300 hover:scale-110 hover:border-secondary cursor-pointer group/conn">
                <span className="text-secondary text-[10px] leading-none mb-0.5">✢</span>
                <span className="font-mono text-[9px] font-bold text-foreground uppercase leading-none">COLLAB</span>
                <span className="font-mono text-[9px] font-bold text-foreground uppercase leading-none mt-0.5">PIN</span>
                <span className="font-serif italic text-[8px] text-secondary mt-0.5">living match</span>
              </div>
            </div>

            {/* --------------------------------------------------
                RIGHT CARD: PIN #02 · THE CREATOR LENS
                Equal size twin card. Rotates right by default (+3.5deg).
                Straightens to 0deg on hover.
            -------------------------------------------------- */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#FDF2F5] dark:bg-secondary/[0.08] border border-secondary/20 dark:border-secondary/30 shadow-md flex flex-col justify-between h-full min-h-[380px] sm:min-h-[420px] transition-all duration-500 ease-out lg:rotate-[1deg] hover:rotate-0 hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl hover:shadow-secondary/15 hover:border-secondary group/card">

              {/* Card Top Label & Editorial Note */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-foreground tracking-wider uppercase">
                  PIN #02 · THE CREATOR LENS
                </span>
                <span className="text-xs font-serif italic text-text-secondary">
                  solitary craft
                </span>
              </div>

              {/* Main Image with Overlay Badge */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] h-44 sm:h-52 bg-surface-muted mb-4">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  alt="Soren K Copenhagen"
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-background/90 text-foreground text-[10px] font-mono font-medium border border-border-theme shadow-sm backdrop-blur-md">
                  Soren K. · Copenhagen
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="flex items-end justify-between gap-2 pt-1">
                <div>
                  <span className="block text-[9px] font-mono font-bold tracking-widest text-text-secondary uppercase mb-0.5">
                    THE CREATOR VOICE
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground leading-snug group-hover/card:text-secondary transition-colors">
                    Pure Cultural Resonance
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface text-secondary text-[10px] font-mono font-semibold border border-secondary/20 shrink-0">
                  Authentic Craft
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
