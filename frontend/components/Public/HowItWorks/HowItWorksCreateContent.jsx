"use client";

import React from "react";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksCreateContent() {
  const contentFormatLabels = [
    "Reels & Short Videos",
    "Photography",
    "Product Features",
    "Creative Stories",
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & FORMAT LABELS
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              06 · CREATE CONTENT
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Create Content That Tells Your Story.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 max-w-md">
              Creators bring the campaign brief to life through engaging content. Whether it is a reel, video, photograph or another agreed format, the focus is on creating content that feels authentic and connects with the intended audience.
            </p>

            <div className="flex flex-wrap gap-2.5 max-w-full">
              {contentFormatLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="bg-[#FFF5F7] dark:bg-secondary/[0.08] text-slate-800 dark:text-slate-200 border border-pink-100/90 dark:border-pink-500/20 text-xs font-semibold font-sans rounded-full px-4 py-2 shadow-2xs"
                >
                  {label}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: TALL PORTRAIT MEDIA CARD
          ------------------------------------------------------- */}
          <ScrollReveal direction="right" delay={120} className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[9/14] sm:aspect-[9/13] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-slate-900 shadow-xl hover:-translate-y-[6px] hover:scale-[1.01] transition-all duration-300 ease-out group text-left">
              <Image
                src="https://res.cloudinary.com/atr5osne/image/upload/v1792054714/creatorlink/public/editorial/se3wpecdot8jphnowzci.webp"
                alt="Creator Filming Content"
                fill
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] sm:text-xs font-bold tracking-wider font-sans uppercase px-3 py-1 rounded-full shadow-md z-10">
                CREATIVE PRODUCTION
              </div>

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 pointer-events-none">
                <span className="bg-emerald-100/90 dark:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 backdrop-blur-md text-[10px] sm:text-xs font-bold font-sans uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2 shadow-2xs">
                  AUTHENTIC STORYTELLING
                </span>

                <h3 className="font-serif text-lg sm:text-xl font-medium text-white drop-shadow-md mb-1 leading-snug">
                  From Idea to Content.
                </h3>

                <p className="font-sans text-xs text-slate-300 drop-shadow-sm font-medium">
                  Create original content while keeping the campaign&apos;s creative direction in mind.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
