"use client";

import React from "react";
import Image from "next/image";

export default function HowItWorksDiscovery() {
  const creators = [
    {
      id: 1,
      name: "Aarohi Mehta",
      info: "24.8K · Clean Beauty",
      match: "92% MATCH",
      badgeStyle: "bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 border border-pink-200/60 dark:border-pink-500/20",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      staggerClass: "lg:translate-y-4",
    },
    {
      id: 2,
      name: "Riya Sharma",
      info: "52.0K · Lifestyle & Art",
      match: "96% MATCH",
      badgeStyle: "bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-foreground border border-slate-200/80 dark:border-white/10",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      staggerClass: "lg:-translate-y-2",
    },
    {
      id: 3,
      name: "Maya Kapoor",
      info: "86.0K · Haute Fashion",
      match: "89% MATCH",
      badgeStyle: "bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-foreground border border-slate-200/80 dark:border-white/10",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
      staggerClass: "lg:translate-y-2",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION, VERIFICATION CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              01 · DISCOVER
            </span>

            {/* Editorial Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Find the right people <br className="hidden sm:inline" />
              for your story.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 max-w-md">
              Filter by nuanced visual aesthetics, past brand affinities, genuine audience metrics, and thematic focus. Our algorithm matches with creative precision, not random vanity counts.
            </p>

            {/* Verification Status Card */}
            <div className="bg-white/95 dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-xs inline-flex items-center gap-2.5 max-w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="font-sans text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                Verified audience authentic engagement rating: <strong className="font-semibold text-slate-900 dark:text-foreground">92% – 98%</strong>
              </span>
            </div>

          </div>


          {/* -------------------------------------------------------
              RIGHT COLUMN: 3 EDITORIAL CREATOR CARDS
          ------------------------------------------------------- */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className={`bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm hover:-translate-y-[6px] hover:scale-[1.02] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-pointer group text-left ${creator.staggerClass}`}
                >
                  {/* Image Container with Rounded Corners */}
                  <div className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-800">
                    <Image src={creator.image} alt={creator.name} fill className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />

                    {/* Match Badge Top Right */}
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className={`backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold font-sans tracking-wider shadow-2xs inline-block ${creator.badgeStyle}`}>
                        {creator.match}
                      </span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="px-1 pb-1">
                    <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-foreground mb-0.5 leading-snug">
                      {creator.name}
                    </h4>
                    <span className="font-sans text-xs text-slate-500 dark:text-text-muted block font-medium">
                      {creator.info}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
