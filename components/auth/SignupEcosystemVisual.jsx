"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// =========================================================
// ECOSYSTEM NODES DATA (CREATORS & LUXURY HOUSES)
// =========================================================
const ECOSYSTEM_NODES = [
  {
    id: "jacquemus",
    name: "Jacquemus",
    type: "Luxury House",
    badge: "Paris",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    initials: "JQ",
    position: "top-[10%] left-[15%]",
    floatDelay: "0s",
  },
  {
    id: "sophia",
    name: "Sophia L.",
    type: "Couture Stylist",
    badge: "Milan • 480K",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    initials: "SL",
    position: "top-[16%] right-[12%]",
    floatDelay: "1.2s",
  },
  {
    id: "byredo",
    name: "Byredo House",
    type: "Fragrance House",
    badge: "Stockholm",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    initials: "BH",
    position: "top-[44%] left-[6%]",
    floatDelay: "2.1s",
  },
  {
    id: "glossier",
    name: "Glossier Atelier",
    type: "Beauty Brand",
    badge: "New York",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
    initials: "GA",
    position: "top-[48%] right-[8%]",
    floatDelay: "0.8s",
  },
  {
    id: "david",
    name: "David K.",
    type: "Growth Lead",
    badge: "Aura Parfums",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    initials: "DK",
    position: "bottom-[22%] left-[20%]",
    floatDelay: "1.7s",
  },
  {
    id: "balmain",
    name: "Balmain Haute",
    type: "Fashion House",
    badge: "Paris",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    initials: "BM",
    position: "bottom-[26%] right-[18%]",
    floatDelay: "2.8s",
  },
];

// =========================================================
// MAIN VISUAL COMPONENT
// =========================================================
export default function SignupEcosystemVisual() {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-screen bg-background text-foreground flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border-r border-border-theme">
      {/* Background Soft Purple/Pink Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-secondary/[0.08] dark:bg-secondary/[0.04] blur-[150px]" />

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
          CENTRAL ORBITAL ECOSYSTEM CANVAS
      ========================================================= */}
      <div className="relative z-10 my-auto w-full max-w-[540px] mx-auto h-[380px] sm:h-[420px]">
        {/* SVG ORBITAL PATHS & CONNECTION GRADIENTS */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 540 420"
          fill="none"
        >
          <defs>
            <linearGradient id="signupGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-secondary)" stopOpacity="0.5" />
              <stop offset="60%" stopColor="var(--theme-tertiary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--theme-secondary)" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="signupGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-tertiary)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--theme-secondary)" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Elliptical Orbital Rings */}
          <ellipse
            cx="270"
            cy="210"
            rx="210"
            ry="140"
            stroke="url(#signupGrad1)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            className="opacity-50"
          />
          <ellipse
            cx="270"
            cy="210"
            rx="130"
            ry="85"
            stroke="url(#signupGrad2)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-40"
          />

          {/* Connection Lines from Center to Peripheral Nodes */}
          <line
            x1="270"
            y1="210"
            x2="110"
            y2="60"
            stroke="url(#signupGrad1)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-50"
          />
          <line
            x1="270"
            y1="210"
            x2="450"
            y2="80"
            stroke="url(#signupGrad2)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-50"
          />
          <line
            x1="270"
            y1="210"
            x2="60"
            y2="190"
            stroke="url(#signupGrad1)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-50"
          />
          <line
            x1="270"
            y1="210"
            x2="470"
            y2="210"
            stroke="url(#signupGrad2)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-50"
          />
          <line
            x1="270"
            y1="210"
            x2="130"
            y2="330"
            stroke="url(#signupGrad1)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-50"
          />
          <line
            x1="270"
            y1="210"
            x2="430"
            y2="330"
            stroke="url(#signupGrad2)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-50"
          />
        </svg>

        {/* CENTRAL SYNERGIE PORTAL EMBLEM */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
          <div className="relative group">
            {/* Outer Soft Aura Ring */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-secondary/30 via-tertiary/20 to-secondary/30 blur-lg animate-pulse" />

            {/* Central Synergie Emblem */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface border-2 border-secondary/70 shadow-lg flex items-center justify-center text-foreground font-serif font-medium text-2xl tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary font-bold">
                ❖
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary mt-2.5 bg-background/90 px-2.5 py-0.5 rounded-full border border-secondary/20 shadow-xs">
            PORTAL ACCESS
          </span>
        </div>

        {/* PERIPHERAL FLOATING CARDS & NODES */}
        {ECOSYSTEM_NODES.map((node) => (
          <div
            key={node.id}
            className={`absolute z-20 ${node.position} creator-float`}
            style={{ animationDelay: node.floatDelay }}
          >
            <div className="flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-surface/95 border border-border-theme shadow-sm hover:border-secondary/60 hover:shadow-md transition-all duration-300">
              {/* Profile Image with Initials Fallback */}
              <div className="w-8 h-8 rounded-full bg-secondary/10 overflow-hidden shrink-0 flex items-center justify-center border border-border-theme relative">
                <Image
                  src={node.image}
                  alt={node.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-xs font-bold text-secondary">
                  {node.initials}
                </span>
              </div>

              {/* Name & Subtitle */}
              <div className="text-left">
                <p className="text-[11px] font-bold text-foreground leading-none font-sans whitespace-nowrap">
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
          BOTTOM EDITORIAL TEXT BLOCK & METRIC
      ========================================================= */}
      <div className="relative z-10 pt-6 border-t border-border-theme/60 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-secondary block mb-1.5">
            ENTER THE SYNERGIE
          </span>
          <h3 className="text-lg sm:text-xl font-serif font-medium text-foreground leading-snug max-w-xs">
            Build meaningful collaborations. Create work that moves culture.
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
