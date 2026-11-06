"use client";

import React, { useState } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/theme/ScrollReveal";

const STAGES = [
  {
    id: "01",
    label: "Create Your Brief",
    stageBadge: "STAGE 01",
    stageTitle: "Start With a Clear Campaign Idea.",
  },
  {
    id: "02",
    label: "Discover Creators",
    stageBadge: "STAGE 02",
    stageTitle: "Explore Creators That Fit Your Brand.",
  },
  {
    id: "03",
    label: "Connect With Creators",
    stageBadge: "STAGE 03",
    stageTitle: "Start a Conversation With the Right Creators.",
  },
  {
    id: "04",
    label: "Finalize the Details",
    stageBadge: "STAGE 04",
    stageTitle: "Make Sure Everyone Is on the Same Page.",
  },
  {
    id: "05",
    label: "Content Creation",
    stageBadge: "STAGE 05",
    stageTitle: "Let Creators Bring Your Campaign to Life.",
  },
  {
    id: "06",
    label: "Review Content",
    stageBadge: "STAGE 06",
    stageTitle: "Review the Work and Share Feedback.",
  },
  {
    id: "07",
    label: "Complete the Campaign",
    stageBadge: "STAGE 07",
    stageTitle: "Complete Your Campaign and Build Lasting Connections.",
  },
];

