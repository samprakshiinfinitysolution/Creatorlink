"use client";

import React from "react";
import Image from "next/image";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const SPOTLIGHT_CASES = [
  {
    id: "seraphina-raw",
    creatorName: "Seraphina Raw",
    handle: "@seraphinaraw",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85",
    desktopImage:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
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
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85",
    desktopImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
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
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85",
    desktopImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85",
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
      <div className="hidden md:flex items-end justify-between mb-8 w-full">
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
      </div>

      {/* =========================================================
          MOBILE HEADER (< 768px) - UNCHANGED
      ========================================================= */}
      <div className="flex md:hidden flex-col mb-6">
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-secondary block mb-1">
          HIGH-IMPACT CONVERSIONS
        </span>
        <h2 className="text-2xl font-bold font-serif tracking-tight text-foreground">
          Creators Everyone Is Talking About
        </h2>
      </div>

      {/* =========================================================
          DESKTOP CARDS ROW (>= 768px) - LEFT ALIGNED COMPACT CARDS
      ========================================================= */}
      <div className="hidden md:flex justify-start items-stretch gap-6 w-full">
        {SPOTLIGHT_CASES.map((item) => (
          <div
            key={item.id}
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
        ))}
      </div>

      {/* =========================================================
          MOBILE CAROUSEL LIST (< 768px) - UNCHANGED
      ========================================================= */}
      <div className="flex md:hidden gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
        {SPOTLIGHT_CASES.map((item) => (
          <div
            key={item.id}
            className="w-[285px] shrink-0 snap-start rounded-2xl bg-surface border border-border-theme p-4 shadow-xs flex flex-col justify-between"
          >
            {/* Top Row: Thumbnail + Creator Info + ROI */}
            <div className="flex items-start gap-3">
              <Image src={item.image} alt={item.creatorName} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground tracking-tight truncate">
                  {item.creatorName}
                </h3>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {item.collabShort}
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-secondary mt-1">
                  <TrendUpIcon />
                  <span>{item.roi}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-border-theme my-3" />

            {/* Bottom Row: Impressions + CASE STUDY button */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                {item.impressions}
              </span>
              <span className="text-xs font-bold tracking-wider text-secondary uppercase">
                CASE STUDY
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
