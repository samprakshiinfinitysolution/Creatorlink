"use client";

import React from "react";

// =========================================================
// CENTRALIZED MOCK DATA (UI ONLY - READY FOR API REPLACEMENT)
// =========================================================
const ENTERPRISE_DATA = {
  eyebrow: "ENTERPRISE & LUXURY",
  title: "Brands, meet your creative advantage.",
  description:
    "Eliminate weeks of messy agency email threads. Tap into vetted creators ready for rapid execution.",
  metrics: [
    {
      id: "roi",
      value: "+340%",
      label: "Avg Campaign ROI",
      indicator: "Performance",
      indicatorColor: "emerald",
    },
    {
      id: "reach",
      value: "18.2M",
      label: "Audited Reach",
      indicator: "Audited",
      indicatorColor: "zinc",
    },
    {
      id: "delivery",
      value: "99.4%",
      label: "On-Time Delivery",
      indicator: "SLA Guaranteed",
      indicatorColor: "zinc",
    },
    {
      id: "escrow",
      value: "$4.2M",
      label: "Escrow Protected",
      indicator: "Vault Secured",
      indicatorColor: "zinc",
    },
  ],
  cta: {
    heading: "Deploy an agency-tier campaign in 15 minutes.",
    subheading:
      "The complete workflow from vetted creator sourcing to approved execution.",
    desktopButtonText: "Launch Your Campaign",
    mobileButtonText: "DEPLOY CAMPAIGN IN 15M",
  },
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function EnterpriseLuxury() {
  const { eyebrow, title, description, metrics, cta } = ENTERPRISE_DATA;

  return (
    <section className="relative overflow-hidden bg-background md:bg-black text-foreground md:text-white py-6 md:py-24 px-0 md:px-6 lg:px-10 xl:px-12 border-t border-border-theme/40 md:border-zinc-800/80 transition-colors duration-300">
      {/* Background Subtle Pink Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.05] blur-[150px] hidden md:block" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        {/* =========================================================
            DESKTOP LAYOUT (VISIBLE ON MD+)
        ========================================================= */}
        <div className="hidden md:block">
          {/* HEADER AREA */}
          <div className="mb-10 max-w-3xl">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-secondary block mb-3">
              {eyebrow}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white mb-4">
              {title}
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          {/* 4 METRIC CARDS IN ONE HORIZONTAL ROW */}
          <div className="grid grid-cols-4 gap-5 lg:gap-6 mb-8">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="relative group overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-5 lg:p-6 transition-all duration-300 hover:border-secondary/60 hover:shadow-[0_0_25px_rgba(255,79,135,0.22)] hover:bg-zinc-900/80"
              >
                {/* Accent / Status Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border transition-colors ${
                      metric.indicatorColor === "emerald"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-zinc-800/60 text-zinc-400 border-zinc-700/50 group-hover:border-secondary/30 group-hover:text-secondary"
                    }`}
                  >
                    {metric.indicator}
                  </span>

                  {/* Subtle Glowing Accent Dot */}
                  <span className="h-2 w-2 rounded-full bg-zinc-700 group-hover:bg-secondary group-hover:shadow-[0_0_8px_#ff4f87] transition-all duration-300" />
                </div>

                {/* Large Metric Value */}
                <div className="text-3xl lg:text-4xl font-bold font-serif text-white tracking-tight mb-1">
                  {metric.value}
                </div>

                {/* Small Supporting Label */}
                <div className="text-xs lg:text-sm text-zinc-400 font-medium">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* WIDE DARK BOTTOM CTA PANEL */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:p-8 flex flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-xs">
            <div className="max-w-2xl">
              <h3 className="text-lg lg:text-xl font-serif font-medium text-white">
                {cta.heading}
              </h3>
              <p className="text-xs lg:text-sm text-zinc-400 mt-1">
                {cta.subheading}
              </p>
            </div>

            {/* Pink Button CTA */}
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-secondary text-white text-xs lg:text-sm font-semibold shadow-[0_0_20px_rgba(255,79,135,0.35)] hover:bg-secondary-dark hover:shadow-[0_0_30px_rgba(255,79,135,0.5)] transition-all duration-300 group cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{cta.desktopButtonText}</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300 text-sm">
                →
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================
            MOBILE LAYOUT (BLACK ROUNDED CONTAINER - VISIBLE ON MOBILE)
        ========================================================= */}
        <div className="block md:hidden mx-3.5 rounded-[32px] bg-black border border-zinc-800/90 p-6 shadow-2xl relative overflow-hidden text-white">
          {/* Subtle Mobile Glow */}
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-secondary/[0.06] blur-[70px]" />

          {/* HEADER */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-2">
            {eyebrow}
          </span>
          <h2 className="text-2xl font-serif font-medium tracking-tight text-white leading-snug mb-3">
            {title}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            {description}
          </p>

          {/* 2 x 2 METRIC GRID */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between min-h-[100px]"
              >
                {/* Metric Value */}
                <div className="text-2xl font-bold font-serif tracking-tight text-white">
                  {metric.value}
                </div>

                {/* Supporting Label Below */}
                <div className="text-[11px] text-zinc-400 font-medium leading-tight mt-2">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* FULL-WIDTH PINK MOBILE CTA */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-secondary text-white font-semibold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(255,79,135,0.4)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{cta.mobileButtonText}</span>
            <span className="text-sm">⚡</span>
          </button>
        </div>
      </div>
    </section>
  );
}
