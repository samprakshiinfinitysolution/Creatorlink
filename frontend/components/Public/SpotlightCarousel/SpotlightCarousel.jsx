"use client";

import React from "react";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const SPOTLIGHT_CASES = [
  {
    id: "seraphina-raw",
    creatorName: "Seraphina Raw",
    handle: "@seraphinaraw",
    avatar:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp",
    image:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054721/creatorlink/public/creators/lyhqi3si95n8so90e1gl.webp",
    desktopImage:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054721/creatorlink/public/creators/lyhqi3si95n8so90e1gl.webp",
    collaboratedWith: "Collaborated with Jacquemus",
    collabShort: "Collab with Jacquemus",
    title: "Summer Solstice Campaign",
    description:
      "High-fashion editorial film & exclusive capsule preview generating record conversion across Europe.",
    impressions: "3.2M Impressions",
    roi: "4.8x Campaign ROI",
  },
  {
    id: "julian-sound",
    creatorName: "Julian Sound",
    handle: "@juliansound",
    avatar:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054706/creatorlink/public/avatars/qvmu4uqdqpexdchfnvys.webp",
    image:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792056046/creatorlink/public/campaigns/iebvsjfwmravzz4u6jjc.webp",
    desktopImage:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792056046/creatorlink/public/campaigns/iebvsjfwmravzz4u6jjc.webp",
    collaboratedWith: "Collaborated with B&O Audio",
    collabShort: "Collab with B&O Audio",
    title: "Acoustic Minimalist Series",
    description:
      "Immersive sound architecture series leading to 180% surge in flagship pre-orders.",
    impressions: "1.8M Impressions",
    roi: "3.6x Campaign ROI",
  },
  {
    id: "mara-hideaways",
    creatorName: "Mara Hideaways",
    handle: "@marahideaways",
    avatar:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054701/creatorlink/public/avatars/qooau1mzc4okikpsrqri.webp",
    image:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054758/creatorlink/public/editorial/avjxgors8karuxcb8p43.webp",
    desktopImage:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054758/creatorlink/public/editorial/avjxgors8karuxcb8p43.webp",
    collaboratedWith: "Collaborated with Aman Resorts",
    collabShort: "Collab with Aman Resorts",
    title: "Sanctuary Visual Essay",
    description:
      "Exclusive luxury travel storytelling driving peak high-season villa bookings.",
    impressions: "4.5M Impressions",
    roi: "5.2x Campaign ROI",
  },
];

