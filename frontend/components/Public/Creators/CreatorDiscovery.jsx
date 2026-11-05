"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function CreatorDiscovery() {
  const discoveryFeatures = [
    "Explore available campaigns.",
    "Discover opportunities across different niches.",
    "Understand campaign requirements.",
    "Find projects that suit your creative interests.",
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[160px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            1. TOP CONTENT: CENTERED INTRO
        ========================================================= */}
        <ScrollReveal direction="up" delay={0} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            03 / DISCOVER OPPORTUNITIES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            Find Brands That Match Your Creative World.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Explore collaboration opportunities and discover brands looking for creative talent. Find projects that connect with your niche, content style and interests.
          </p>
        </ScrollReveal>

        {/* 4 Feature Points Row */}
        <ScrollReveal direction="up" delay={60} className="mb-10 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto">
            {discoveryFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xs hover:-translate-y-0.5 transition-transform"
              >
                <div className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                <span className="text-xs sm:text-sm font-sans font-medium text-slate-800 dark:text-foreground text-left">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* =========================================================
            2. MAIN 3-COLUMN COMPOSITION
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: TWO STACKED CAMPAIGN CARDS (4 COLS)
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={80} className="lg:col-span-4 space-y-6">
            
            {/* CARD 1: ACTIVEWEAR & WELLNESS */}
            <div className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-3xl p-6 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 relative text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-text-muted font-sans">
                  ACTIVEWEAR &amp; WELLNESS
                </span>
                <span className="bg-[#FCEFEF] dark:bg-secondary/20 text-slate-900 dark:text-foreground text-xs font-bold px-2.5 py-0.5 rounded-full font-sans">
                  OPEN BRIEF
                </span>
              </div>

              <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors duration-200 mb-1.5">
                Activewear Campaign
              </h3>
              <p className="text-xs text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-4">
                Seeking lifestyle creators for routine integration featuring workout &amp; active leisure apparel.
              </p>

              <div className="pt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-sans">
                <span className="text-slate-500 dark:text-text-muted">
                  1 Reel • 2 Story frames
                </span>
                <span className="font-bold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors duration-200 tracking-wider">
                  EXPLORE →
                </span>
              </div>
            </div>

            {/* CARD 2: TRAVEL & HOSPITALITY */}
            <div className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-3xl p-6 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 relative text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-text-muted font-sans">
                  BOUTIQUE STAYS
                </span>
                <span className="bg-[#FCEFEF] dark:bg-secondary/20 text-slate-900 dark:text-foreground text-xs font-bold px-2.5 py-0.5 rounded-full font-sans">
                  FEATURED
                </span>
              </div>

              <h3 className="text-lg font-serif font-semibold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors duration-200 mb-1.5">
                Heritage Villa Experience
              </h3>
              <p className="text-xs text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-4">
                Authentic travel storytelling showcasing architectural spaces, culinary experiences and local hospitality.
              </p>

              <div className="pt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-sans">
                <span className="text-slate-500 dark:text-text-muted">
                  Short Video + Photo Series
                </span>
                <span className="font-bold text-slate-900 dark:text-foreground group-hover:text-secondary transition-colors duration-200 tracking-wider">
                  VIEW →
                </span>
              </div>
            </div>

          </ScrollReveal>

          {/* -------------------------------------------------------
              CENTER COLUMN: CREATOR PORTRAIT + MATCH BADGE (4 COLS)
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={160} className="lg:col-span-4 flex flex-col items-center">
            
            {/* Center Creator Portrait Card */}
            <div className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[36px] p-3 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden w-full max-w-[340px] mb-5">
              <div className="relative w-full h-[350px] sm:h-[380px] rounded-[28px] overflow-hidden bg-slate-100 dark:bg-surface-muted">
                <Image
                  src="https://res.cloudinary.com/atr5osne/image/upload/v1792055924/creatorlink/public/avatars/icd4u9aqoj90ycvmdt1m.webp"
                  alt="Creator Showcase"
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                />
              </div>
            </div>

            {/* Dark Rounded Match Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1917] text-white shadow-md text-xs font-bold tracking-wider uppercase font-sans mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              RELEVANT CAMPAIGN OPPORTUNITY
            </div>

            {/* Subtext */}
            <p className="text-[11px] text-slate-500 dark:text-text-muted font-sans text-center">
              Explore opportunities and take the next step in your creator journey
            </p>

          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: CAMPAIGN DETAILS CARD (4 COLS)
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={240} className="lg:col-span-4">
            <div className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] p-7 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 relative text-left">
              
              {/* Top Floating Pill */}
              <div className="absolute -top-3.5 right-6 z-20">
                <span className="bg-[#F2B5BE] text-slate-900 text-[10px] font-bold tracking-widest uppercase px-3.5 py-1 rounded-full shadow-xs">
                  CAMPAIGN BRIEF
                </span>
              </div>

              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center font-bold text-xs font-serif text-slate-800 dark:text-foreground bg-slate-50 dark:bg-surface flex-shrink-0">
                  CL
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-slate-900 dark:text-foreground">
                    Your Next Collaboration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-text-muted font-sans">
                    Skincare &amp; Daily Routine Campaign
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed mb-5">
                Seeking creators who love authentic, relatable content and clean product demonstration.
              </p>

              {/* Campaign Highlights Panel */}
              <div className="bg-[#FDF0F3] dark:bg-secondary/10 border border-[#F7D8DF] dark:border-secondary/20 rounded-2xl p-4 text-xs font-sans space-y-2.5 mb-6">
                <div className="flex justify-between items-center text-slate-700 dark:text-foreground">
                  <span className="text-slate-500 dark:text-text-muted">Campaign Type:</span>
                  <span className="font-bold text-slate-900 dark:text-foreground">Product Feature</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-foreground">
                  <span className="text-slate-500 dark:text-text-muted">Deliverables:</span>
                  <span className="font-medium">1 Short Video + 2 Story frames</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-foreground">
                  <span className="text-slate-500 dark:text-text-muted">Timeline:</span>
                  <span className="font-medium">Agreed before work starts</span>
                </div>
              </div>

              {/* Bottom CTA */}
              <Link
                href="/signup?role=creator"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#F5C2CB] hover:bg-[#EEB2BD] text-slate-900 font-sans font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>EXPLORE OPPORTUNITIES</span>
                <span>→</span>
              </Link>

            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
