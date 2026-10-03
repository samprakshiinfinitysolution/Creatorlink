"use client";

import React from "react";

export default function HowItWorksCollaborate() {
  const portalCards = [
    {
      id: 1,
      label: "BRAND CLIENT",
      value: "Glow Botanical Labs",
      valueColor: "text-white",
    },
    {
      id: 2,
      label: "LEAD CREATOR",
      value: "Aarohi Mehta",
      valueColor: "text-white",
    },
    {
      id: 3,
      label: "DELIVERABLES IN ESCROW",
      value: "2 Reels · 3 Stories",
      valueColor: "text-white",
    },
    {
      id: 4,
      label: "LOCKED BUDGET",
      value: "₹30,000 in Escrow",
      valueColor: "text-secondary",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#18181B] text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-white/10 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.05] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & STATUS ROW
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              04 · COLLABORATE
            </span>

            {/* Editorial Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-white leading-[1.15] mb-5">
              Great collaborations <br className="hidden sm:inline" />
              feel effortless.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed mb-8 max-w-md">
              A single, pristine executive workspace keeps everyone synchronized. Deadlines, assets, revision rounds, and funds live together in complete transparency.
            </p>

            {/* Autonomous Milestone Status Row */}
            <div className="inline-flex items-center gap-2.5 font-sans text-xs sm:text-sm font-medium text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span>Autonomous milestone synchronization active</span>
            </div>

          </div>


          {/* -------------------------------------------------------
              RIGHT COLUMN: COLLABORATION PORTAL CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-7">
            
            {/* Main Dark Collaboration Portal Card */}
            <div className="bg-[#222226] border border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-2xl hover:-translate-y-[5px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-default text-left">
              
              {/* Header: Label, Title & Collaboration Active Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-sans block mb-1.5">
                    COLLABORATION PORTAL
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white leading-snug">
                    Serum Reveal &amp; Morning Ritual
                  </h3>
                </div>

                {/* Status Pill Top-Right */}
                <div className="self-start sm:self-auto">
                  <span className="bg-[#FCE7F3] text-slate-950 font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
                    COLLABORATION ACTIVE
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 mb-6" />

              {/* 4 Information Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {portalCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#2A2A30] border border-white/10 rounded-2xl p-4 sm:p-5 hover:-translate-y-[4px] hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_8px_20px_-4px_rgba(255,79,135,0.2)] transition-all duration-300 ease-out cursor-pointer"
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-sans block mb-1.5">
                      {card.label}
                    </span>
                    <span className={`font-sans font-bold text-sm sm:text-base block leading-snug ${card.valueColor}`}>
                      {card.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Timeline & Status Row */}
              <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-sans">
                <span className="font-medium text-slate-400">
                  Timeline: <strong className="font-semibold text-slate-300">June 15 – June 30</strong>
                </span>

                <span className="font-medium text-slate-300">
                  Deliverable Phase 1: <strong className="font-semibold text-emerald-400">On Track</strong>
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
