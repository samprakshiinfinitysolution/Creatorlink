"use client";

import React, { useState } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function CreatorProduction() {
  const [mediaData] = useState({
    imageUrl: "https://res.cloudinary.com/atr5osne/image/upload/v1792055989/creatorlink/public/editorial/xedvtbznkr5xa0ueowdf.webp",
    title: "CREATIVE SHOWCASE",
    subtitle: "Original Video & Visual Content",
    caption: "Bring campaign concepts to life through authentic personal expression.",
  });

  const steps = [
    {
      num: "STEP 01",
      title: "Plan Your Concept",
      desc: "Understand the brief and develop your creative idea.",
    },
    {
      num: "STEP 02",
      title: "Create",
      desc: "Shoot, record or design content in your own style.",
    },
    {
      num: "STEP 03",
      title: "Refine",
      desc: "Edit your content and make it ready for submission.",
    },
    {
      num: "STEP 04",
      title: "Submit",
      desc: "Share agreed deliverables with the brand for review.",
    },
  ];

  const deliverables = [
    {
      filename: "Primary Video Deliverable",
      status: "Ready for Review",
    },
    {
      filename: "Secondary Creative Cut",
      status: "Ready for Review",
    },
    {
      filename: "High-Resolution Photo Package",
      status: "Ready for Review",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">

      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[160px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">

        {/* =========================================================
            1. TOP CONTENT: LEFT ALIGNED INTRO
        ========================================================= */}
        <ScrollReveal direction="up" delay={0} className="max-w-2xl text-left mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            06 / CREATE YOUR CONTENT
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            Bring Your Creative Ideas to Life.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Once the campaign details are agreed, focus on creating content that reflects both your style and the brand&apos;s brief. Plan your concept, create your content and prepare the agreed deliverables.
          </p>
        </ScrollReveal>

        {/* =========================================================
            2. MAIN 2-COLUMN LAYOUT
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* -------------------------------------------------------
              LEFT COLUMN: TALL MEDIA PREVIEW CARD (Lg: 5 Cols)
          ------------------------------------------------------- */}
          <ScrollReveal direction="right" delay={120} className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="group relative w-full max-w-[340px] sm:max-w-[360px] h-[520px] sm:h-[560px] rounded-[36px] overflow-hidden bg-slate-900 border-4 border-[#1C1917] shadow-2xl hover:shadow-[0_20px_45px_-10px_rgba(255,79,135,0.25)] hover:-translate-y-1 transition-all duration-300">

              <Image
                src={mediaData.imageUrl}
                alt="Production Media Preview"
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
              />

              {/* Top-Left Pill Overlay */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white border border-white/10 shadow-xs">
                  ORIGINAL CONTENT
                </span>
              </div>

              {/* Top-Right Title Overlay */}
              <div className="absolute top-4 right-4 z-10 text-right">
                <span className="font-bold text-xs uppercase tracking-wider text-white block">
                  {mediaData.title}
                </span>
                <span className="text-[10px] font-sans text-white/80 block">
                  {mediaData.subtitle}
                </span>
              </div>

              {/* Center Play Button Icon */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 z-10">
                ▶
              </div>

              {/* Bottom Frosted Overlay Card */}
              <div className="absolute inset-x-3 bottom-3 z-10 bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-left text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/30 text-white font-sans font-bold text-xs flex items-center justify-center shrink-0">
                    CL
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-white block">
                      From Creative Idea to Final Content.
                    </span>
                    <p className="text-[11px] font-sans text-white/80 leading-snug mt-0.5">
                      Create content that feels authentic while meeting the campaign requirements.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: STEP CARDS & SUBMISSION CARD (Lg: 7 Cols)
          ------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">

            {/* 4 STEP CARDS */}
            <ScrollReveal direction="up" delay={160}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border text-left transition-all duration-300 bg-white dark:bg-surface border-slate-200/80 dark:border-white/10 hover:border-secondary/60 hover:shadow-[0_8px_20px_-6px_rgba(255,79,135,0.18)] hover:-translate-y-0.5"
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase text-secondary font-sans block mb-1.5">
                      {step.num}
                    </span>
                    <h4 className="font-serif font-semibold text-base text-slate-900 dark:text-foreground mb-1">
                      {step.title}
                    </h4>
                    <p className="text-xs font-sans text-slate-600 dark:text-text-secondary leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* WHITE SUBMISSION CARD */}
            <ScrollReveal direction="up" delay={220}>
              <div className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 relative text-left">

                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                      DELIVERABLE SUBMISSION
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground">
                      Campaign Deliverables
                    </h3>
                  </div>

                  <span className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Status: In Review
                  </span>
                </div>

                {/* Deliverable List */}
                <div className="space-y-3 mb-6">
                  {deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-t border-slate-100 dark:border-white/10 pt-3 flex items-center justify-between text-xs font-sans"
                    >
                      <span className="text-slate-800 dark:text-foreground font-medium truncate max-w-[280px] sm:max-w-md">
                        {item.filename}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Info Panel */}
                <div className="bg-pink-50/60 dark:bg-secondary/10 border border-pink-200/60 dark:border-secondary/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="text-secondary font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <p>
                    <strong className="font-bold text-slate-900 dark:text-white">Review &amp; Feedback:</strong> Share deliverables and collaborate on any necessary refinements with the brand.
                  </p>
                </div>

              </div>
            </ScrollReveal>

          </div>

        </div>

      </div>
    </section>
  );
}