// =========================================================
// SVG ICONS
// =========================================================
function TrendUpIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function SpotlightCarousel() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground transition-colors duration-300 py-10 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 border-t border-border-theme">
      {/* =========================================================
          DESKTOP HEADER (>= 768px) - LEFT ALIGNED
      ========================================================= */}
      <ScrollReveal direction="up" className="hidden md:flex items-end justify-between mb-8 w-full">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-2">
            SPOTLIGHT CAROUSEL
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
            Creators everyone is talking about
          </h2>
        </div>

        {/* Horizontal Outlined Pill CTA Button at Top Right */}
        <button
          type="button"
          className="group inline-flex items-center justify-between gap-4 w-[260px] sm:w-[290px] lg:w-[320px] h-[52px] px-6 rounded-full border border-secondary/40 dark:border-secondary/50 bg-surface text-foreground shadow-[0_0_20px_rgba(255,79,135,0.15)] dark:shadow-[0_0_20px_rgba(255,79,135,0.22)] hover:border-secondary dark:hover:border-secondary hover:shadow-[0_0_28px_rgba(255,79,135,0.3)] dark:hover:shadow-[0_0_28px_rgba(255,79,135,0.3)] transition-all duration-300 transform hover:scale-[1.015] cursor-pointer shrink-0"
        >
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">View All Case Studies</span>
          <ArrowRightIcon className="text-secondary group-hover:translate-x-1.5 transition-transform duration-300 shrink-0 w-4 h-4" />
        </button>
      </ScrollReveal>

      {/* =========================================================
          MOBILE HEADER (< 768px)
      ========================================================= */}
      <ScrollReveal direction="up" className="flex md:hidden flex-col min-[560px]:flex-row min-[560px]:items-end min-[560px]:justify-between gap-3.5 min-[400px]:gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-1.5">
            SPOTLIGHT CAROUSEL
          </span>
          <h2 className="text-[22px] min-[360px]:text-[25px] min-[420px]:text-[28px] font-serif font-medium tracking-tight text-foreground leading-[1.18]">
            Creators everyone is talking about
          </h2>
        </div>

        <button
          type="button"
          className="group inline-flex items-center justify-between gap-3 h-[42px] min-[380px]:h-[46px] px-4.5 min-[380px]:px-5 rounded-full border border-secondary/40 dark:border-secondary/50 bg-surface text-foreground shadow-[0_0_16px_rgba(255,79,135,0.12)] dark:shadow-[0_0_16px_rgba(255,79,135,0.18)] hover:border-secondary dark:hover:border-secondary transition-all duration-300 cursor-pointer self-start min-[560px]:self-auto shrink-0"
        >
          <span className="text-xs font-semibold whitespace-nowrap">View All Case Studies</span>
          <ArrowRightIcon className="text-secondary group-hover:translate-x-1 transition-transform duration-300 shrink-0 w-3.5 h-3.5" />
        </button>
      </ScrollReveal>

      {/* =========================================================
          DESKTOP CARDS ROW (>= 768px) - LEFT ALIGNED COMPACT CARDS
      ========================================================= */}
      <div className="hidden md:flex justify-start items-stretch gap-6 w-full">
        {SPOTLIGHT_CASES.map((item, index) => (
          <ScrollReveal
            key={item.id}
            direction="up"
            delay={index * 100}
            className="h-full shrink-0"
          >
            <div
              className="group relative flex flex-col h-full w-[310px] lg:w-[330px] xl:w-[340px] shrink-0 overflow-hidden rounded-2xl border border-border-theme bg-surface shadow-xs hover:scale-[1.015] hover:border-secondary/50 hover:shadow-[0_12px_35px_rgba(255,79,135,0.18)] dark:hover:shadow-[0_12px_35px_rgba(255,79,135,0.22)] transition-all duration-300"
            >
              {/* IMAGE + COLLAB BADGE (ASPECT 1.5/1 SHORTER & WIDER) */}
              <div className="relative w-full aspect-[1.5/1] shrink-0 overflow-hidden bg-black/5 dark:bg-white/5">
                <Image src={item.desktopImage || item.image} alt={item.creatorName} fill className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" sizes="300px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-75" />

                {/* Collab Badge */}
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-black/70 backdrop-blur-md border border-white/20 shadow-xs">
                  {item.collaboratedWith}
                </span>
              </div>

              {/* CARD WHITE BODY */}
              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-surface">
                <div>
                  <h3 className="text-base font-bold font-serif text-foreground group-hover:text-secondary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="w-full h-[1px] bg-border-theme my-1" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">
                    {item.handle}
                  </span>
                  <span className="text-xs font-bold text-secondary flex items-center gap-1">
                    <TrendUpIcon />
                    {item.roi}
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* =========================================================
          MOBILE CAROUSEL LIST (< 768px)
      ========================================================= */}
      <div className="flex md:hidden gap-3.5 min-[380px]:gap-4 overflow-x-auto pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-4 px-4 scroll-smooth touch-pan-x">
        {SPOTLIGHT_CASES.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col h-full w-[275px] min-[360px]:w-[290px] min-[400px]:w-[310px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border-theme bg-surface shadow-xs transition-all duration-300"
          >
            {/* IMAGE + COLLAB BADGE (ASPECT 1.5/1) */}
            <div className="relative w-full aspect-[1.5/1] shrink-0 overflow-hidden bg-black/5 dark:bg-white/5">
              <Image
                src={item.desktopImage || item.image}
                alt={item.creatorName}
                fill
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 310px, 340px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-75" />

              {/* Collab Badge */}
              <span className="absolute bottom-2.5 left-2.5 min-[380px]:bottom-3 min-[380px]:left-3 max-w-[calc(100%-20px)] truncate px-2.5 py-1 rounded-full text-[10.5px] min-[380px]:text-[11px] font-semibold text-white bg-black/70 backdrop-blur-md border border-white/20 shadow-xs">
                {item.collaboratedWith}
              </span>
            </div>

            {/* CARD WHITE BODY */}
            <div className="p-4 min-[380px]:p-4.5 flex flex-col flex-1 justify-between gap-2.5 min-[380px]:gap-3 bg-surface">
              <div>
                <h3 className="text-[15px] min-[380px]:text-base font-bold font-serif text-foreground group-hover:text-secondary transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11.5px] min-[380px]:text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="w-full h-[1px] bg-border-theme my-0.5 min-[380px]:my-1" />

              <div className="flex items-center justify-between">
                <span className="text-[11.5px] min-[380px]:text-xs font-medium text-text-secondary">
                  {item.handle}
                </span>
                <span className="text-[11.5px] min-[380px]:text-xs font-bold text-secondary flex items-center gap-1 shrink-0">
                  <TrendUpIcon />
                  {item.roi}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
