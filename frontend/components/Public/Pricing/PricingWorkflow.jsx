"use client";

import React, { useState } from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function PricingWorkflow() {
  const [activeTab, setActiveTab] = useState("campaigns");

  const tabs = [
    { id: "campaigns", label: "Campaigns" },
    { id: "discovery", label: "Creator Discovery" },
    { id: "collaboration", label: "Collaboration" },
    { id: "analytics", label: "Analytics" },
    { id: "payments", label: "Payments" },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 border-b border-border-theme/60 transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute right-1/3 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1240px] relative z-10 text-center">
        {/* =========================================================
            1. INTRO: EYEBROW, HEADING & SUBTITLE
        ========================================================= */}
        <ScrollReveal direction="up" delay={0}>
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 text-center">
            COLLABORATION WORKFLOW
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 text-center max-w-2xl mx-auto">
            Everything You Need to Manage Creator Collaborations.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed text-center max-w-xl mx-auto mb-8 sm:mb-10">
            From discovering creators to managing campaign activities, CreatorLink helps brands organize their collaboration journey.
          </p>
        </ScrollReveal>

        {/* =========================================================
            2. INTERACTIVE TABS ROW
        ========================================================= */}
        <ScrollReveal direction="up" delay={80}>
          <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-2 px-1 mb-10 sm:mb-12 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-sans transition-all duration-300 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "bg-slate-900 dark:bg-slate-900 text-white font-semibold shadow-sm scale-[1.02]"
                      : "bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-text-muted hover:bg-slate-300/60 dark:hover:bg-white/15 hover:text-slate-900 dark:hover:text-white font-medium hover:-translate-y-0.5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* =========================================================
            3. DASHBOARD / WORKFLOW MOCKUP CONTAINER
        ========================================================= */}
        <ScrollReveal direction="scale" delay={120}>
          <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl max-w-[1020px] mx-auto text-left transition-all duration-300">
            {/* Browser Header Bar */}
            <div className="bg-slate-100/90 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-white/10 rounded-full px-4 sm:px-6 py-1 text-[11px] sm:text-xs font-mono text-slate-500 dark:text-text-muted tracking-tight text-center shadow-2xs truncate max-w-[280px] sm:max-w-md">
                creatorlink.com/campaigns
              </div>

              <div className="text-slate-400 dark:text-text-muted flex-shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
            </div>

            {/* Workflow Content Body */}
            <div className="p-6 sm:p-8 lg:p-10 transition-all duration-300">
              {/* TAB 1: CAMPAIGNS */}
              {activeTab === "campaigns" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-secondary block mb-1">
                      TAB 1 · CAMPAIGNS
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground mb-1.5">
                      Keep Your Campaigns Organized.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-text-muted font-sans">
                      Create campaigns, share briefs and keep track of your collaboration activities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                        STEP 1
                      </span>
                      <h4 className="font-sans font-semibold text-sm text-slate-900 dark:text-white mb-1">
                        Create Briefs
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Define campaign goals, deliverables and guidelines clearly.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                        STEP 2
                      </span>
                      <h4 className="font-sans font-semibold text-sm text-slate-900 dark:text-white mb-1">
                        Review Proposals
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Receive and evaluate applications from interested creators.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                        STEP 3
                      </span>
                      <h4 className="font-sans font-semibold text-sm text-slate-900 dark:text-white mb-1">
                        Track Progress
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-text-muted">
                        Monitor content submission status and milestones in one hub.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREATOR DISCOVERY */}
              {activeTab === "discovery" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-secondary block mb-1">
                      TAB 2 · CREATOR DISCOVERY
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground mb-1.5">
                      Find Creative Talent.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-text-muted font-sans">
                      Explore creator profiles, discover different niches and connect with people who fit your brand.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-surface rounded-xl border border-slate-200/80 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block mb-1">
                          Niche &amp; Category Filters
                        </span>
                        <p className="text-xs text-slate-500">
                          Browse creators across fashion, tech, lifestyle, beauty and more.
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-surface rounded-xl border border-slate-200/80 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block mb-1">
                          Direct Profiles &amp; Portfolios
                        </span>
                        <p className="text-xs text-slate-500">
                          Inspect recent content samples and past collaboration work.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COLLABORATION */}
              {activeTab === "collaboration" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-secondary block mb-1">
                      TAB 3 · COLLABORATION
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground mb-1.5">
                      Work Better Together.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-text-muted font-sans">
                      Discuss requirements, agree on deliverables and coordinate campaign work with creators.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1 uppercase tracking-wider">
                        Clear Expectations
                      </span>
                      <p className="text-xs text-slate-600 dark:text-text-secondary">
                        Align on format requirements, timelines and delivery dates before production.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5">
                      <span className="text-xs font-bold text-secondary block mb-1 uppercase tracking-wider">
                        Review &amp; Feedback
                      </span>
                      <p className="text-xs text-slate-600 dark:text-text-secondary">
                        Coordinate revisions smoothly and approve completed content assets.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ANALYTICS */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-secondary block mb-1">
                      TAB 4 · ANALYTICS
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground mb-1.5">
                      Understand Your Campaign Activity.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-text-muted font-sans">
                      View available campaign information and performance data where supported by the platform.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary max-w-md mx-auto">
                      Track active campaign milestones, delivered creative assets and participation status across your ongoing collaborations.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: PAYMENTS */}
              {activeTab === "payments" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-secondary block mb-1">
                      TAB 5 · PAYMENTS
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground mb-1.5">
                      Keep Payment Expectations Clear.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-text-muted font-sans">
                      Understand agreed compensation and payment terms for your collaborations.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                          Agreed Collaboration Terms
                        </span>
                        <span className="text-xs text-slate-500">
                          Clear deliverables and compensation agreed upon before content release.
                        </span>
                      </div>
                      <span className="bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold tracking-wider px-3 py-1 rounded-full uppercase">
                        TRANSPARENT
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
