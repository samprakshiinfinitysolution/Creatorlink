"use client";

import React from "react";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================

// DESKTOP DATA (4 Horizontal Cards for Desktop & Tablet)
const DESKTOP_CARDS = [
  {
    id: "01",
    number: "01",
    title: "Discover",
    description:
      "Find our exclusive roster by verified engagement, sentiment, and audience demographics.",
    tag: "Audited Demographics",
  },
  {
    id: "02",
    number: "02",
    title: "Connect & Escrow",
    description:
      "Issue standardized offers. Funds lock safely in escrow upon creative deal acceptance.",
    tag: "Smart Vault Custody",
  },
  {
    id: "03",
    number: "03",
    title: "Review & Refine",
    description:
      "High-definition video drafts in private viewer with timestamp feedback and click approval.",
    tag: "Timestamp Inspector",
  },
  {
    id: "04",
    number: "04",
    title: "Scale & Whitelist",
    description:
      "Release payment instantly. Sync high-res ad authorization directly to TikTok Ads and Meta Business Manager in real time.",
    tag: "Instant Global Boost",
  },
];

// MOBILE DATA (2x2 Grid Compact Cards matching Mobile Screenshot)
const MOBILE_CARDS = [
  {
    id: "m-01",
    numberHeader: "01 DISCOVER",
    title: "Vetted Salon",
    description: "Pre-screened metrics & aesthetic fit.",
  },
  {
    id: "m-02",
    numberHeader: "02 CONNECT",
    title: "Smart Escrow",
    description: "Locked funds until both sides approve.",
  },
  {
    id: "m-03",
    numberHeader: "03 REFINE",
    title: "Frame Review",
    description: "Interactive 4K deliverable markup.",
  },
  {
    id: "m-04",
    numberHeader: "04 SCALE",
    title: "Ad Whitelisting",
    description: "Push high-performing reels to ads.",
  },
];

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function ProtocolArchitecture() {
  return (
    <section className="relative overflow-hidden bg-background text-foreground py-14 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300">
      {/* Background Soft Pink Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[700px] rounded-full bg-secondary/[0.06] dark:bg-secondary/[0.03] blur-[130px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        {/* =========================================================
            DESKTOP HEADER (VISIBLE ON MD+)
        ========================================================= */}
        <div className="hidden md:block text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-secondary block mb-3">
            PROTOCOL ARCHITECTURE
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-serif font-medium tracking-tight text-foreground leading-[1.2]">
            Collaboration distilled down to four refined movements.
          </h2>
        </div>

        {/* =========================================================
            DESKTOP LAYOUT (4 EQUAL CARDS IN ONE ROW - VISIBLE ON MD+)
        ========================================================= */}
        <div className="hidden md:grid grid-cols-4 gap-4 lg:gap-6 items-stretch">
          {DESKTOP_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-surface text-foreground rounded-[28px] p-6 lg:p-7 border border-border-theme shadow-sm transition-all duration-350 ease-out flex flex-col justify-between lg:hover:-translate-y-1 lg:hover:scale-[1.01] lg:hover:border-secondary/50 lg:hover:shadow-[0_12px_30px_rgba(255,79,135,0.18)] dark:lg:hover:shadow-[0_12px_30px_rgba(255,107,157,0.22)]"
            >
              <div>
                {/* Large Pink Number */}
                <span className="text-3xl lg:text-4xl font-serif font-medium text-secondary/80 block mb-3 leading-none">
                  {card.number}
                </span>

                {/* Card Title */}
                <h3 className="font-serif font-medium text-lg lg:text-xl text-foreground mb-3 leading-snug">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="text-xs lg:text-[13px] text-text-secondary font-sans leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              {/* Bottom Tag */}
              <div className="mt-auto">
                <span className="inline-block px-3 py-1 text-[10px] lg:text-[11px] font-semibold text-secondary bg-secondary/10 dark:bg-secondary/20 rounded-full">
                  {card.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================
            MOBILE HEADER & 2-COLUMN GRID (VISIBLE ON MOBILE)
        ========================================================= */}
        <div className="block md:hidden">
          <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground mb-6">
            How Maison Operates
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {MOBILE_CARDS.map((card) => (
              <div
                key={card.id}
                className="bg-surface text-foreground rounded-2xl p-4 sm:p-5 border border-border-theme shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-secondary block mb-2 leading-none">
                    {card.numberHeader}
                  </span>
                  <h3 className="font-sans font-bold text-sm sm:text-base text-foreground mb-1.5 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-text-secondary font-sans leading-snug">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
