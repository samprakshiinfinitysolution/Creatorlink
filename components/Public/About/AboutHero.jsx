'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-44 lg:pb-36 bg-background text-foreground overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-tertiary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ====================================================
            1. HERO TOP STATUS PILL & HEADLINE CONTENT
        ==================================================== */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">

          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface border border-border-theme shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase">
              LIVING MOODBOARD &nbsp;·&nbsp; CURATED ISSUE N° 04 &nbsp;·&nbsp; 12.8K PINS
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium tracking-tight leading-[1.15] text-foreground">
            Where{' '}
            <span className="relative inline-block font-serif italic text-secondary px-3 sm:px-4 py-0.5 rounded-full bg-secondary/15 border border-secondary/20">
              visionary
            </span>{' '}
            minds pin culture into{' '}
            <span className="font-serif italic text-secondary-dark font-normal">
              reality.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl font-sans text-text-secondary leading-relaxed max-w-2xl">
            An art-directed sanctuary where prestige brands and auteur creators pin, collect, and orchestrate singular narratives beyond transactional sponsorship.
          </p>

          {/* Action Button & Supporting Pill */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Primary Button */}
            <Link
              href="/creators"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-background font-sans font-semibold text-xs tracking-wider uppercase shadow-md transition-all duration-300 ease-out hover:bg-secondary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary/20"
            >
              <span>⚡</span>
              <span>EXPLORE THE GUILD BOARDS</span>
            </Link>

            {/* Supporting Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-surface border border-border-theme text-xs font-sans font-medium text-text-secondary shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>1,400+ Curated Tastemakers</span>
              <span className="text-text-secondary/50">|</span>
              <span className="font-mono text-[11px]">paris • nyc • tokyo</span>
            </div>
          </div>

        </div>

        {/* ====================================================
            2. MAIN VISUAL COMPOSITION (STAGGERED EDITORIAL MOODBOARD)
        ==================================================== */}
        <div className="mt-16 sm:mt-20 lg:mt-24 relative max-w-7xl mx-auto min-h-[640px] lg:min-h-[680px] flex flex-col lg:block items-center justify-center gap-12">

          {/* --------------------------------------------------
              A. OFFICIAL GUILD PIN (FLOATING CIRCULAR STAMP)
              Positioned near upper-right of composition.
              Tilted by default (rotate-[14deg]), straightens on hover.
          -------------------------------------------------- */}
          <div className="order-4 lg:order-none lg:absolute lg:top-12 lg:right-28 z-30 creator-float group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface/90 dark:bg-surface-muted/90 backdrop-blur-md border-2 border-dashed border-secondary/40 p-1.5 shadow-xl flex flex-col items-center justify-center text-center rotate-[14deg] transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-[1.03] group-hover:border-secondary group-hover:shadow-secondary/20 cursor-pointer">
              <div className="w-full h-full rounded-full border border-border-theme flex flex-col items-center justify-center p-1">
                <span className="text-[8px] font-mono font-bold tracking-widest text-secondary uppercase leading-none mb-0.5">
                  OFFICIAL
                </span>
                <span className="text-[10px] font-serif font-bold tracking-tight text-foreground leading-none">
                  GUILD
                </span>
                <span className="text-[8px] font-mono font-semibold text-text-secondary leading-none mt-0.5">
                  PIN N° 04
                </span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------
              B. LEFT FLOATING CREATOR CARD
              HIGHEST position in the staggered layout.
              Positioned with comfortable horizontal spacing.
          -------------------------------------------------- */}
          <div className="order-1 sm:order-none lg:absolute lg:left-0 lg:top-0 z-20 w-full max-w-xs lg:w-[270px] group">
            <div className="relative p-3.5 rounded-2xl bg-surface border border-border-theme shadow-xl lg:-rotate-[4deg] transition-all duration-500 ease-out group-hover:rotate-0 group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:border-secondary group-hover:shadow-2xl group-hover:shadow-secondary/20">

              {/* Top Pink Pin Accent */}
              <div className="absolute -top-3 right-6 w-6 h-6 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shadow-sm z-30">
                <span className="text-xs">📌</span>
              </div>

              {/* Header Badge */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="px-2 py-0.5 rounded-md bg-surface-muted text-[10px] font-mono font-bold text-text-secondary tracking-wider uppercase">
                  AUTEUR #12
                </span>
                <span className="text-[10px] font-mono text-secondary font-semibold">
                  LIVE PORTFOLIO
                </span>
              </div>

              {/* Creator Image */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-muted">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="Aarohi M. Tokyo Studio"
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />

                {/* Engagement Overlay Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-border-theme text-[10px] font-mono font-medium text-foreground flex items-center gap-1 shadow-md">
                  <span className="text-secondary">♡</span>
                  <span>3.4k</span>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="mt-3 px-1 flex items-end justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-foreground leading-tight group-hover:text-secondary transition-colors">
                    Aarohi M. Tokyo Studio
                  </h4>
                  <p className="text-[10px] font-mono text-text-secondary mt-0.5 tracking-wider uppercase">
                    35MM ANALOG LOOKBOOK
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[9px] font-mono font-bold uppercase border border-secondary/20">
                  PIN
                </span>
              </div>

            </div>
          </div>

          {/* --------------------------------------------------
              C. CENTER BOARD CARD (MAIN GUILD BOARD DASHBOARD)
              MIDDLE position in the staggered layout.
              Generous horizontal gap from left and right cards.
          -------------------------------------------------- */}
          <div className="order-2 sm:order-none relative lg:mx-auto lg:top-36 z-10 w-full max-w-xl lg:max-w-[540px] group">
            <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-border-theme shadow-2xl transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.015] group-hover:border-secondary group-hover:shadow-2xl group-hover:shadow-secondary/15">

              {/* Board Header Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border-theme">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-wider text-foreground uppercase">
                    BOARD: AUTUMN CAMPAIGN 2026
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-[10px] font-mono font-bold tracking-wider uppercase">
                    99.4% MATCH
                  </span>
                  <span className="text-text-secondary text-xs">•••</span>
                </div>
              </div>

              {/* Dual Visual Tile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">

                {/* Center Connector Badge */}
                <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface border border-border-theme shadow-lg z-20 items-center justify-center text-[9px] font-mono font-bold text-secondary">
                  OR
                </div>

                {/* Left Tile (Luxury Skincare / Beauty Campaign) */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-muted group/tile">
                  <Image
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                    alt="Brand Campaign Still"
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/tile:scale-105"
                    sizes="(max-width: 768px) 100vw, 250px"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-md text-[9px] font-mono font-bold text-text-secondary tracking-wider uppercase border border-border-theme">
                    BRAND STILL
                  </div>
                </div>

                {/* Right Tile (Luxury Architectural Interior View) */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-muted group/tile">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
                    alt="Set Visual"
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/tile:scale-105"
                    sizes="(max-width: 768px) 100vw, 250px"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-md text-[9px] font-mono font-bold text-text-secondary tracking-wider uppercase border border-border-theme">
                    SET VISUAL
                  </div>
                </div>

              </div>

              {/* Bottom Metadata & Color Indicators */}
              <div className="mt-4 pt-3.5 border-t border-border-theme flex items-center justify-between text-[11px] font-mono">
                {/* Palette */}
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary uppercase text-[10px] font-bold">PALETTE:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E5C5B5] border border-black/10 inline-block" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#4A5568] border border-black/10 inline-block" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#2D3748] border border-black/10 inline-block" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0] border border-black/10 inline-block" />
                  </div>
                </div>

                {/* Verification Tag */}
                <div className="flex items-center gap-1.5 text-text-secondary font-semibold uppercase text-[10px]">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>VERIFIED GUILD COLLAB</span>
                </div>
              </div>

            </div>
          </div>

          {/* --------------------------------------------------
              D. RIGHT FLOATING PRODUCTION CARD
              LOWEST position in the staggered layout.
              Positioned with comfortable horizontal spacing.
          -------------------------------------------------- */}
          <div className="order-3 sm:order-none lg:absolute lg:right-0 lg:top-72 z-20 w-full max-w-xs lg:w-[270px] group">
            <div className="relative p-3.5 rounded-2xl bg-surface border border-border-theme shadow-xl lg:rotate-[4deg] transition-all duration-500 ease-out group-hover:rotate-0 group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:border-secondary group-hover:shadow-2xl group-hover:shadow-secondary/20">

              {/* Header Washi Tape Accent */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-secondary/30 rounded-sm border border-secondary/40 backdrop-blur-sm z-30" />

              {/* Image Container */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-muted mt-1">
                <Image
                  src="https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?auto=format&fit=crop&w=600&q=80"
                  alt="Paris Set 16mm"
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 270px"
                />

                {/* Badge Overlay */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-md text-[9px] font-mono font-bold text-foreground tracking-wider uppercase border border-border-theme">
                  PARIS SET · 16MM
                </div>

                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-secondary/85 text-white text-[9px] font-mono font-semibold uppercase backdrop-blur-sm shadow-sm">
                  Pinned to Board
                </div>
              </div>

              {/* Bottom Editorial Note */}
              <div className="mt-3 p-2.5 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-secondary uppercase">
                    DIRECTOR CUT
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-secondary/20 text-secondary uppercase font-bold">
                    NOTE
                  </span>
                </div>
                <p className="text-xs font-serif italic text-foreground leading-snug">
                  "Where brand feels like cinema, not sponsorship."
                </p>
              </div>

            </div>
          </div>

          {/* --------------------------------------------------
              E. DIRECT DIALOGUE STATUS PILL
              Positioned directly below the Center Board Card, aligned toward its lower-left edge.
          -------------------------------------------------- */}
          <div className="order-5 sm:order-none lg:absolute lg:top-[534px] lg:left-[26%] z-30 transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-surface border border-border-theme text-xs font-mono font-bold tracking-widest text-text-secondary uppercase shadow-sm backdrop-blur-sm hover:border-secondary hover:text-foreground">
              <span className="text-secondary font-serif text-sm">✣</span>
              <span>DIRECT DIALOGUE &nbsp;·&nbsp; ZERO BROKERAGE</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
