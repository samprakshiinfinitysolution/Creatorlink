"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksCollaborate() {
  const supportingPoints = [
    "Start the agreed campaign.",
    "Follow the shared brief.",
    "Keep communication clear.",
    "Work towards the campaign goals.",
  ];

  const portalCards = [
    {
      id: 1,
      label: "CAMPAIGN FOCUS",
      value: "Storytelling & Brand Reach",
      valueColor: "text-white",
    },
    {
      id: 2,
      label: "CREATIVE ROLE",
      value: "Original Content Creation",
      valueColor: "text-white",
    },
    {
      id: 3,
      label: "DELIVERABLE FORMAT",
      value: "Agreed High-Quality Media",
      valueColor: "text-white",
    },
    {
      id: 4,
      label: "COLLABORATION STATUS",
      value: "Active & In Progress",
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
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & POINTS
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              05 · COLLABORATE
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-white leading-[1.15] mb-5">
              Bring Your Ideas to Life.
            </h2>

            <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed mb-6 max-w-md">
              With the campaign details agreed, creators can begin working on the project. Brands and creators work together while keeping the campaign goals and creative direction in mind.
            </p>

            <ul className="space-y-2.5 mb-8 font-sans text-xs sm:text-sm text-slate-300">
              {supportingPoints.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: COLLABORATION PORTAL CARD
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-7">
            <div className="bg-[#222226] border border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-2xl hover:-translate-y-[5px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-sans block mb-1">
                    COLLABORATION IN PROGRESS
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white leading-snug">
                    Let&apos;s Create Something Together.
                  </h3>
                </div>

                <div className="self-start sm:self-auto">
                  <span className="bg-[#FCE7F3] text-slate-950 font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
                    ACTIVE PROJECT
                  </span>
                </div>
              </div>

              <p className="font-sans text-xs sm:text-sm text-slate-400 mb-6">
                Turn your shared ideas into meaningful brand collaborations.
              </p>

              <div className="border-t border-white/10 mb-6" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {portalCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#2A2A30] border border-white/10 rounded-2xl p-4 sm:p-5 hover:-translate-y-[4px] hover:border-secondary/40 transition-all duration-300"
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

              <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-sans">
                <span className="font-medium text-slate-400">
                  Communication: <strong className="font-semibold text-slate-300">Open &amp; Direct</strong>
                </span>
                <span className="font-medium text-slate-300">
                  Status: <strong className="font-semibold text-emerald-400">On Schedule</strong>
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
