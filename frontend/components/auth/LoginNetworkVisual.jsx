"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// =========================================================
// NETWORK PROFILE NODES DATA
// =========================================================
const NETWORK_NODES = [
  {
    id: "elena",
    name: "Elena Vance",
    badge: "Milan",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    initials: "EV",
    position: "top-[12%] left-[18%]",
    floatDelay: "0s",
  },
  {
    id: "aura",
    name: "Aura Luxury",
    badge: "Paris",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    initials: "AL",
    position: "top-[18%] right-[14%]",
    floatDelay: "1s",
  },
  {
    id: "felix",
    name: "Félix S.",
    badge: "640K",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    initials: "FS",
    position: "top-[42%] left-[8%]",
    floatDelay: "2s",
  },
  {
    id: "byredo",
    name: "Byredo House",
    badge: "Stockholm",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    initials: "BH",
    position: "top-[48%] right-[10%]",
    floatDelay: "1.5s",
  },
  {
    id: "lucian",
    name: "Lucian Atelier",
    badge: "New York",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
    initials: "LA",
    position: "bottom-[24%] left-[22%]",
    floatDelay: "0.5s",
  },
  {
    id: "balmain",
    name: "Balmain Haute",
    badge: "Paris",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    initials: "BM",
    position: "bottom-[28%] right-[20%]",
    floatDelay: "2.5s",
  },
];

// =========================================================
// MAIN VISUAL COMPONENT
// =========================================================
export default function LoginNetworkVisual() {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-screen bg-background text-foreground flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border-r border-border-theme">
      {/* Background Soft Pink Glow in Center */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.07] dark:bg-secondary/[0.04] blur-[140px]" />

      {/* =========================================================
          TOP BRANDING LOGO (DESKTOP / TABLET)
      ========================================================= */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-serif text-xl sm:text-2xl font-medium tracking-wide text-foreground hover:opacity-90 transition-opacity"
        >
          <span>CREATORLINK</span>
          <span className="text-secondary text-2xl leading-none">•</span>
        </Link>
      </div>

      {/* =========================================================
          CENTRAL ABSTRACT NETWORK CANVAS
      ========================================================= */}
      <div className="relative z-10 my-auto w-full max-w-[540px] mx-auto h-[380px] sm:h-[420px]">
        {/* SVG CONNECTING PATHS WITH ANIMATED PULSE */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 540 420"
          fill="none"
        >
          <defs>
            <linearGradient id="networkLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-secondary)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="var(--theme-secondary)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--theme-tertiary)" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Curved connection lines from center (270, 210) to peripheral nodes */}
          <path
            d="M 270 210 Q 180 120 120 70"
            stroke="url(#networkLineGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          <path
            d="M 270 210 Q 360 130 440 90"
            stroke="url(#networkLineGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          <path
            d="M 270 210 Q 150 200 70 180"
            stroke="url(#networkLineGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          <path
            d="M 270 210 Q 390 220 460 210"
            stroke="url(#networkLineGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          <path
            d="M 270 210 Q 200 300 140 330"
            stroke="url(#networkLineGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          <path
            d="M 270 210 Q 350 310 420 320"
            stroke="url(#networkLineGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-60"
          />
        </svg>

        {/* CENTRAL MONOGRAM EMBLEM */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
          <div className="relative group">
            {/* Outer Pulsing Glow Ring */}
            <div className="absolute -inset-3 rounded-full bg-secondary/20 dark:bg-secondary/30 blur-md animate-pulse" />

            {/* Central Badge */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface border-2 border-secondary/60 shadow-lg flex items-center justify-center text-foreground font-serif font-bold text-xl sm:text-2xl tracking-tighter">
              <span>MS</span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mt-2.5 bg-background/80 px-2 py-0.5 rounded-full border border-secondary/20">
            SYNERGIE HUB
          </span>
        </div>

        {/* PERIPHERAL CREATOR & BRAND NODES */}
        {NETWORK_NODES.map((node) => (
          <div
            key={node.id}
            className={`absolute z-20 ${node.position} creator-float`}
            style={{ animationDelay: node.floatDelay }}
          >
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-surface/90 border border-border-theme shadow-sm hover:border-secondary/50 hover:shadow-md transition-all duration-300">
              {/* Profile Image with Initials Fallback */}
              <div className="w-8 h-8 rounded-full bg-secondary/10 overflow-hidden shrink-0 flex items-center justify-center border border-border-theme relative">
                <Image
                  src={node.image}
                  alt={node.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
                <span className="text-xs font-bold text-secondary">
                  {node.initials}
                </span>
              </div>

              {/* Name & Badge */}
              <div className="text-left">
                <p className="text-[11px] font-semibold text-foreground leading-none font-sans whitespace-nowrap">
                  {node.name}
                </p>
                <span className="text-[9px] font-medium text-text-secondary leading-none font-sans mt-0.5 block">
                  {node.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================
          BOTTOM EDITORIAL TEXT BLOCK & METRICS
      ========================================================= */}
      <div className="relative z-10 pt-6 border-t border-border-theme/60 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-secondary block mb-1.5">
            THE CREATIVE NETWORK
          </span>
          <h3 className="text-lg sm:text-xl font-serif font-medium text-foreground leading-snug max-w-xs">
            Where exceptional creators meet exceptional brands.
          </h3>
        </div>

        {/* Subtle Metric Block */}
        <div className="text-left sm:text-right shrink-0">
          <span className="text-2xl sm:text-3xl font-serif font-medium text-foreground block leading-none">
            10K+
          </span>
          <span className="text-[11px] text-text-secondary font-sans mt-1 block">
            Vetted creators & global brands
          </span>
        </div>
      </div>
    </div>
  );
}
