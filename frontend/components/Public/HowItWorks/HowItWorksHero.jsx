"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground pt-24 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 -translate-y-1/2 h-[550px] w-[750px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[180px]" />

      <div className="mx-auto max-w-[1320px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION, CTAS & SUPPORTING
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-6 text-left">
            {/* 1. Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 bg-[#FCE7F3]/70 dark:bg-secondary/20 border border-pink-200/80 dark:border-pink-500/20 rounded-full px-4 py-1.5 mb-6 shadow-2xs">
              <span className="text-secondary font-bold text-xs">•</span>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-800 dark:text-foreground font-sans">
                HOW CREATORLINK WORKS
              </span>
            </div>

            {/* 2. Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[50px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-6">
              Great Collaborations Start With the{" "}
              <span className="inline-block bg-[#FCE7F3] dark:bg-secondary/30 text-slate-900 dark:text-pink-100 rounded-2xl sm:rounded-[22px] px-3.5 sm:px-4 py-0.5 sm:py-1 font-serif text-3xl sm:text-4xl lg:text-[46px] align-baseline shadow-2xs">
                Right
              </span>{" "}
              Connection.
            </h1>

            {/* 3. Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 sm:mb-10 max-w-xl">
              CreatorLink brings brands and creators together to turn ideas into meaningful collaborations. Discover the right people, connect with each other and create content that makes an impact.
            </p>

            {/* 4. Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-8">
              <Link
                href="/creators"
                className="text-center bg-secondary text-white dark:bg-secondary dark:text-white font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-secondary-dark hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-2xs"
              >
                Explore Creators
              </Link>

              <Link
                href="/signup?role=creator"
                className="text-center bg-white dark:bg-slate-900/90 text-slate-900 dark:text-foreground font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full border border-slate-200/80 dark:border-white/20 hover:border-secondary hover:text-secondary dark:hover:text-pink-200 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-2xs"
              >
                Join as a Creator
              </Link>
            </div>

            {/* 5. Supporting Text */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-white/10">
              <p className="text-xs sm:text-sm font-sans font-medium text-slate-500 dark:text-text-muted">
                One platform. Two sides. Endless possibilities to create together.
              </p>
            </div>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: VISUAL WITH CARDS & PILLS
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-6 relative flex flex-col items-center lg:items-end justify-center min-h-[520px] pt-8 pb-20 lg:py-6">
            <div className="relative w-full max-w-[480px] lg:w-[490px] lg:max-w-[490px]">
              {/* Floating Category Tags Top Left */}
              <div className="absolute -top-7 left-2 sm:-top-8 sm:-left-8 lg:-left-12 z-20 flex flex-col gap-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase rounded-full px-3.5 sm:px-4 py-1.5 shadow-2xs">
                    DISCOVER
                  </span>
                  <span className="bg-[#FCE7F3] dark:bg-secondary/40 text-slate-900 dark:text-pink-100 border border-pink-200/80 dark:border-pink-500/20 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase rounded-full px-3.5 sm:px-4 py-1.5 shadow-2xs">
                    CONNECT
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="bg-[#FCE7F3]/70 dark:bg-slate-900/95 text-slate-800 dark:text-white border border-pink-200/70 dark:border-white/10 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase rounded-full px-3.5 sm:px-4 py-1.5 shadow-2xs">
                    COLLABORATE
                  </span>
                </div>
              </div>

              {/* Main Image Container */}
              <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[460px] rounded-[32px] sm:rounded-[36px] overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xl group ml-auto">
                <Image
                  src="https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp"
                  alt="Creator Collaboration"
                  fill
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, 490px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

                <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 z-10 text-left pointer-events-none">
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase mb-2 inline-block">
                    COLLABORATION BRIEF
                  </span>
                  <h3 className="font-sans text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                    Brand & Creator Partnerships
                  </h3>
                </div>
              </div>

              {/* Floating Collaboration Card */}
              <div className="absolute -bottom-10 left-2 sm:-left-8 lg:-left-16 z-30 w-[280px] sm:w-[320px] bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl text-left">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted font-sans">
                    SHARED CAMPAIGN
                  </span>
                  <span className="bg-emerald-100/90 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                    CONNECTED
                  </span>
                </div>
                <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 dark:text-foreground mb-2 leading-snug">
                  Product Launch & Creative Storytelling
                </h4>
                <div className="border-t border-slate-100 dark:border-white/10 pt-2.5 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-text-muted font-medium">
                  <span>Authentic Reach</span>
                  <span>Agreed Deliverables</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
