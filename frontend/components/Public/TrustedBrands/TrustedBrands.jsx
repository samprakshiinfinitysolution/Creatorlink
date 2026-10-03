"use client";

import React from "react";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const DESKTOP_BRANDS = [
  "BALMAIN",
  "JACQUEMUS",
  "GLOSSIER",
  "KITH",
  "BYREDO",
  "RIMOWA",
];

const MOBILE_BRANDS = [
  "BALMAIN",
  "JACQUEMUS",
  "GLOSSIER",
  "KITH",
  "BYREDO",
];

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function TrustedBrands() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground border-b border-border-theme/60 pt-6 md:pt-8 pb-8 md:pb-12 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      {/* Background Soft Pink Center Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.03] blur-[120px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        {/* =========================================================
            DESKTOP LAYOUT (6 BRANDS - VISIBLE ON MD+)
        ========================================================= */}
        <div className="hidden md:block text-center">
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-text-secondary block mb-6 lg:mb-7">
            TRUSTED BY GLOBAL CREATIVE DIRECTORS
          </span>

          <div className="flex items-center justify-between lg:justify-center gap-8 lg:gap-14 xl:gap-20 max-w-[1240px] mx-auto">
            {DESKTOP_BRANDS.map((brand) => (
              <span
                key={brand}
                className="font-serif font-medium text-lg sm:text-xl lg:text-2xl tracking-widest text-text-secondary/70 hover:text-foreground transition-colors duration-300 select-none whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* =========================================================
            MOBILE LAYOUT (5 BRANDS - MATCHES MOBILE SCREENSHOT)
        ========================================================= */}
        <div className="block md:hidden text-center">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-text-secondary block mb-4">
            TRUSTED BY LUXURY INNOVATORS
          </span>

          <div className="flex items-center justify-between gap-1 sm:gap-3 px-1">
            {MOBILE_BRANDS.map((brand) => (
              <span
                key={brand}
                className="font-serif font-medium text-[11px] sm:text-xs tracking-wider text-text-secondary/75 select-none whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
