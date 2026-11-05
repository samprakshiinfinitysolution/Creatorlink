"use client";

import React from "react";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksDiscovery() {
  const creators = [
    {
      id: 1,
      name: "Aarohi Mehta",
      niche: "Clean Beauty & Skincare",
      tag: "Beauty",
      image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp",
      staggerClass: "lg:translate-y-4",
    },
    {
      id: 2,
      name: "Riya Sharma",
      niche: "Visual Storytelling & Art",
      tag: "Lifestyle",
      image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054701/creatorlink/public/avatars/qooau1mzc4okikpsrqri.webp",
      staggerClass: "lg:-translate-y-2",
    },
    {
      id: 3,
      name: "Maya Kapoor",
      niche: "Fashion & Creative Styling",
      tag: "Fashion",
      image: "https://res.cloudinary.com/atr5osne/image/upload/v1792056014/creatorlink/public/avatars/bqycu9zbswhrpnc7aznv.webp",
      staggerClass: "lg:translate-y-2",
    },
  ];

  const supportingPoints = [
    "Explore creator profiles.",
    "Discover different content niches.",
    "Understand each creator's style.",
    "Find potential collaboration partners.",
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & BULLETS
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              01 · DISCOVER
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Find the Right Creator for Your Brand.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6 max-w-md">
              Explore creator profiles, discover their content style and understand their niche. Brands can find creators who align with their campaign goals. Creators can showcase their skills, interests and previous work.
            </p>

            <ul className="space-y-2.5 mb-8 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {supportingPoints.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="bg-white/95 dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-xs text-left max-w-md">
              <h4 className="font-sans text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground mb-1">
                Discover Creators
              </h4>
              <p className="font-sans text-xs text-slate-500 dark:text-text-muted">
                Explore profiles and find creative talent that matches your brand&apos;s vision.
              </p>
            </div>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: 3 EDITORIAL CREATOR CARDS
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className={`bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm hover:-translate-y-[6px] hover:scale-[1.02] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-pointer group text-left ${creator.staggerClass}`}
                >
                  <div className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={creator.image}
                      alt={creator.name}
                      fill
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className="backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold font-sans tracking-wider shadow-2xs bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-foreground border border-slate-200/80 dark:border-white/10 inline-block">
                        {creator.tag}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 pb-1">
                    <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-foreground mb-0.5 leading-snug">
                      {creator.name}
                    </h4>
                    <span className="font-sans text-xs text-slate-500 dark:text-text-muted block font-medium">
                      {creator.niche}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