const DISCOVERY_CATEGORIES = [
  {
    title: "Fashion & Beauty",
    desc: "Aesthetic styling, skincare, makeup and fashion routines.",
    icon: "✦",
    creatorName: "Aarohi Mehta",
    creatorCategory: "Beauty • 98% Match",
    image:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp",
  },
  {
    title: "Food & Lifestyle",
    desc: "Culinary arts, morning rituals, home and living experiences.",
    icon: "✦",
    creatorName: "Maya Kapoor",
    creatorCategory: "Lifestyle • 89% Match",
    image:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054710/creatorlink/public/avatars/ra9dirifievmiawd57yl.webp",
  },
  {
    title: "Travel & Experiences",
    desc: "Destination stories, hospitality, architecture and journeys.",
    icon: "✦",
    creatorName: "Riya Sharma",
    creatorCategory: "Wellness • 92% Match",
    image:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054701/creatorlink/public/avatars/qooau1mzc4okikpsrqri.webp",
  },
  {
    title: "Technology & Digital Content",
    desc: "Tech storytelling, creative digital tools and reviews.",
    icon: "✦",
    creatorName: "Anaya Shah",
    creatorCategory: "Design • 87% Match",
    image:
      "https://res.cloudinary.com/atr5osne/image/upload/v1792054706/creatorlink/public/avatars/qvmu4uqdqpexdchfnvys.webp",
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
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 xl:col-span-4 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-3 font-sans">
              YOUR CAMPAIGN JOURNEY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-tight mb-4">
              From Campaign Idea to Creator Collaboration.
            </h2>

            <p className="text-base text-text-secondary font-sans leading-relaxed mb-8">
              Turn your marketing ideas into creator collaborations through a clear, simple journey. Discover creators, share your campaign requirements, connect with the right people and manage the work together.
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

            {/* Step Progression Control Button */}
            <div className="flex items-center gap-3 text-xs text-text-secondary font-sans">
              <button
                type="button"
                onClick={handleNextStage}
                title="Next Stage"
                className="w-8 h-8 rounded-full bg-surface border border-border-theme hover:border-secondary hover:text-secondary text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <span className="text-sm font-bold">→</span>
              </button>
              <span>Click to navigate through each collaboration step.</span>
            </div>
          </ScrollReveal>

          {/* =========================================================
              RIGHT SIDE: ENLARGED WORKSPACE CARD WITH 7 STAGE PANELS
          ========================================================= */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-7 xl:col-span-8">
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
                {/* STAGE 01: Create Your Brief */}
                {activeStageIndex === 0 && (
                  <div className="text-left space-y-6">
                    <p className="text-sm text-text-secondary font-sans leading-relaxed">
                      Tell creators what your brand wants to promote and what you want to achieve. Share your campaign details, target audience, content requirements, budget and expected timeline.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          CAMPAIGN GOAL
                        </span>
                        <p className="text-sm font-bold text-foreground font-sans">
                          What do you want to promote?
                        </p>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Define product launch, brand awareness, or seasonal campaign goals.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          CONTENT REQUIREMENTS
                        </span>
                        <p className="text-sm font-bold text-foreground font-sans">
                          Deliverables &amp; Formats
                        </p>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Reels, videos, photographs or other agreed deliverables.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          CAMPAIGN TIMELINE
                        </span>
                        <p className="text-sm font-bold text-foreground font-sans">
                          Expected Dates
                        </p>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Share your expected start and completion dates.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          CAMPAIGN BUDGET
                        </span>
                        <p className="text-sm font-bold text-foreground font-sans">
                          Planned Compensation
                        </p>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Set the budget you have planned for the collaboration.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 02: Discover Creators */}
                {activeStageIndex === 1 && (
                  <div className="text-left space-y-6">
                    <div>
                      <h4 className="font-serif text-lg font-medium text-foreground mb-1">
                        Explore Creative Talent.
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                        Discover creators across different niches and content styles. Explore creator profiles and understand their niche, content style, social presence and services.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {DISCOVERY_CATEGORIES.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-surface-muted border border-border-theme/80 hover:border-secondary/40 transition-all text-left flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-secondary text-xs">{item.icon}</span>
                              <h5 className="text-sm font-bold text-foreground font-sans">
                                {item.title}
                              </h5>
                            </div>
                            <p className="text-xs text-text-secondary font-sans leading-relaxed mb-3">
                              {item.desc}
                            </p>
                          </div>
                          {item.image && (
                            <div className="pt-2.5 border-t border-border-theme/60 flex items-center gap-2">
                              <Image
                                src={item.image}
                                alt={item.creatorName || item.title}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover border border-border-theme shrink-0"
                              />
                              <div className="min-w-0 flex items-center gap-1.5 text-[11px] font-sans">
                                <span className="font-semibold text-foreground truncate">
                                  {item.creatorName}
                                </span>
                                <span className="text-secondary font-medium truncate">
                                  • {item.creatorCategory}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STAGE 03: Connect With Creators */}
                {activeStageIndex === 2 && (
                  <div className="text-left space-y-6">
                    <div>
                      <h4 className="font-serif text-lg font-medium text-foreground mb-1">
                        Build the Right Connection.
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                        Start meaningful conversations and explore collaboration possibilities. Once you find creators you are interested in, reach out and share your campaign opportunity.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Share campaign details.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Communicate your vision, timeline, and deliverables clearly.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Discuss creative ideas.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Listen to the creator&apos;s perspective on format and presentation.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Understand availability.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Ensure schedules and production dates align with your launch.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Explore collaboration interest.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Build partnerships where both brand and creator are invested.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 04: Finalize the Details */}
                {activeStageIndex === 3 && (
                  <div className="text-left space-y-6">
                    <div>
                      <h4 className="font-serif text-lg font-medium text-foreground mb-1">
                        Clear Expectations. Smooth Collaboration.
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                        A shared understanding helps brands and creators work together effectively. Discuss and agree on the important details before the campaign begins.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          ITEM 01
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Deliverables
                        </h5>
                        <p className="text-[11px] text-text-secondary font-sans mt-1">
                          Agreed formats &amp; assets
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          ITEM 02
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Budget &amp; Compensation
                        </h5>
                        <p className="text-[11px] text-text-secondary font-sans mt-1">
                          Transparent pricing
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          ITEM 03
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Timeline
                        </h5>
                        <p className="text-[11px] text-text-secondary font-sans mt-1">
                          Agreed deadlines
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          ITEM 04
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Content Requirements
                        </h5>
                        <p className="text-[11px] text-text-secondary font-sans mt-1">
                          Guidelines &amp; usage
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 05: Content Creation */}
                {activeStageIndex === 4 && (
                  <div className="text-left space-y-6">
                    <div>
                      <h4 className="font-serif text-lg font-medium text-foreground mb-1">
                        Your Brief Becomes Creative Content.
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                        Give creators the direction they need while allowing their unique content style to shine. Their creativity and your brand&apos;s direction come together to create content for your campaign.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          PHASE 01
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Concept Development
                        </h5>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Aligning on aesthetic and key talking points.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          PHASE 02
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Content Creation
                        </h5>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Filming, shooting and authentic production.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          PHASE 03
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Editing &amp; Refinement
                        </h5>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Color grading, audio and pacing.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1 font-sans">
                          PHASE 04
                        </span>
                        <h5 className="font-sans font-bold text-sm text-foreground">
                          Deliverable Submission
                        </h5>
                        <p className="text-xs text-text-secondary font-sans mt-1">
                          Uploading ready deliverables for brand review.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 06: Review & Approval */}
                {activeStageIndex === 5 && (
                  <div className="text-left space-y-6">
                    <div>
                      <h4 className="font-serif text-lg font-medium text-foreground mb-1">
                        Review. Refine. Finalize.
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                        Work together to bring the campaign content to its final form. Review the submitted content against your campaign requirements, share clear feedback, and approve final deliverables.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Review submitted content.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Inspect video drafts, photo sets and supporting captions.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Check agreed requirements.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Ensure brand tags, hashtags and core messaging are present.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Share feedback if needed.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Provide clear, actionable feedback directly to the creator.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          4
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Approve final deliverables.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Sign off on the finished content ready for publication.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 07: Complete the Campaign */}
                {activeStageIndex === 6 && (
                  <div className="text-left space-y-6">
                    <div>
                      <h4 className="font-serif text-lg font-medium text-foreground mb-1">
                        One Campaign Can Start a Long-Term Partnership.
                      </h4>
                      <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                        Build relationships with creative partners who understand your brand. Once the agreed deliverables are completed, wrap up the collaboration and explore future opportunities together.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Complete agreed deliverables.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            All content assets are archived and ready for your campaign.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Close the collaboration.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Conclude the collaboration according to pre-agreed terms.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Maintain creator relationships.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Keep in touch with creators whose content performed well.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-muted border border-border-theme/60 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-foreground">
                            Explore future campaigns.
                          </h5>
                          <p className="text-xs text-text-secondary font-sans mt-0.5">
                            Re-engage trusted creators for upcoming product launches.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
