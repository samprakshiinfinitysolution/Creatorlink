"use client";

import React, { useState } from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function CreatorLifecycle() {
  const [lifecycleSteps] = useState([
    {
      number: "01",
      title: "Create Your Profile",
      description: "Introduce yourself and your creative niche.",
    },
    {
      number: "02",
      title: "Showcase Your Work",
      description: "Add your portfolio, content and services.",
    },
    {
      number: "03",
      title: "Discover Opportunities",
      description: "Explore campaigns that interest you.",
    },
    {
      number: "04",
      title: "Connect With Brands",
      description: "Discuss opportunities and expectations.",
    },
    {
      number: "05",
      title: "Create Content",
      description: "Work on agreed campaign deliverables.",
    },
    {
      number: "06",
      title: "Complete & Grow",
      description: "Build experience and explore future collaborations.",
    },
  ]);

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <ScrollReveal direction="up" delay={0} className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            08 / YOUR CREATOR JOURNEY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            A Simple Journey From Profile to Partnership.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            CreatorLink helps bring the important parts of your creator journey together, from showcasing your work to connecting with brands and completing collaborations.
          </p>
        </ScrollReveal>

        {/* =========================================================
            2. MAIN CARDS GRID: 6 EQUAL ROUNDED CARDS
            Breakpoints:
            - Desktop: 6 columns
            - Tablet: 3 columns (3 × 2)
            - Mobile: 2 columns (2 × 3)
            - Very small mobile: 1 column
        ========================================================= */}
        <div className="grid grid-cols-1 max-[400px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-4 xl:gap-5 items-stretch">
          {lifecycleSteps.map((step, idx) => (
            <ScrollReveal
              key={step.number}
              as="article"
              direction="up"
              delay={idx * 70}
              className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.18)] hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300 ease-out flex flex-col justify-between text-left h-full"
            >
              <div>
                {/* Number Accent */}
                <span className="text-xs sm:text-sm font-sans font-semibold text-slate-400 dark:text-text-muted group-hover:text-secondary transition-colors duration-300 block mb-4 sm:mb-6">
                  {step.number}
                </span>

                {/* Title */}
                <h3 className="font-serif text-lg sm:text-xl font-medium text-slate-900 dark:text-foreground transition-colors duration-300 mb-2.5">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm font-sans text-slate-500 dark:text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
