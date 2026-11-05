"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/theme/ScrollReveal";

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
        <ScrollReveal direction="up" delay={0}>
          <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/10 pb-4 mb-8 sm:mb-12">
            {/* Left indicator */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-slate-600 dark:text-text-muted font-sans">
                FOR CONTENT CREATORS & ARTISTS
              </span>
            </div>

            {/* Right indicator */}
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-secondary font-sans">
              CREATOR COLLABORATIONS
            </span>
          </div>
        </ScrollReveal>

        {/* =========================================================
            HERO MAIN LAYOUT (2 COLUMNS: LEFT ~45%, RIGHT ~55%)
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">

          {/* -------------------------------------------------------
              LEFT COLUMN: EDITORIAL HEADING & ACTION (~45% / 5 COLS)
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 xl:col-span-5 text-left">

            {/* 2. Main Heading */}
            <ScrollReveal direction="up" delay={80}>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-3 font-sans">
                BUILT FOR CREATORS
              </span>

              <h1 className="font-serif font-medium tracking-tight text-slate-900 dark:text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] leading-[1.08] mb-6">
                Your Creativity Deserves the Right Opportunities.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-md mb-8">
                You have the ideas, the talent and the passion to create. CreatorLink helps you showcase your work, connect with brands and explore collaboration opportunities that match your creative style.
              </p>
            </ScrollReveal>

            {/* 3. Two CTA Buttons & Supporting Line */}
            <ScrollReveal direction="up" delay={160}>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
                {/* Primary Button */}
                <Link
                  href="/signup?role=creator"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1917] dark:bg-white text-white dark:text-black hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>JOIN AS A CREATOR</span>
                  <span className="text-sm leading-none group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>

                {/* Secondary Button */}
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-transparent border border-slate-300 dark:border-white/20 text-slate-900 dark:text-foreground hover:border-secondary hover:text-secondary font-sans font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>EXPLORE HOW IT WORKS</span>
                </Link>
              </div>

              {/* 4. Small Supporting Line */}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans mb-8">
                Show your work. Find your people. Create your next opportunity.
              </p>
            </ScrollReveal>

            {/* 5. Creator Profile Mini Card (Sample Illustrative Profile) */}
            <ScrollReveal direction="up" delay={240}>
              <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl p-3 inline-flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                  <Image
                    src="https://res.cloudinary.com/atr5osne/image/upload/v1792054754/creatorlink/public/creators/asaeu3b0m8gtfekaphzu.webp"
                    alt="Creative Portfolio Sample"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-bold text-sm text-slate-900 dark:text-foreground">
                      Sample Creator Profile
                    </span>
                  </div>
                  <p className="text-[10px] font-sans font-bold tracking-wider uppercase text-slate-500 dark:text-text-muted mt-0.5">
                    LIFESTYLE &amp; VISUAL STORYTELLER
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* -------------------------------------------------------
              RIGHT COLUMN: MAIN CREATOR PORTRAIT & FLOATING CARDS (~55% / 7 COLS)
          ------------------------------------------------------- */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center lg:items-end relative pt-4 sm:pt-6 lg:pt-0 lg:pr-4 xl:pr-8 w-full">

            {/* MAIN IMAGE CONTAINER */}
            <ScrollReveal direction="left" delay={120} className="w-full flex justify-center lg:justify-end">
              <div className="relative w-[90%] sm:w-full max-w-[340px] min-[380px]:max-w-[380px] sm:max-w-[480px] lg:max-w-[470px] xl:max-w-[510px] mx-auto lg:mx-0">

                {/* Main Rounded Portrait Visual */}
                <div className="group/main relative w-full h-[350px] min-[380px]:h-[390px] sm:h-[590px] rounded-[28px] sm:rounded-[40px] overflow-hidden shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(255,79,135,0.18)] dark:hover:shadow-secondary/20 transition-all duration-500 ease-out bg-slate-200 dark:bg-surface border border-white/60 dark:border-white/10">
                  <Image
                    src="https://res.cloudinary.com/atr5osne/image/upload/v1792054754/creatorlink/public/creators/asaeu3b0m8gtfekaphzu.webp"
                    alt="Creator Visual Portrait"
                    fill
                    preload
                    sizes="(max-width: 768px) 100vw, 520px"
                    className="object-cover object-[center_20%] sm:object-center group-hover/main:scale-[1.025] transition-transform duration-500 ease-out"
                  />

                  {/* Dark Gradient Overlay at Bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 sm:p-8 text-white text-left pointer-events-none">
                    <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold text-white mb-2">
                      PORTFOLIO SHOWCASE
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-0.5">
                      Authentic Storytelling
                    </h3>
                    <p className="text-xs font-sans text-white/80">
                      Showcase your niche, aesthetic and creative style
                    </p>
                  </div>
                </div>

                {/* THREE FLOATING CORNER IMAGE CARDS */}

                {/* TOP-LEFT CARD */}
                <div className="absolute -left-3 min-[380px]:-left-5 sm:-left-12 top-3 sm:top-10 w-22 min-[380px]:w-26 sm:w-40 h-16 min-[380px]:h-20 sm:h-30 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white dark:border-surface bg-white dark:bg-surface shadow-xl overflow-hidden creator-float-card-1 z-20">
                  <div className="relative w-full h-full">
                    <Image
                      src="https://res.cloudinary.com/atr5osne/image/upload/v1792054758/creatorlink/public/editorial/avjxgors8karuxcb8p43.webp"
                      alt="Lifestyle Imagery"
                      fill
                      sizes="(max-width: 640px) 104px, 160px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* TOP-RIGHT CARD */}
                <div className="absolute -right-3 min-[380px]:-right-5 sm:-right-8 -top-3 sm:-top-8 w-20 min-[380px]:w-24 sm:w-36 h-26 min-[380px]:h-30 sm:h-44 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white dark:border-surface bg-white dark:bg-surface shadow-xl overflow-hidden creator-float-card-2 z-20">
                  <div className="w-8 h-2.5 bg-pink-200/90 dark:bg-secondary/40 rounded-sm absolute -top-1 left-1/2 -translate-x-1/2 z-30 shadow-xs" />
                  <div className="relative w-full h-full">
                    <Image
                      src="https://res.cloudinary.com/atr5osne/image/upload/v1792054745/creatorlink/public/campaigns/tt4slqpoo1tprmx7ndss.webp"
                      alt="Content Aesthetics"
                      fill
                      sizes="(max-width: 640px) 96px, 144px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* BOTTOM-RIGHT CARD */}
                <div className="absolute -right-3 min-[380px]:-right-5 sm:-right-8 bottom-3 sm:bottom-10 w-22 min-[380px]:w-26 sm:w-40 h-16 min-[380px]:h-20 sm:h-30 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white dark:border-surface bg-white dark:bg-surface shadow-xl overflow-hidden creator-float-card-3 z-20">
                  <div className="relative w-full h-full">
                    <Image
                      src="https://res.cloudinary.com/atr5osne/image/upload/v1792054860/creatorlink/public/campaigns/tmkqzb5b64olyrrvyscm.webp"
                      alt="Product Details"
                      fill
                      sizes="(max-width: 640px) 104px, 160px"
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                      DETAILS
                    </div>
                  </div>
                </div>

              </div>
            </ScrollReveal>

            {/* BOTTOM STATUS PILL */}
            <ScrollReveal direction="up" delay={200} className="mt-8 lg:mr-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 shadow-sm text-xs font-sans text-slate-700 dark:text-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Open for Meaningful Brand Collaborations
              </div>
            </ScrollReveal>

          </div>

        </div>

      </div>
    </section>
  );
}
