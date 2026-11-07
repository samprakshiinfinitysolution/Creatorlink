"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function PricingPerformance() {
  const valueCards = [
    {
      id: "discovery",
      label: "CREATOR DISCOVERY",
      value: "Discover",
      description: "Explore creator profiles and creative niches.",
    },
    {
      id: "planning",
      label: "CAMPAIGN PLANNING",
      value: "Organize",
      description: "Share campaign requirements and deliverables.",
    },
    {
      id: "collaboration",
      label: "COLLABORATION",
      value: "Connect",
      description: "Coordinate with creators throughout the campaign.",
    },
    {
      id: "management",
      label: "CAMPAIGN MANAGEMENT",
      value: "Manage",
      description: "Keep collaboration activities organized.",
    },
  ];

  const journeySteps = [
    {
      num: "01",
      title: "Discovery & Briefing",
      detail: "Identify talent & share requirements",
    },
    {
      num: "02",
      title: "Agreement & Timeline",
      detail: "Confirm deliverables & dates",
    },
    {
      num: "03",
      title: "Content Creation",
      detail: "Draft submission & review",
    },
    {
      num: "04",
      title: "Completion",
      detail: "Final assets delivered & settled",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#18181B] text-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 transition-colors duration-300">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-secondary/[0.04] blur-[200px]" />

      <div className="mx-auto max-w-[1240px] relative z-10 text-center">
        {/* =========================================================
            1. TOP INTRO CONTENT
        ========================================================= */}
        <ScrollReveal direction="up" delay={0}>
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 text-center">
            PLATFORM VALUE
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white leading-tight mb-4 text-center max-w-2xl mx-auto">
            More Clarity. Better Collaboration Decisions.
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed text-center max-w-xl mx-auto mb-12 sm:mb-16">
            CreatorLink brings important parts of the creator collaboration
            journey into one place, helping brands and creators stay aligned
            from discovery to completion.
          </p>
        </ScrollReveal>

        {/* =========================================================
            2. 4 MEANINGFUL PLATFORM VALUE CARDS
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-[1180px] mx-auto mb-12 text-left">
          {valueCards.map((card, idx) => (
            <ScrollReveal
              key={card.id}
              direction="up"
              delay={idx * 60}
              className="bg-white/[0.04] border border-white/10 hover:border-secondary/60 rounded-2xl sm:rounded-[22px] p-5 sm:p-6 shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.25)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-sans block mb-3">
                  {card.label}
                </span>

                <div className="mb-2">
                  <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    {card.value}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-sans mt-3 pt-3 border-t border-white/[0.08]">
                {card.description}
              </p>
            </ScrollReveal>
          ))}
        </div>

        {/* =========================================================
            3. ILLUSTRATIVE COLLABORATION JOURNEY
        ========================================================= */}
        <ScrollReveal direction="scale" delay={120}>
          <div className="bg-white/[0.03] border border-white/10 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 max-w-[1180px] mx-auto text-left shadow-2xl relative overflow-hidden">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1">
                ILLUSTRATIVE STAGES
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-white mb-1">
                The Collaboration Journey
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-sans">
                A simple overview of how brands and creators work together on
                CreatorLink.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {journeySteps.map((step) => (
                <div
                  key={step.num}
                  className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between"
                >
                  <span className="font-mono text-xs font-bold text-secondary mb-2">
                    {step.num}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1 font-sans">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
