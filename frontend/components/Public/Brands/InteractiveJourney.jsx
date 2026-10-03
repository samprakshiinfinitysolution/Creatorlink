"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const STAGES = [
  {
    id: "01",
    label: "The Brief (Idea)",
    stageBadge: "STAGE 01",
    stageTitle: "Target Aesthetic & Campaign DNA",
  },
  {
    id: "02",
    label: "Creator Discovery",
    stageBadge: "STAGE 02",
    stageTitle: "Intelligent Tastemaker Discovery",
  },
  {
    id: "03",
    label: "The Match",
    stageBadge: "STAGE 03",
    stageTitle: "The Match & Smart Invite",
  },
  {
    id: "04",
    label: "Collaboration Workspace",
    stageBadge: "STAGE 04",
    stageTitle: "Collaboration Workspace",
  },
  {
    id: "05",
    label: "Creator Creates",
    stageBadge: "STAGE 05",
    stageTitle: "Creator Creates & Submits",
  },
  {
    id: "06",
    label: "Review & Approval",
    stageBadge: "STAGE 06",
    stageTitle: "Side-by-Side Review & Approval",
  },
  {
    id: "07",
    label: "Campaign Complete",
    stageBadge: "STAGE 07",
    stageTitle: "Campaign Complete & Growth",
  },
];

