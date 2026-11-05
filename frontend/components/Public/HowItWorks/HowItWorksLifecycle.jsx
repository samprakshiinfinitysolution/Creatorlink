"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksLifecycle() {
  const stages = [
    {
      number: "01",
      title: "Discover",
      description: "Find creator matches for your brand",
    },
    {
      number: "02",
      title: "Create a Campaign",
      description: "Define your creative brief and goals",
    },
    {
      number: "03",
      title: "Connect",
      description: "Start the conversation and discuss ideas",
    },
    {
      number: "04",
      title: "Plan Together",
      description: "Agree on deliverables and timelines",
    },
    {
      number: "05",
      title: "Collaborate",
      description: "Work together in a dedicated workspace",
    },
    {
      number: "06",
      title: "Create Content",
      description: "Produce engaging, original creator content",
    },
    {
      number: "07",
      title: "Review & Approve",
      description: "Share feedback and finalize deliverables",
    },
    {
      number: "08",
      title: "Complete & Grow",
      description: "Wrap up successfully and build partnerships",
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
        <ScrollReveal direction="up" delay={0} className="max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans text-center">
            THE CREATORLINK JOURNEY
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-white leading-[1.15] mb-5 text-center">
            Simple Steps. Meaningful Collaborations.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed max-w-xl mx-auto text-center">
            From discovering the right creator to completing a campaign, CreatorLink brings the collaboration journey together.
          </p>
        </ScrollReveal>


        {/* -------------------------------------------------------
            8 STAGE CARDS GRID
        ------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {stages.map((stage, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={(idx % 8) * 40}
              className="bg-[#222226] border border-white/10 rounded-2xl p-4 sm:p-4.5 text-left transition-all duration-300 ease-out cursor-pointer hover:-translate-y-[4px] hover:scale-[1.01] hover:border-secondary hover:shadow-[0_8px_24px_-4px_rgba(255,79,135,0.25)] flex flex-col justify-between min-h-[145px] sm:min-h-[160px] group"
            >
              {/* Stage Number */}
              <div>
                <span className="text-xs sm:text-sm font-bold font-sans block mb-2 text-secondary">
                  {stage.number}
                </span>

                {/* Stage Title */}
                <h3 className="font-sans font-bold text-sm sm:text-base block mb-1.5 leading-tight text-white group-hover:text-secondary transition-colors duration-300">
                  {stage.title}
                </h3>
              </div>

              {/* Stage Description */}
              <p className="font-sans text-[11px] sm:text-xs text-slate-400 leading-snug block font-medium">
                {stage.description}
              </p>
            </ScrollReveal>
          ))}
        </div>

      </div>

    </section>
  );
}
