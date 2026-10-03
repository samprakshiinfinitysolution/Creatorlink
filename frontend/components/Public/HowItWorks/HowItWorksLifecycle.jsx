"use client";

import React from "react";

export default function HowItWorksLifecycle() {
  const stages = [
    {
      number: "01",
      title: "Discover",
      description: "Aesthetic talent matching",
      numberColor: "text-secondary",
      titleColor: "text-white group-hover:text-secondary",
    },
    {
      number: "02",
      title: "Create",
      description: "Structured visual briefs",
      numberColor: "text-secondary",
      titleColor: "text-white group-hover:text-secondary",
    },
    {
      number: "03",
      title: "Connect",
      description: "Proposal & moodboard chat",
      numberColor: "text-secondary",
      titleColor: "text-white group-hover:text-secondary",
    },
    {
      number: "04",
      title: "Collaborate",
      description: "Unified workspace locking",
      numberColor: "text-secondary",
      titleColor: "text-white group-hover:text-secondary",
    },
    {
      number: "05",
      title: "Content",
      description: "Authentic 9:16 production",
      numberColor: "text-secondary",
      titleColor: "text-white group-hover:text-secondary",
    },
    {
      number: "06",
      title: "Review",
      description: "Timestamped refinement",
      numberColor: "text-secondary",
      titleColor: "text-white group-hover:text-secondary",
    },
    {
      number: "07",
      title: "Approve",
      description: "Formal deliverable signoff",
      numberColor: "text-emerald-400",
      titleColor: "text-white group-hover:text-emerald-400",
    },
    {
      number: "08",
      title: "Pay",
      description: "Instant escrow release",
      numberColor: "text-emerald-400",
      titleColor: "text-white group-hover:text-emerald-400",
    },
    {
      number: "09",
      title: "Grow",
      description: "Guild & ambassador ties",
      numberColor: "text-secondary",
      titleColor: "text-white group-hover:text-secondary",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#18181B] text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-white/10 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.05] blur-[170px]" />

      <div className="mx-auto max-w-[1360px] relative z-10 text-center">
        
        {/* -------------------------------------------------------
            SECTION HEADER: EYEBROW, HEADING, DESCRIPTION
        ------------------------------------------------------- */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans text-center">
            END-TO-END ORCHESTRATION
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-white leading-[1.15] mb-5 text-center">
            The 9-Stage Collaboration <br className="hidden sm:inline" />
            Lifecycle
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed max-w-xl mx-auto text-center">
            A coherent continuum where every stage preserves artistic integrity and transactional safety.
          </p>
        </div>


        {/* -------------------------------------------------------
            9 STAGE CARDS GRID (1 ROW ON DESKTOP)
        ------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 sm:gap-3.5">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className="bg-[#222226] border border-white/10 rounded-2xl p-4 sm:p-4.5 text-left transition-all duration-300 ease-out cursor-pointer hover:-translate-y-[4px] hover:scale-[1.01] hover:border-secondary hover:shadow-[0_8px_24px_-4px_rgba(255,79,135,0.25)] flex flex-col justify-between min-h-[140px] sm:min-h-[155px] group"
            >
              {/* Stage Number */}
              <div>
                <span className={`text-xs sm:text-sm font-bold font-sans block mb-2 ${stage.numberColor}`}>
                  {stage.number}
                </span>

                {/* Stage Title */}
                <h3 className={`font-sans font-bold text-sm sm:text-base block mb-1.5 leading-tight transition-colors duration-300 ${stage.titleColor}`}>
                  {stage.title}
                </h3>
              </div>

              {/* Stage Description */}
              <p className="font-sans text-[11px] sm:text-xs text-slate-400 leading-snug block font-medium">
                {stage.description}
              </p>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
