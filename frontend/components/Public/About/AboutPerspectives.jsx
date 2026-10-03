'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPerspectives() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[800px] h-[350px] sm:h-[600px] lg:h-[800px] bg-secondary/10 blur-[120px] sm:blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER
        ==================================================== */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16 lg:mb-20">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-[10px] sm:text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-4 shadow-sm">
            <span className="text-secondary text-xs sm:text-sm">⬡</span>
            <span>TWO PERSPECTIVES</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground max-w-3xl leading-[1.15]">
            Two Sides. One Collaborative Board.
          </h2>
        </div>

        {/* ====================================================
            2. TWO PERSPECTIVE CARDS (SIDE BY SIDE)
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          
          {/* --------------------------------------------------
              CARD A: FOR BRANDS
          -------------------------------------------------- */}
          <div className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-surface border border-border-theme shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-secondary">
            <div>
              {/* Card Header Row */}
              <div className="flex items-center justify-between mb-5">
                {/* Board Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/15 border border-secondary/25 text-[10px] sm:text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                  BOARD A · FOR BRANDS
                </div>
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-surface border border-border-theme flex items-center justify-center text-text-secondary text-sm shadow-sm">
                  🏢
                </div>
              </div>

              {/* Image Frame */}
              <div className="relative w-full h-52 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 shadow-md border border-border-theme">
                <Image
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                  alt="Curated Lookbook for Brands"
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Image Overlay Tag (Bottom Left) */}
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[10px] font-medium tracking-wide shadow-md">
                  Curated Lookbook
                </div>
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-secondary transition-colors mb-3 leading-snug">
                Bring your ideas to life with visionary talent.
              </h3>

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                Find creators who inhabit your customer's cultural world and can translate your heritage into fresh visual formats that drive real sentiment.
              </p>
            </div>

            {/* Bottom CTA Link */}
            <div className="pt-2 border-t border-border-theme/60">
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-foreground uppercase group-hover:text-secondary transition-colors"
              >
                <span>EXPLORE BRAND DIRECTORY</span>
                <span className="text-secondary text-sm group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* --------------------------------------------------
              CARD B: FOR CREATORS
          -------------------------------------------------- */}
          <div className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-surface border border-border-theme shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-secondary">
            <div>
              {/* Card Header Row */}
              <div className="flex items-center justify-between mb-5">
                {/* Board Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/15 border border-secondary/25 text-[10px] sm:text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                  BOARD B · FOR CREATORS
                </div>
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-surface border border-border-theme flex items-center justify-center text-text-secondary text-sm shadow-sm">
                  🎨
                </div>
              </div>

              {/* Image Frame */}
              <div className="relative w-full h-52 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 shadow-md border border-border-theme">
                <Image
                  src="https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?auto=format&fit=crop&w=800&q=80"
                  alt="Auteur Profile for Creators"
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Image Overlay Tag (Bottom Right) */}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[10px] font-medium tracking-wide shadow-md">
                  Auteur Profile
                </div>
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-secondary transition-colors mb-3 leading-snug">
                Turn your signature aesthetic into sustainable equity.
              </h3>

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                Showcase your tactile portfolio, discover brands that respect your independence, and work with transparent escrow and prompt payouts.
              </p>
            </div>

            {/* Bottom CTA Link */}
            <div className="pt-2 border-t border-border-theme/60">
              <Link
                href="/creators"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-foreground uppercase group-hover:text-secondary transition-colors"
              >
                <span>APPLY TO THE GUILD</span>
                <span className="text-secondary text-sm group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
