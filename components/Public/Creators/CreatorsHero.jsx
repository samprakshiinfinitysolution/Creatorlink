"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CreatorsHero() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground pt-24 sm:pt-38 lg:pt-42 pb-16 sm:pb-20 lg:pb-34 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">

      {/* CSS Keyframes for Floating Cards & Restrained Hover */}
      <style jsx global>{`
        @keyframes creatorHeroFloat1 {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50% { transform: translateY(-7px) rotate(-5deg); }
        }
        @keyframes creatorHeroFloat2 {
          0%, 100% { transform: translateY(0px) rotate(8deg); }
          50% { transform: translateY(-9px) rotate(9deg); }
        }
        @keyframes creatorHeroFloat3 {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }

        .creator-float-card-1 {
          animation: creatorHeroFloat1 5.5s ease-in-out infinite;
          transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease;
        }
        .creator-float-card-1:hover {
          animation-play-state: paused;
          transform: translateY(-6px) rotate(0deg) scale(1.03) !important;
        }

        .creator-float-card-2 {
          animation: creatorHeroFloat2 6.5s ease-in-out infinite 0.4s;
          transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease;
        }
        .creator-float-card-2:hover {
          animation-play-state: paused;
          transform: translateY(-6px) rotate(0deg) scale(1.03) !important;
        }

        .creator-float-card-3 {
          animation: creatorHeroFloat3 7s ease-in-out infinite 0.8s;
          transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease;
        }
        .creator-float-card-3:hover {
          animation-play-state: paused;
          transform: translateY(-6px) rotate(0deg) scale(1.03) !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .creator-float-card-1, .creator-float-card-2, .creator-float-card-3 {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Ambient background blur */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.05] dark:bg-secondary/[0.03] blur-[140px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">

        {/* =========================================================
            1. TOP EDITORIAL BAR
        ========================================================= */}
        <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/10 pb-4 mb-8 sm:mb-12">
          {/* Left indicator */}
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-slate-600 dark:text-text-muted font-sans">
              FOR CREATORS & VISIONARIES
            </span>
          </div>

          {/* Right subtitle */}
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-slate-600 dark:text-text-muted font-sans">
            AUTUMN / WINTER EDITORIAL ISSUE
          </span>
        </div>

        {/* =========================================================
            HERO MAIN LAYOUT (2 COLUMNS: LEFT ~45%, RIGHT ~55%)
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">

          {/* -------------------------------------------------------
              LEFT COLUMN: EDITORIAL HEADING & ACTION (~45% / 5 COLS)
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 xl:col-span-5 text-left">

            {/* 2. Main Heading */}
            <h1 className="font-serif font-medium uppercase tracking-tight text-slate-900 dark:text-foreground text-5xl sm:text-7xl md:text-8xl lg:text-[84px] xl:text-[92px] leading-[0.92] mb-6">
              MAKE<br />
              <span className="inline-block bg-[#F5D8CE] dark:bg-secondary/20 text-slate-900 dark:text-foreground px-3.5 py-0.5 rounded-sm my-1">
                YOUR
              </span><br />
              MARK.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-md mb-8">
              The private digital sanctuary where elite taste, creative autonomy, and top-tier luxury brand partnerships converge seamlessly.
            </p>

            {/* 3. Two CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
              {/* Primary Button */}
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1917] dark:bg-white text-white dark:text-black hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>JOIN CREATOR HUB</span>
                <span className="text-sm leading-none group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>

              {/* Secondary Button */}
              <Link
                href="/brands"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-transparent border border-slate-300 dark:border-white/20 text-slate-900 dark:text-foreground hover:border-secondary hover:text-secondary font-sans font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>EXPLORE OPPORTUNITIES</span>
              </Link>
            </div>

            {/* 4. Small Supporting Line */}
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-text-muted font-sans mb-8">
              ✦ Free to create your profile • Curated access • No agency lock-in
            </p>

            {/* 5. Creator Profile Mini Card */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl p-3 inline-flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80"
                  alt="Aarohi Mehta"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-bold text-sm text-slate-900 dark:text-foreground">
                    @aarohi.mehta
                  </span>
                  <span className="w-4 h-4 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                </div>
                <p className="text-[10px] font-sans font-bold tracking-wider uppercase text-slate-500 dark:text-text-muted mt-0.5">
                  BEAUTY / LIFESTYLE • 24.8K FOLLOWERS
                </p>
              </div>
            </div>

          </div>

          {/* -------------------------------------------------------
              RIGHT COLUMN: MAIN CREATOR PORTRAIT & FLOATING CARDS (~55% / 7 COLS)
          ------------------------------------------------------- */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center lg:items-end relative pt-4 sm:pt-6 lg:pt-0 lg:pr-4 xl:pr-8 w-full">

            {/* MAIN IMAGE CONTAINER */}
            <div className="relative w-[90%] sm:w-full max-w-[340px] min-[380px]:max-w-[380px] sm:max-w-[480px] lg:max-w-[470px] xl:max-w-[510px] mx-auto lg:mx-0">

              {/* Main Rounded Portrait Visual with Subtle Hover Zoom */}
              <div className="group/main relative w-full h-[350px] min-[380px]:h-[390px] sm:h-[590px] rounded-[28px] sm:rounded-[40px] overflow-hidden shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(255,79,135,0.18)] dark:hover:shadow-secondary/20 transition-all duration-500 ease-out bg-slate-200 dark:bg-surface border border-white/60 dark:border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1000&q=80"
                  alt="Aarohi Mehta - Digital Creator"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover object-[center_20%] sm:object-center group-hover/main:scale-[1.025] transition-transform duration-500 ease-out"
                />

                {/* Dark Gradient Overlay at Bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 sm:p-8 text-white text-left pointer-events-none">
                  <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold text-white mb-2">
                    LOOKBOOK NO. 14
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-0.5">
                    Aarohi Mehta
                  </h3>
                  <p className="text-xs font-sans text-white/80">
                    Digital Creator & Creative Director
                  </p>
                </div>
              </div>

              {/* THREE FLOATING CORNER IMAGE CARDS */}

              {/* TOP-LEFT CARD (Beach / Coastal View) */}
              <div className="absolute -left-3 min-[380px]:-left-5 sm:-left-12 top-3 sm:top-10 w-22 min-[380px]:w-26 sm:w-40 h-16 min-[380px]:h-20 sm:h-30 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white dark:border-surface bg-white dark:bg-surface shadow-xl overflow-hidden creator-float-card-1 z-20">
                <div className="relative w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
                    alt="Coastal Terrace View"
                    fill
                    sizes="(max-width: 640px) 104px, 160px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* TOP-RIGHT CARD (Coffee & Interior with tape detail) */}
              <div className="absolute -right-3 min-[380px]:-right-5 sm:-right-8 -top-3 sm:-top-8 w-20 min-[380px]:w-24 sm:w-36 h-26 min-[380px]:h-30 sm:h-44 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white dark:border-surface bg-white dark:bg-surface shadow-xl overflow-hidden creator-float-card-2 z-20">
                {/* Washi Tape Detail */}
                <div className="w-8 h-2.5 bg-pink-200/90 dark:bg-secondary/40 rounded-sm absolute -top-1 left-1/2 -translate-x-1/2 z-30 shadow-xs" />
                <div className="relative w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"
                    alt="Coffee and linen setup"
                    fill
                    sizes="(max-width: 640px) 96px, 144px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* BOTTOM-RIGHT CARD (Texture detail) */}
              <div className="absolute -right-3 min-[380px]:-right-5 sm:-right-8 bottom-3 sm:bottom-10 w-22 min-[380px]:w-26 sm:w-40 h-16 min-[380px]:h-20 sm:h-30 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white dark:border-surface bg-white dark:bg-surface shadow-xl overflow-hidden creator-float-card-3 z-20">
                <div className="relative w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80"
                    alt="Texture Detail"
                    fill
                    sizes="(max-width: 640px) 104px, 160px"
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                    TEXTURE DETAIL
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM STATUS PILL */}
            <div className="mt-8 lg:mr-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 shadow-sm text-xs font-sans text-slate-700 dark:text-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Currently Accepting Selective Brand Partnerships
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
