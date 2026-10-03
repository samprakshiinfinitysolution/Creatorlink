"use client";

import React from "react";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================

// DESKTOP TESTIMONIALS (3 Cards shown in Desktop reference)
const DESKTOP_TESTIMONIALS = [
  {
    id: "nadine-rossi",
    quote:
      '"We replaced four fragmented agencies with Maison Synergie. Sourcing 25 high-end creators for our Milan showroom took under 48 hours. The content caliber is unmatched."',
    name: "Nadine Rossi",
    role: "Global VP Creative, Milan Luxury House",
    rating: 5,
  },
  {
    id: "felix-saint-laurent",
    quote:
      '"The escrow mechanism completely transformed my creative business. I no longer feel awkward discussing budgets or chasing Net-90 checks. It\'s pure focus on craft."',
    name: "Félix Saint-Laurent",
    role: "@felix.create • 640K Followers",
    rating: 5,
  },
  {
    id: "david-keller",
    quote:
      '"The Whitelisting automation alone saved our growth team weeks of back-and-forth permissions. Direct code sync directly with Meta Ads Manager is flawless."',
    name: "David H. Keller",
    role: "Head of Growth, Aura Parfums",
    rating: 5,
  },
];

// MOBILE TESTIMONIALS (Stacked 1-per-row matching Mobile reference)
const MOBILE_TESTIMONIALS = [
  {
    id: "claire-monet",
    quote:
      '"Maison Synergie transformed our fashion week campaign. What used to take 6 weeks of negotiations was live in 72 hours with 4.8x higher conversion."',
    name: "Claire Monet",
    role: "Global Brand Director, Aura Luxury",
    initials: "CM",
  },
  {
    id: "nadine-rossi-m",
    quote:
      '"We replaced four fragmented agencies with Maison Synergie. Sourcing 25 high-end creators for our Milan showroom took under 48 hours. The content caliber is unmatched."',
    name: "Nadine Rossi",
    role: "Global VP Creative, Milan Luxury House",
    initials: "NR",
  },
  {
    id: "felix-m",
    quote:
      '"The escrow mechanism completely transformed my creative business. I no longer feel awkward discussing budgets or chasing Net-90 checks. It\'s pure focus on craft."',
    name: "Félix Saint-Laurent",
    role: "@felix.create • 640K Followers",
    initials: "FS",
  },
];

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function SalonTestimonials() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-14 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      {/* Background Soft Pink Center Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[320px] w-[600px] rounded-full bg-secondary/[0.08] dark:bg-secondary/[0.04] blur-[120px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        {/* =========================================================
            HEADER: EYEBROW & HEADING
        ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-secondary block mb-3">
            SALON TESTIMONIALS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-serif font-medium tracking-tight text-foreground leading-[1.2]">
            What happens inside the Synergie ecosystem.
          </h2>
        </div>

        {/* =========================================================
            DESKTOP LAYOUT (3 EQUAL CARDS - VISIBLE ON MD+)
        ========================================================= */}
        <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {DESKTOP_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-surface text-foreground rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border-theme shadow-sm transition-all duration-350 ease-out flex flex-col justify-between lg:hover:-translate-y-1 lg:hover:scale-[1.01] lg:hover:border-secondary/40 lg:hover:shadow-[0_12px_30px_rgba(255,79,135,0.18)] dark:lg:hover:shadow-[0_12px_30px_rgba(255,107,157,0.22)]"
            >
              {/* Top Pink 5-Star Rating */}
              <div className="flex items-center gap-1 text-secondary text-xs sm:text-sm mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i} className="text-secondary select-none">
                    ★
                  </span>
                ))}
              </div>

              {/* Quote Text */}
              <p className="font-serif italic text-xs sm:text-sm lg:text-[14px] text-foreground/90 leading-relaxed mb-6 flex-1">
                {item.quote}
              </p>

              {/* Divider & Author Info */}
              <div className="border-t border-border-theme/60 pt-4 mt-auto">
                <h3 className="font-serif font-medium text-sm lg:text-base text-foreground">
                  {item.name}
                </h3>
                <p className="text-xs text-text-secondary font-sans mt-0.5">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================
            MOBILE LAYOUT (1 CARD PER ROW STACKED - VISIBLE ON MOBILE)
        ========================================================= */}
        <div className="block md:hidden space-y-5">
          {MOBILE_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-surface text-foreground rounded-[24px] p-6 relative border border-border-theme shadow-sm"
            >
              {/* Subtle Pale-Pink Quotation Mark Top-Right */}
              <span className="absolute top-5 right-6 text-4xl sm:text-5xl font-serif text-secondary/30 leading-none select-none pointer-events-none">
                “
              </span>

              {/* Quote Text */}
              <p className="font-serif italic text-[16px] sm:text-[18px] text-foreground leading-snug mb-6 pr-6">
                {item.quote}
              </p>

              {/* Author Row with Black Initials Badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs tracking-tight shrink-0">
                  {item.initials}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground font-sans">
                    {item.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-sans">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
