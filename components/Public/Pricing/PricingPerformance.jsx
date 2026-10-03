"use client";

import React from "react";

export default function PricingPerformance() {
  const perfCards = [
    {
      id: "reach",
      label: "CAMPAIGN REACH",
      value: "124K",
      valueClass: "text-white",
      growth: "↗ +18.4%",
      description: "vs. previous period",
    },
    {
      id: "engagement",
      label: "AVG ENGAGEMENT",
      value: "8.4%",
      valueClass: "text-white",
      growth: "↗ +2.1%",
      description: "Industry benchmark: 2.8%",
    },
    {
      id: "content",
      label: "CONTENT PUBLISHED",
      value: "32",
      smallText: "Assets",
      valueClass: "text-white",
      growth: null,
      description: "Reels, Carousels & Stories",
    },
    {
      id: "roi",
      label: "CAMPAIGN ROI",
      value: "3.8x",
      valueClass: "text-secondary",
      growth: "↗ +0.6x",
      description: "Direct attribution revenue",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#18181B] text-white py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 transition-colors duration-300">
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-secondary/[0.04] blur-[200px]" />

      <div className="mx-auto max-w-[1240px] relative z-10 text-center">
        
        {/* =========================================================
            1. TOP INTRO CONTENT
        ========================================================= */}
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 text-center">
          MEASURED PERFORMANCE
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white leading-tight mb-4 text-center max-w-2xl mx-auto">
          See what your campaigns are <span className="text-secondary font-serif">actually</span> doing.
        </h2>

        <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed text-center max-w-xl mx-auto mb-12 sm:mb-16">
          Full attribution modeling, creator conversion tracking, and real-time revenue returns directly linked to creative assets.
        </p>

        {/* =========================================================
            2. 4 PERFORMANCE CARDS (HORIZONTAL ROW ON DESKTOP)
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-[1180px] mx-auto mb-12 text-left">
          {perfCards.map((card) => (
            <div
              key={card.id}
              className="group bg-white/[0.04] border border-white/10 hover:border-secondary/60 rounded-2xl sm:rounded-[22px] p-5 sm:p-6 shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.25)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out flex flex-col justify-between h-full"
            >
              <div>
                {/* Label */}
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-sans block mb-3">
                  {card.label}
                </span>

                {/* Main Metric Value & Growth */}
                <div className="flex items-baseline gap-2.5 mb-2">
                  <span className={`font-serif text-3xl sm:text-4xl font-semibold tracking-tight ${card.valueClass}`}>
                    {card.value}
                  </span>
                  {card.smallText && (
                    <span className="text-xs text-slate-400 font-sans font-medium">
                      {card.smallText}
                    </span>
                  )}
                  {card.growth && (
                    <span className="text-xs font-semibold text-emerald-400 font-sans">
                      {card.growth}
                    </span>
                  )}
                </div>
              </div>

              {/* Subtext Description */}
              <p className="text-xs text-slate-400 font-sans mt-3 pt-3 border-t border-white/[0.08]">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* =========================================================
            3. LARGE CHART PANEL
        ========================================================= */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 max-w-[1180px] mx-auto text-left shadow-2xl relative overflow-hidden">
          
          {/* Header & Legend Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-white mb-1">
                Audience Growth & Engagement Curve
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-sans">
                Aggregate performance over 90-day creator activation
              </p>
            </div>

            {/* Top-Right Legend */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full bg-secondary inline-block" />
                <span className="text-xs font-sans text-slate-300">Impressions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-[2px] border-b border-dashed border-emerald-400 inline-block" />
                <span className="text-xs font-sans text-slate-300">Conversions</span>
              </div>
            </div>
          </div>

          {/* SVG Chart Surface */}
          <div className="relative w-full overflow-hidden pt-4 pb-2">
            <svg
              viewBox="0 0 800 240"
              className="w-full h-auto overflow-visible"
              fill="none"
            >
              <defs>
                {/* Gradient Fill under Pink Impressions Curve */}
                <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4F87" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF4F87" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="20" y1="40" x2="780" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="20" y1="100" x2="780" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="20" y1="160" x2="780" y2="160" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="20" y1="220" x2="780" y2="220" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Area Gradient Fill Under Impressions Curve */}
              <path
                d="M 30 190 C 130 180, 200 145, 270 140 C 350 135, 420 155, 500 120 C 580 85, 650 45, 750 60 L 750 220 L 30 220 Z"
                fill="url(#pinkGradient)"
              />

              {/* Conversions Dashed Green Line */}
              <path
                d="M 30 200 C 200 190, 420 165, 750 140"
                stroke="#4ADE80"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />

              {/* Impressions Solid Smooth Pink Line */}
              <path
                d="M 30 190 C 130 180, 200 145, 270 140 C 350 135, 420 155, 500 120 C 580 85, 650 45, 750 60"
                stroke="#FF4F87"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Key Point Circles on Impressions Curve */}
              <circle cx="270" cy="140" r="4.5" fill="#FF4F87" stroke="#ffffff" strokeWidth="2" />
              <circle cx="500" cy="120" r="4.5" fill="#FF4F87" stroke="#ffffff" strokeWidth="2" />
              
              {/* Highlighted Final Point */}
              <circle cx="750" cy="60" r="6" fill="#ffffff" stroke="#FF4F87" strokeWidth="3" />
              <circle cx="750" cy="60" r="10" fill="none" stroke="#FF4F87" strokeWidth="1" strokeOpacity="0.5" />
            </svg>
          </div>

        </div>

      </div>
    </section>
  );
}
