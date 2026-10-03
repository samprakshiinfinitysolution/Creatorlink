"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function PricingAutomatedInbound() {
  const creatorApplications = [
    {
      id: "elena",
      name: "Elena Vance",
      locationStats: "London • 54K",
      pitch: '"I love your tonal palette! Would love to shoot this in the Cotswolds next week."',
      matchScore: "MATCH SCORE: 96%",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: "marcus",
      name: "Marcus Chen",
      locationStats: "Berlin • 92K",
      pitch: '"Pitching a cinematic 4K reel highlighting stitching and garment flow."',
      matchScore: "MATCH SCORE: 92%",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
  ];

  const checklistItems = [
    "Define campaign aesthetic, deliverables, and exact requirements.",
    "Set fixed compensation or performance-based commission.",
    "Receive tailored creator applications with pitch videos.",
    "Manage multiple global campaign rosters from a unified deck.",
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient light */}
      <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1240px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* =========================================================
              LEFT COLUMN: CONTENT & CHECKLIST (~42%)
          ========================================================= */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
              AUTOMATED INBOUND
            </span>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4">
              Post a campaign. Let creators come to you.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6 sm:mb-8">
              Eliminate endless cold DMs. Publish your curated brief and attract creators who genuinely align with your aesthetic and brand values.
            </p>

            {/* Checklist Items */}
            <ul className="space-y-4 font-sans text-xs sm:text-sm text-slate-700 dark:text-text-secondary mb-8">
              {checklistItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-secondary/20 dark:bg-secondary/20 flex items-center justify-center text-secondary text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            {/* Bottom Link */}
            <Link
              href="/signup"
              className="text-secondary hover:text-secondary/80 font-sans font-semibold text-xs sm:text-sm inline-flex items-center gap-2 group cursor-pointer transition-colors duration-300"
            >
              <span>Learn More</span>
              <span className="text-base group-hover:translate-x-1.5 transition-transform duration-300">
                →
              </span>
            </Link>

          </div>

          {/* =========================================================
              RIGHT COLUMN: CAMPAIGN DASHBOARD CONTAINER (~58%)
          ========================================================= */}
          <div className="lg:col-span-7">
            <div className="bg-slate-100/70 dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 lg:p-8 shadow-xs text-left">
              
              {/* TOP CAMPAIGN BRIEF CARD */}
              <div className="group bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 hover:border-secondary/50 rounded-2xl p-5 sm:p-6 mb-5 shadow-xs hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_12px_28px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out">
                
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-secondary/20 dark:bg-secondary/20 text-secondary text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase font-sans">
                    CAMPAIGN BRIEF
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-text-muted">
                    $2,500 / creator
                  </span>
                </div>

                {/* Brief Title & Subtitle */}
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-2">
                  Autumn Capsule Collection
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans leading-relaxed mb-4">
                  Seeking 5 minimal fashion creators for 2x IG Reels and 3x Story frames featuring organic fabrics.
                </p>

                {/* Hashtag Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-text-secondary text-[11px] font-sans font-medium px-3 py-1 rounded-md">
                    #MinimalFashion
                  </span>
                  <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-text-secondary text-[11px] font-sans font-medium px-3 py-1 rounded-md">
                    #SustainableStyle
                  </span>
                </div>

              </div>

              {/* TWO CREATOR APPLICATION CARDS SIDE-BY-SIDE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {creatorApplications.map((creator) => (
                  <div
                    key={creator.id}
                    className="group bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 hover:border-secondary/50 rounded-2xl p-5 shadow-xs hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_12px_28px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out flex flex-col justify-between"
                  >
                    <div>
                      {/* Creator Profile Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Image src={creator.image} alt={creator.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
                        <div>
                          <h4 className="font-sans font-semibold text-sm text-slate-900 dark:text-foreground">
                            {creator.name}
                          </h4>
                          <span className="text-xs font-sans text-slate-500 dark:text-text-muted block">
                            {creator.locationStats}
                          </span>
                        </div>
                      </div>

                      {/* Pitch Quote */}
                      <p className="text-xs italic text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-4">
                        {creator.pitch}
                      </p>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-sans">
                        {creator.matchScore}
                      </span>

                      <button
                        type="button"
                        className="bg-secondary/20 dark:bg-secondary/20 group-hover:bg-secondary text-secondary group-hover:text-white dark:text-pink-200 dark:group-hover:text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                      >
                        Accept
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
