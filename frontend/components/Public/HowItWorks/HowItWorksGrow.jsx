"use client";

import React from "react";

export default function HowItWorksGrow() {
  const stats = [
    {
      id: 1,
      value: "4.9",
      label: "CREATOR RATING",
    },
    {
      id: 2,
      value: "28",
      label: "COMPLETED CAMPAIGNS",
    },
    {
      id: 3,
      value: "12",
      label: "REPEAT BRANDS",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10 text-center">
        
        {/* -------------------------------------------------------
            SECTION HEADER: EYEBROW, HEADING, DESCRIPTION
        ------------------------------------------------------- */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow */}
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans text-center">
            09 · GROW &amp; NURTURE
          </span>

          {/* Editorial Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5 text-center">
            Great collaborations don't end with <br className="hidden sm:inline" />
            one campaign.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto text-center">
            Transforms singular partnerships into long-term brand ambassador guilds through verifiable reputation scores and seamless re-hiring.
          </p>
        </div>


        {/* -------------------------------------------------------
            MAIN TESTIMONIAL & STATS CARD
        ------------------------------------------------------- */}
        <div className="max-w-[920px] mx-auto bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-sm hover:-translate-y-[4px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-default text-left">
          
          {/* Header Row: Avatar, Brand Info & Repeat Campaign Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8">
            
            {/* Avatar & Brand Name */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 font-sans font-bold text-xs flex items-center justify-center border border-pink-200/60 dark:border-pink-500/20 shadow-2xs flex-shrink-0">
                GB
              </div>
              
              <div>
                <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-foreground leading-snug">
                  Glow Beauty Official
                </h3>
                
                <div className="flex items-center gap-1.5 mt-0.5 text-xs font-sans">
                  <span className="text-amber-500 tracking-wider">★★★★★</span>
                  <span className="text-slate-500 dark:text-text-muted font-medium text-[11px] sm:text-xs">
                    (Verified Brand Review)
                  </span>
                </div>
              </div>
            </div>

            {/* Status Pill Top-Right */}
            <div className="self-start sm:self-auto">
              <span className="bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 border border-pink-200/60 dark:border-pink-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full font-sans inline-block shadow-2xs">
                REPEAT CAMPAIGN EXTENDED
              </span>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-white/10 mb-6 sm:mb-8" />

          {/* Testimonial Quote */}
          <blockquote className="font-serif text-lg sm:text-xl lg:text-[22px] italic font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-8 sm:mb-10 text-left sm:text-center">
            “Aarohi understood our visual guidelines immediately. Engagement exceeded targets by 34%, and Creator Hub’s approval workflow saved our creative team ten hours of back-and-forth.”
          </blockquote>

          {/* 3 Statistic Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl p-5 text-center hover:-translate-y-[4px] hover:scale-[1.01] hover:border-secondary/40 hover:shadow-xs transition-all duration-300 ease-out cursor-pointer"
              >
                <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-foreground block mb-1 leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-text-muted font-sans block">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </section>
  );
}
