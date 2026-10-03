"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function CreatorProduction() {
  // Conceptual structure for future backend video switching
  const [mediaData] = useState({
    mediaType: "image", // "image" | "video"
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    videoUrl: "",
    title: "GLOW RITUAL",
    subtitle: "Lumina Skin",
    creatorName: "@aarohi.mehta",
    caption: "Quiet mornings with @glowbeauty botanical dew. Shot on prime 50mm.",
  });

  const steps = [
    {
      num: "STEP 01",
      title: "Concept",
      desc: "Moodboard & shotlist aligned.",
    },
    {
      num: "STEP 02",
      title: "Shoot",
      desc: "Natural light capture.",
    },
    {
      num: "STEP 03",
      title: "Color Edit",
      desc: "Warm pastel grading.",
    },
    {
      num: "STEP 04",
      title: "Deliver",
      desc: "One-click submission.",
    },
  ];

  const deliverables = [
    {
      filename: "Reel_01_MorningRoutine_Master.mov (480MB)",
      status: "Ready",
    },
    {
      filename: "Reel_02_MacroTexture_Cut.mov (510MB)",
      status: "Ready",
    },
    {
      filename: "Story_Frames_Bundle_1–3.zip (65MB)",
      status: "Ready",
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
        <div className="max-w-2xl text-left mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
            06 / PRODUCTION
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
            Now make something unforgettable.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
            Focus entirely on lighting, grading, and authentic expression. Creator Hub manages preview approvals, frame-accurate notes, and rights clearance.
          </p>
        </div>

        {/* =========================================================
            2. MAIN 2-COLUMN LAYOUT
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* -------------------------------------------------------
              LEFT COLUMN: TALL MEDIA PREVIEW CARD (Lg: 5 Cols)
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="group relative w-full max-w-[340px] sm:max-w-[360px] h-[520px] sm:h-[560px] rounded-[36px] overflow-hidden bg-slate-900 border-4 border-[#1C1917] shadow-2xl hover:shadow-[0_20px_45px_-10px_rgba(255,79,135,0.25)] hover:-translate-y-1 transition-all duration-300">

              {/* Media Content (Structure ready for Image / Video switching) */}
              {mediaData.mediaType === "video" ? (
                <video
                  src={mediaData.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={mediaData.imageUrl}
                  alt="Production Media Preview"
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              )}

              {/* Top-Left Pill Overlay */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white border border-white/10 shadow-xs">
                  4K 60FPS • PRORES
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
              <button
                type="button"
                aria-label="Play video preview"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 z-10 cursor-pointer"
              >
                ▶
              </button>

              {/* Bottom Frosted Overlay Card */}
              <div className="absolute inset-x-3 bottom-3 z-10 bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-left text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-200 text-slate-900 font-sans font-bold text-xs flex items-center justify-center shrink-0">
                    AM
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-white block">
                      {mediaData.creatorName}
                    </span>
                    <p className="text-[11px] font-sans text-white/80 leading-snug mt-0.5">
                      {mediaData.caption}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------
              RIGHT COLUMN: STEP CARDS & FINAL SUBMISSION CARD (Lg: 7 Cols)
          ------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">

            {/* 4 HORIZONTAL STEP CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border text-left transition-all duration-300 bg-white dark:bg-surface border-slate-200/80 dark:border-white/10 hover:border-secondary/60 hover:shadow-[0_8px_20px_-6px_rgba(255,79,135,0.18)] hover:-translate-y-0.5"
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                    {step.num}
                  </span>
                  <h4 className="font-serif font-semibold text-sm text-slate-900 dark:text-foreground mb-1">
                    {step.title}
                  </h4>
                  <p className="text-[11px] font-sans text-slate-500 dark:text-text-muted leading-tight">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* WHITE FINAL SUBMISSION CARD */}
            <div className="group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 hover:border-secondary/60 rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-[0_12px_32px_-8px_rgba(255,79,135,0.2)] hover:-translate-y-1 transition-all duration-300 relative text-left">

              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-text-muted font-sans block mb-1">
                    FINAL CONTENT SUBMISSION
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground">
                    Aarohi Mehta → Glow Beauty
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

              {/* Bottom Info Panel (Brand Review Window) */}
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0 mt-0.5">
                  🔒
                </span>
                <p>
                  <strong className="font-bold text-slate-900 dark:text-white">Brand Review Window:</strong> Glow Beauty has 48 hours to request minor audio or cut edits. If no revision is requested, earnings automatically release.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
