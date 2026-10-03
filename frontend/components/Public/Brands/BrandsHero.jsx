"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function BrandsHero() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* CSS Keyframes for Hero Animations */}
      <style jsx global>{`
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatCard3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatCard4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .hero-float-1 { animation: floatCard1 5.5s ease-in-out infinite; }
        .hero-float-2 { animation: floatCard2 6.5s ease-in-out infinite 0.5s; }
        .hero-float-3 { animation: floatCard3 6.8s ease-in-out infinite 0.2s; }
        .hero-float-4 { animation: floatCard4 7.2s ease-in-out infinite 0.7s; }

        .card-tilt-right {
          transform: rotate(3.5deg);
          transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease, border-color 400ms ease;
        }
        .card-tilt-right:hover {
          transform: translateY(-6px) rotate(0deg) scale(1.03);
        }

        .card-tilt-left {
          transform: rotate(-3.5deg);
          transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease, border-color 400ms ease;
        }
        .card-tilt-left:hover {
          transform: translateY(-6px) rotate(0deg) scale(1.03);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-float-1, .hero-float-2, .hero-float-3, .hero-float-4 {
            animation: none !important;
          }
          .card-tilt-right, .card-tilt-left {
            transform: none !important;
          }
        }
      `}</style>

      {/* Ambient Soft Pink & Purple Glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.06] dark:bg-secondary/[0.04] blur-[140px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 translate-x-1/3 h-[400px] w-[400px] rounded-full bg-tertiary/[0.05] dark:bg-tertiary/[0.03] blur-[150px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* =========================================================
              LEFT COLUMN: EDITORIAL CONTENT
          ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 text-left">
            {/* Small Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <span className="text-secondary text-xs">•</span>
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-secondary font-sans">
                FOR BRANDS ✦
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-6">
              Your brand.<br />
              <span className="relative inline-block px-3 py-0.5 bg-secondary/15 dark:bg-secondary/20 rounded-2xl text-foreground font-serif my-1">
                Their influence.
              </span><br />
              One meaningful<br />
              collaboration.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-text-secondary font-sans leading-relaxed max-w-xl mb-8 sm:mb-10">
              Discover creators who fit your brand, build authentic campaigns, and turn creative briefs into high-impact content people remember.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5 mb-10">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <span>Start a Campaign</span>
                <span className="text-base leading-none">→</span>
              </Link>

              <Link
                href="/creators"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-surface hover:bg-surface-muted border border-foreground/30 text-foreground font-sans font-semibold text-sm tracking-wide hover:border-secondary transition-all duration-300"
              >
                <span>Explore Creators</span>
                <span className="text-base leading-none">→</span>
              </Link>
            </div>

            {/* Divider Line & Trust Statement */}
            <div className="pt-6 border-t border-border-theme/60 flex items-center gap-4">
              {/* 3 Overlapping Circular Initials */}
              <div className="flex items-center shrink-0">
                <div className="w-7 h-7 rounded-full bg-secondary/15 border border-surface text-secondary text-xs font-bold font-sans flex items-center justify-center z-30">
                  V
                </div>
                <div className="w-7 h-7 rounded-full bg-secondary/20 border border-surface text-secondary text-xs font-bold font-sans flex items-center justify-center -ml-2 z-20">
                  K
                </div>
                <div className="w-7 h-7 rounded-full bg-secondary/25 border border-surface text-secondary text-xs font-bold font-sans flex items-center justify-center -ml-2 z-10">
                  L
                </div>
              </div>

              <p className="text-xs text-text-secondary font-sans leading-snug max-w-sm">
                Trusted by modern luxury houses, boutique agencies & direct-to-consumer icons.
              </p>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: 4 CREATOR CARDS EDITORIAL COMPOSITION
          ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <div className="relative w-full max-w-[620px] mx-auto h-[500px] sm:h-[560px] flex items-center justify-center">

              {/* TOP CARD 1 (Camille Dupont - Top Left) */}
              <div className="absolute z-20 top-[0%] left-0 hero-float-1 w-[210px] sm:w-[235px]">
                <div className="group relative bg-surface p-3 rounded-2xl border border-border-theme/80 shadow-md transition-all duration-350 hover:scale-[1.03] hover:-translate-y-[6px] hover:border-secondary/60 hover:shadow-[0_12px_32px_rgba(255,79,135,0.22)] cursor-pointer">
                  {/* Image Container with Verified Badge */}
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-surface-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                      alt="Camille Dupont"
                      fill
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 235px"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white flex items-center gap-1 font-sans">
                      <span className="text-emerald-400 text-[10px]">✔</span>
                      <span>Verified</span>
                    </div>

                    {/* Floating Pill on image */}
                    <div className="absolute bottom-2 left-2 z-10">
                      <div className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-border-theme/60 text-[10px] font-bold text-foreground flex items-center gap-1 font-sans shadow-xs">
                        <span className="text-secondary">✦</span>
                        <span>Audience Fit 98.4%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground font-sans leading-none">
                        Camille Dupont
                      </h3>
                      <p className="text-[11px] text-text-secondary font-sans mt-1">
                        Paris
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground font-sans block leading-none">
                        4.9 ★
                      </span>
                      <span className="text-[10px] text-text-secondary font-sans block mt-1">
                        ₹22K/collab
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP CARD 2 (Sora Lin - Top Right) */}
              <div className="absolute z-20 top-[6%] right-0 hero-float-2 w-[205px] sm:w-[225px]">
                <div className="group relative bg-surface p-3 rounded-2xl border border-border-theme/80 shadow-md transition-all duration-350 hover:scale-[1.03] hover:-translate-y-[6px] hover:border-secondary/60 hover:shadow-[0_12px_32px_rgba(255,79,135,0.22)] cursor-pointer">
                  {/* Image Container with Available Next Week Badge */}
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-surface-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400"
                      alt="Sora Lin"
                      fill
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 225px"
                    />
                    <div className="absolute bottom-2 left-2 z-10">
                      <div className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-border-theme/60 text-[10px] font-semibold text-foreground flex items-center gap-1.5 font-sans shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Available Next Week</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground font-sans leading-none">
                        Sora Lin
                      </h3>
                      <p className="text-[10px] text-text-secondary font-sans mt-1">
                        Tokyo / London • Skincare
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold font-sans">
                      38.4K
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM CARD 1 (Marcus Vance - Bottom Left: Default Tilted RIGHT rotate 3.5deg -> Hover Straightens to 0deg) */}
              <div className="absolute z-20 bottom-[2%] left-[4%] hero-float-3 w-[205px] sm:w-[225px]">
                <div className="group relative card-tilt-right bg-surface p-3 rounded-2xl border border-border-theme/80 shadow-md hover:border-secondary/60 hover:shadow-[0_14px_35px_rgba(255,79,135,0.25)] cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-surface-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                      alt="Marcus Vance"
                      fill
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 225px"
                    />
                  </div>

                  {/* Card Info */}
                  <div>
                    <h3 className="text-xs font-bold text-foreground font-sans leading-none">
                      Marcus Vance
                    </h3>
                    <p className="text-[10px] text-text-secondary font-sans mt-1">
                      Culinary & Interior • 94% Match
                    </p>
                  </div>
                </div>
              </div>

              {/* BOTTOM CARD 2 (Elena Rostova - Bottom Right: Default Tilted LEFT rotate -3.5deg -> Hover Straightens to 0deg) */}
              <div className="absolute z-20 bottom-[0%] right-[2%] hero-float-4 w-[195px] sm:w-[215px]">
                <div className="group relative card-tilt-left bg-surface p-3 rounded-2xl border border-border-theme/80 shadow-md hover:border-secondary/60 hover:shadow-[0_14px_35px_rgba(255,79,135,0.25)] cursor-pointer">
                  {/* Image Container with Engagement Pill */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-surface-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400"
                      alt="Elena Rostova"
                      fill
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 215px"
                    />
                    <div className="absolute top-2 right-2 z-10">
                      <div className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-border-theme/60 text-[9px] font-semibold text-foreground flex items-center gap-1 font-sans shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        <span>Avg. Engagement 6.8%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground font-sans leading-none">
                      Elena Rostova
                    </h3>
                    <span className="text-[10px] font-semibold text-text-secondary font-sans">
                      ₹18K
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
