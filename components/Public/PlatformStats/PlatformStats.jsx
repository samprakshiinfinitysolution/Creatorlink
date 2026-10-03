"use client";

import React from "react";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const STATS_DATA = [
  {
    id: "creators",
    number: "10K+",
    label: "VETTED CREATORS",
  },
  {
    id: "campaigns",
    number: "1.5K+",
    label: "ACTIVE CAMPAIGNS",
  },
  {
    id: "collab-rate",
    number: "98%",
    label: "REPEAT COLLAB RATE",
  },
  {
    id: "paid",
    number: "$14M+",
    label: "PAID TO CREATORS",
  },
];

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function PlatformStats() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground pt-10 md:pt-16 pb-0 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      <div className="mx-auto max-w-[1440px]">
        {/* STATS ROW / GRID WITH BOTTOM DIVIDER */}
        <div className="pb-8 md:pb-10 border-b border-border-theme">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
            {STATS_DATA.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col items-center justify-center text-center group"
              >
                {/* Large Editorial Serif Number */}
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground mb-2 leading-none transition-transform duration-300 group-hover:scale-[1.03]">
                  {stat.number}
                </span>

                {/* Uppercase Label */}
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.16em] uppercase text-text-secondary leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
