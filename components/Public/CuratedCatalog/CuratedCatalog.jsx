"use client";

import React, { useState } from "react";
import Image from "next/image";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const CREATORS = [
  {
    id: "elena-vance",
    name: "Elena Vance",
    handle: "@elenavance",
    category: "Haute Fashion",
    location: "Paris, FR",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85",
    badge: "TRENDING #1",
    badgeColor: "bg-secondary text-white",
    fit: "98% Fit",
    baseRate: "From $650",
    audience: "485K",
    engagement: "5.8%",
    avgDeliverable: "48h turnaround",
  },
  {
    id: "camille-blanc",
    name: "Camille Blanc",
    handle: "@camille.blanc",
    category: "Beauty & Editorial",
    location: "Milan, IT",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85",
    badge: "LIVE COLLAB",
    badgeColor: "bg-emerald-500 text-white dark:bg-emerald-600",
    fit: "96% Fit",
    baseRate: "From $1,200",
    audience: "920K",
    engagement: "7.2%",
    avgDeliverable: "24h express",
  },
  {
    id: "kenji-sato",
    name: "Kenji Sato",
    handle: "@kenjisato",
    category: "Minimal Tech",
    location: "Tokyo, JP",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85",
    badge: "VERIFIED PRO",
    badgeColor: "bg-tertiary text-white dark:bg-purple-600",
    fit: "99% Fit",
    baseRate: "From $980",
    audience: "310K",
    engagement: "6.4%",
    avgDeliverable: "3-day delivery",
  },
  {
    id: "astrid-lind",
    name: "Astrid Lind",
    handle: "@astrid.lind",
    category: "Fine Art & Travel",
    location: "Stockholm, SE",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=85",
    badge: "FAST RESPONSE",
    badgeColor: "bg-amber-500 text-white dark:bg-amber-600",
    fit: "94% Fit",
    baseRate: "From $550",
    audience: "215K",
    engagement: "8.9%",
    avgDeliverable: "24h response",
  },
];

// =========================================================
// SVG ICONS
// =========================================================
function VerifiedCheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-secondary shrink-0 inline-block"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BookmarkIcon({ isSaved, className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={isSaved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

// =========================================================
// REUSABLE CREATOR CARD COMPONENT
// =========================================================
function CreatorCard({ creator }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border-theme bg-surface shadow-xs hover:border-secondary/60 dark:hover:border-secondary/60 hover:shadow-[0_12px_35px_rgba(255,79,135,0.18)] dark:hover:shadow-[0_12px_35px_rgba(255,79,135,0.22)] hover:-translate-y-1 transition-all duration-300">
      {/* CREATOR IMAGE + TOP BADGES + DESKTOP HOVER OVERLAY */}
      <div className="relative w-full aspect-[4/4.8] shrink-0 overflow-hidden bg-black/5 dark:bg-white/5">
        <Image src={creator.image} alt={creator.name} fill className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-[2px] group-hover:brightness-[0.75]" sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-75 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Top-Left Status Badge */}
        <span
          className={`absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md z-10 ${creator.badgeColor}`}
        >
          {creator.badge}
        </span>

        {/* Top-Right Fit Badge */}
        <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-black/65 dark:bg-black/80 backdrop-blur-md border border-white/20 z-10">
          {creator.fit}
        </span>

        {/* DESKTOP HOVER OVERLAY BUTTONS (Media Kit & Book Now) */}
        <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center gap-2.5 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] bg-black/30">
          <button
            type="button"
            className="inline-flex items-center justify-center bg-white text-black font-semibold text-xs py-2.5 px-4 rounded-full shadow-md hover:bg-gray-100 hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            Media Kit
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center bg-secondary text-white font-semibold text-xs py-2.5 px-4 rounded-full shadow-md hover:bg-secondary-dark hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* CARD BODY DETAILS */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        {/* Creator Name, Handle & Base Rate Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight group-hover:text-secondary transition-colors">
                {creator.name}
              </h3>
              <VerifiedCheckIcon />
            </div>
            <p className="text-xs text-text-secondary line-clamp-1">
              {creator.handle} • {creator.category}, {creator.location}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium">
              BASE RATE
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {creator.baseRate}
            </span>
          </div>
        </div>

        {/* Metrics Row (Audience, Engagement, Avg Deliverable) */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-muted border border-border-theme text-left">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium">
              Audience
            </span>
            <span className="text-xs font-bold text-foreground">
              {creator.audience}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium">
              Engagement
            </span>
            <span className="text-xs font-bold text-foreground">
              {creator.engagement}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-medium">
              Deliverable
            </span>
            <span className="text-xs font-bold text-foreground line-clamp-1">
              {creator.avgDeliverable}
            </span>
          </div>
        </div>

        {/* MOBILE ONLY BOTTOM ACTIONS (Send Campaign Brief + Bookmark Button) */}
        <div className="flex md:hidden items-center gap-2 pt-1">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white dark:bg-white dark:text-black hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Send Campaign Brief</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`inline-flex items-center justify-center w-9.5 h-9.5 rounded-xl border border-border-theme transition-all cursor-pointer ${
              isSaved
                ? "bg-secondary/10 border-secondary text-secondary"
                : "bg-surface-muted text-text-secondary hover:text-foreground hover:border-border-theme"
            }`}
            aria-label="Bookmark creator"
          >
            <BookmarkIcon isSaved={isSaved} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN SECTION COMPONENT
// =========================================================
export default function CuratedCatalog() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground transition-colors duration-300 py-10 md:py-20 px-4 sm:px-6 lg:px-12 border-t border-border-theme">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[350px] w-[350px] rounded-full bg-secondary/[0.05] dark:bg-secondary/[0.03] blur-[120px]" />

      <div className="mx-auto max-w-[1440px]">
        {/* =========================================================
            MOBILE HEADER (< 768px)
        ========================================================= */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-serif tracking-tight text-foreground">
              Curated Tastemakers
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Top-tier engagement & verified authenticity
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-bold tracking-wider text-secondary uppercase hover:underline cursor-pointer shrink-0 ml-2"
          >
            VIEW ALL (184)
          </button>
        </div>

        {/* =========================================================
            DESKTOP HEADER (>= 768px)
        ========================================================= */}
        <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-2">
              CURATED CATALOG
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
              Your next collaboration is here.
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm lg:text-base text-text-secondary leading-relaxed">
              Hand-vetted tastemakers with algorithmic authenticity audits, verified audience
              metrics, and transparent deliverables.
            </p>
          </div>
        </div>

        {/* =========================================================
            CREATORS GRID / LIST
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {CREATORS.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>

        {/* =========================================================
            CENTERED CTA BUTTON (DESKTOP ONLY)
        ========================================================= */}
        <div className="hidden md:flex mt-12 md:mt-14 justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border-theme bg-surface text-foreground text-xs md:text-sm font-semibold px-7 py-3.5 shadow-sm hover:border-secondary dark:hover:border-secondary hover:shadow-[0_0_25px_rgba(255,79,135,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,79,135,0.25)] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <span>View All 1,480 Curated Creators</span>
            <ArrowRightIcon className="w-4 h-4 ml-0.5 text-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
}