const DISCOVERY_CREATORS = [
  {
    name: "Aarohi Mehta",
    niche: "Beauty • 98% Match",
    fee: "₹30,000",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Riya Sharma",
    niche: "Wellness • 92% Match",
    fee: "₹25,000",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Maya Kapoor",
    niche: "Lifestyle • 89% Match",
    fee: "₹32,000",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Anaya Shah",
    niche: "Design • 87% Match",
    fee: "₹18,000",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Kiara Jain",
    niche: "Skincare • 94% Match",
    fee: "₹28,000",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
];

export default function InteractiveJourney() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle stage change with smooth content transition
  const changeStage = (newIndex) => {
    if (newIndex === activeStageIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveStageIndex(newIndex);
      setIsTransitioning(false);
    }, 180);
  };

  // ONE CLICK = ONE STAGE FORWARD (01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 01)
  const handleNextStage = () => {
    const nextIndex = (activeStageIndex + 1) % STAGES.length;
    changeStage(nextIndex);
  };

  const handleManualStageClick = (index) => {
    changeStage(index);
  };

  const currentStage = STAGES[activeStageIndex];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute right-1/4 top-1/3 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-secondary/[0.04] blur-[150px]" />

      <div className="mx-auto max-w-[1440px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* =========================================================
              LEFT SIDE: EYEBROW, HEADING & 7-STAGE NAVIGATION
          ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-3 font-sans">
              INTERACTIVE JOURNEY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-tight mb-4">
              Your campaign, step by step.
            </h2>

            <p className="text-base text-text-secondary font-sans leading-relaxed mb-8">
              Explore how effortless creator collaborations become when discovery, messaging, escrow, and review sit within one unified digital workspace.
            </p>

            {/* 7 Vertical Stage Navigation Items */}
            <div className="space-y-1.5 mb-6">
              {STAGES.map((stage, index) => {
                const isActive = activeStageIndex === index;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => handleManualStageClick(index)}
                    className={`w-full text-left flex items-center justify-between py-2 sm:py-2.5 px-3 rounded-xl min-h-[48px] sm:min-h-[52px] transition-all duration-300 cursor-pointer ${isActive
                        ? "bg-surface border border-secondary/40 shadow-sm text-foreground"
                        : "text-text-secondary hover:text-foreground hover:bg-surface/50 border border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Circular Stage Number */}
                      <div
                        className={`w-7 h-7 rounded-full text-xs font-bold font-sans flex items-center justify-center transition-all duration-300 ${isActive
                            ? "bg-secondary text-white shadow-xs"
                            : "bg-surface-muted text-text-secondary border border-border-theme"
                          }`}
                      >
                        {stage.id}
                      </div>

                      {/* Stage Label */}
                      <span
                        className={`text-sm font-sans transition-colors ${isActive
                            ? "font-bold text-foreground"
                            : "font-medium text-text-secondary"
                          }`}
                      >
                        {stage.label}
                      </span>
                    </div>

                    {/* Right Arrow on active/hovered */}
                    <span
                      className={`text-xs font-semibold transition-all duration-300 ${isActive
                          ? "text-secondary translate-x-1 opacity-100"
                          : "text-text-secondary/30 opacity-0 group-hover:opacity-100"
                        }`}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Step Progression Control Button & Info Text */}
            <div className="flex items-center gap-3 text-xs text-text-secondary font-sans">
              <button
                type="button"
                onClick={handleNextStage}
                title="Next Stage"
                className="w-8 h-8 rounded-full bg-surface border border-border-theme hover:border-secondary hover:text-secondary text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <span className="text-sm font-bold">↻</span>
              </button>
              <span>Step navigation auto-cycles or click to jump.</span>
            </div>
          </div>

          {/* =========================================================
              RIGHT SIDE: ENLARGED WORKSPACE CARD WITH 7 STAGE PANELS
          ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-surface border border-border-theme rounded-3xl p-7 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden transition-all duration-300 min-h-[440px]">

              {/* TOP OF CARD: BADGE, DYNAMIC TITLE & STEP COUNTER */}
              <div className="flex items-center justify-between pb-4 border-b border-border-theme/60">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold tracking-wider uppercase font-sans">
                    {currentStage.stageBadge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-medium text-foreground">
                    {currentStage.stageTitle}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-text-secondary font-sans">
                  Step {activeStageIndex + 1} of 7
                </span>
              </div>

              {/* DYNAMIC STAGE CONTENT WITH FADE-SLIDE TRANSITION */}
              <div
                className={`pt-6 transition-all duration-300 ${isTransitioning
                    ? "opacity-0 translate-y-2"
                    : "opacity-100 translate-y-0"
                  }`}
              >
                {/* STAGE 01: Target Aesthetic & Campaign DNA */}
                {activeStageIndex === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-6 space-y-4">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                          CAMPAIGN SCOPE
                        </span>
                        <p className="text-sm font-bold text-foreground font-sans">
                          Sunlit Organic Skincare Serum
                        </p>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Targeting women 24–38 seeking clean beauty and understated routines.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                            BUDGET RESERVE
                          </span>
                          <p className="text-base font-bold text-foreground font-sans">
                            ₹50,000 INR
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-secondary font-sans px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                          2 Reels + 3 Stories
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-medium font-sans border border-secondary/20">
                          Instagram High-Res
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-medium font-sans border border-secondary/20">
                          Organic TikTok Stitch
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-6">
                      <div className="relative rounded-2xl overflow-hidden border border-border-theme bg-surface-muted aspect-[4/3] group shadow-xs">
                        <Image src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800" alt="Moodboard" fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-left">
                          <p className="text-xs font-semibold text-white font-sans tracking-wide">
                            Moodboard: Quiet Radiance & Morning Rituals
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 02: Intelligent Tastemaker Discovery */}
                {activeStageIndex === 1 && (
                  <div>
                    <p className="text-xs text-text-secondary font-sans mb-4">
                      Matched creators based on audience affinity, engagement rate, and campaign DNA.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {DISCOVERY_CREATORS.map((c) => (
                        <div
                          key={c.name}
                          className="p-3 rounded-2xl bg-surface-muted border border-border-theme/80 hover:border-secondary/40 transition-all text-left flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Image src={c.image} alt={c.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-border-theme shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground font-sans truncate">
                                {c.name}
                              </p>
                              <p className="text-[10px] text-secondary font-medium font-sans truncate">
                                {c.niche}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-foreground font-sans">
                            {c.fee}
                          </p>
                        </div>
                      ))}

                      {/* Final +18 More Card */}
                      <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/30 text-center flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-secondary font-sans">
                          +18 More
                        </span>
                        <span className="text-[10px] text-text-secondary font-sans mt-0.5">
                          Trained on brief
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 03: The Match & Smart Invite */}
                {activeStageIndex === 2 && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary font-bold text-xs flex items-center justify-center font-sans border border-secondary/30">
                          GB
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground font-sans leading-none">
                            Glow Beauty
                          </p>
                          <span className="text-[10px] text-text-secondary font-sans">
                            Verified Brand Client
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold font-sans">
                          98% Synergy Score
                        </span>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-sans">
                          Invitation Accepted ✓
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-sm font-bold text-foreground font-sans leading-none">
                            Aarohi Mehta
                          </p>
                          <span className="text-[10px] text-text-secondary font-sans">
                            82% Audience Relevance
                          </span>
                        </div>
                        <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Aarohi Mehta" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-border-theme" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface border border-secondary/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-xs">
                          ✓
                        </span>
                        <p className="text-xs font-medium text-foreground font-sans">
                          Brief locked: 2 High-Res Reels & 3 Story Slides. Escrow funded ₹30,000.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-sans shrink-0">
                        Status: In Production
                      </span>
                    </div>
                  </div>
                )}

                {/* STAGE 04: Collaboration Workspace */}
                {activeStageIndex === 3 && (
                  <div className="space-y-4">
                    <div className="p-3 px-4 rounded-xl bg-surface-muted border border-border-theme/60 flex items-center justify-between text-xs font-sans">
                      <span className="font-semibold text-foreground">
                        Terms: ₹30,000 • 2 Reels • 3 Stories
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        🔒 Escrow Secured
                      </span>
                    </div>

                    {/* Conversation Interface */}
                    <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 space-y-3">
                      {/* Brand Message */}
                      <div className="flex flex-col items-start max-w-[85%]">
                        <span className="text-[10px] font-bold text-text-secondary mb-1 font-sans">
                          Glow Beauty (Campaign Director)
                        </span>
                        <div className="p-3 rounded-2xl rounded-tl-xs bg-surface border border-border-theme text-xs text-foreground font-sans shadow-2xs">
                          Could we focus the first Reel around the morning golden hour light on the serum dropper?
                        </div>
                      </div>

                      {/* Creator Response */}
                      <div className="flex flex-col items-end max-w-[85%] ml-auto">
                        <span className="text-[10px] font-bold text-secondary mb-1 font-sans">
                          Aarohi Mehta
                        </span>
                        <div className="p-3 rounded-2xl rounded-tr-xs bg-secondary text-white text-xs font-sans shadow-2xs">
                          Absolutely! I have an idea for the opening sun-catcher frame. Filming tomorrow morning! ✨
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 05: Creator Creates & Submits */}
                {activeStageIndex === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left Creator Video Preview Card */}
                    <div className="md:col-span-5">
                      <div className="relative rounded-2xl overflow-hidden border border-border-theme aspect-[3/4] bg-surface-muted group shadow-xs">
                        <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600" alt="Content Preview" fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold font-sans">
                          Reel 01 (Draft 4K)
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-left text-white font-sans">
                          <p className="text-xs font-bold">Aarohi Mehta</p>
                          <p className="text-[10px] text-secondary mt-0.5 font-medium">
                            #MorningGlow #CleanBeautyLaunch
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Asset Submission Cards */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/80 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          CONTENT DELIVERED
                        </span>
                        <p className="text-sm font-bold text-foreground font-sans">
                          Reel 01: Morning Skincare Ritual
                        </p>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Uploaded today at 10:42 AM • 4K 60fps ProRes
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/80 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                          ASSET LIBRARY
                        </span>
                        <p className="text-sm font-semibold text-foreground font-sans">
                          3× Raw Story B-Roll Clips Attached
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 06: Side-by-Side Review & Approval */}
                {activeStageIndex === 5 && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme text-left">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground font-sans">
                          Timestamped Feedback Review
                        </span>
                        <span className="text-xs font-semibold text-secondary font-sans">
                          0:14 / 0:45 min
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface border border-secondary/30 text-xs text-foreground font-sans leading-relaxed">
                        <span className="font-bold text-secondary mr-2">Brand Note [0:08]:</span>
                        &quot;The lighting transition when showing the ingredients label is flawless. No revisions needed!&quot;
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        type="button"
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-xs tracking-wide shadow-md transition-all cursor-pointer"
                      >
                        ✓ Approve Content
                      </button>

                      <button
                        type="button"
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-surface hover:bg-surface-muted border border-border-theme text-foreground font-sans font-semibold text-xs tracking-wide transition-all cursor-pointer"
                      >
                        Request Minor Tweak
                      </button>
                    </div>
                  </div>
                )}

                {/* STAGE 07: Campaign Complete & Growth */}
                {activeStageIndex === 6 && (
                  <div className="space-y-6">
                    {/* 3 Metric Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                          Total Reach
                        </span>
                        <p className="text-xl font-serif font-bold text-foreground">
                          142.6K
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                          Engagement
                        </span>
                        <p className="text-xl font-serif font-bold text-secondary">
                          7.4%
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1 font-sans">
                          Escrow Released
                        </span>
                        <p className="text-xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ ₹30K
                        </p>
                      </div>
                    </div>

                    {/* Rating & Review Quote */}
                    <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                      <div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold font-sans mb-1">
                          <span>★★★★★</span>
                          <span className="text-foreground ml-1">4.9 Creator Rating</span>
                        </div>
                        <p className="text-xs italic text-text-secondary font-sans">
                          &quot;Incredible storytelling, delivered 2 days ahead of schedule.&quot;
                        </p>
                      </div>

                      <button
                        type="button"
                        className="shrink-0 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary-dark text-white font-sans font-semibold text-xs tracking-wide shadow-md transition-all cursor-pointer"
                      >
                        Re-Book Creator
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
