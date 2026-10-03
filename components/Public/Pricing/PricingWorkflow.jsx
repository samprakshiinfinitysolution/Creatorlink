"use client";

import React, { useState } from "react";
import Image from "next/image";

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
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 text-center">
          ALL-IN-ONE WORKFLOW
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 text-center max-w-2xl mx-auto">
          Everything you need to run creator marketing.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed text-center max-w-xl mx-auto mb-8 sm:mb-10">
          From creator discovery to campaign management, keep your workflow streamlined in one collaborative space.
        </p>

        {/* =========================================================
            2. INTERACTIVE TABS ROW
        ========================================================= */}
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

        {/* =========================================================
            3. DASHBOARD / BROWSER MOCKUP CONTAINER
        ========================================================= */}
        <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl max-w-[1020px] mx-auto text-left transition-all duration-300">
          
          {/* Browser Header Bar */}
          <div className="bg-slate-100/90 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            
            {/* 3 Color Window Dots */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
            </div>

            {/* Address Bar */}
            <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-white/10 rounded-full px-4 sm:px-6 py-1 text-[11px] sm:text-xs font-mono text-slate-500 dark:text-text-muted tracking-tight text-center shadow-2xs truncate max-w-[280px] sm:max-w-md">
              app.creatorhub.com/campaigns/summer-beauty
            </div>

            {/* Lock Icon */}
            <div className="text-slate-400 dark:text-text-muted flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          {/* Browser Content Inner Body */}
          <div className="p-5 sm:p-8 lg:p-10 transition-all duration-300">
            
            {/* ---------------------------------------------------
                STATE 01: CAMPAIGNS
            --------------------------------------------------- */}
            {activeTab === "campaigns" && (
              <div className="animate-fadeIn transition-opacity duration-300 space-y-6 sm:space-y-8">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 dark:text-foreground">
                        Summer Beauty Launch
                      </h3>
                      <span className="bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
                        ● ACTIVE
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans">
                      Multi-tier creator seeding and TikTok viral push.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-sans text-slate-500 dark:text-text-muted hidden sm:inline">
                      Timeline: Jul 15 – Aug 28
                    </span>
                    <button
                      type="button"
                      className="bg-slate-900 dark:bg-slate-900 hover:bg-secondary text-white font-sans text-xs font-semibold px-4 py-2 rounded-full transition-colors duration-300 cursor-pointer"
                    >
                      Manage Brief
                    </button>
                  </div>
                </div>

                {/* 4 Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 sm:p-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-text-muted block mb-1">
                      BUDGET ALLOCATED
                    </span>
                    <span className="font-serif text-2xl font-semibold text-slate-900 dark:text-foreground block mb-0.5">
                      $50,000
                    </span>
                    <span className="text-xs text-slate-500 dark:text-text-muted">
                      84% deployed
                    </span>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 sm:p-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-text-muted block mb-1">
                      APPROVED CREATORS
                    </span>
                    <span className="font-serif text-2xl font-semibold text-slate-900 dark:text-foreground block mb-0.5">
                      12 Creators
                    </span>
                    <span className="text-xs text-slate-500 dark:text-text-muted">
                      Across 4 countries
                    </span>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 sm:p-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-text-muted block mb-1">
                      APPLICATIONS
                    </span>
                    <span className="font-serif text-2xl font-semibold text-secondary block mb-0.5">
                      38 Pending
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      +14 new today
                    </span>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 sm:p-5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-text-muted block mb-1">
                      CONTENT DELIVERED
                    </span>
                    <span className="font-serif text-2xl font-semibold text-slate-900 dark:text-foreground block mb-0.5">
                      24 Assets
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      100% on schedule
                    </span>
                  </div>
                </div>

                {/* Featured Collaborators */}
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted block mb-3 font-sans">
                    FEATURED COLLABORATORS
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Aarohi Mehta" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <span className="font-sans font-semibold text-xs text-slate-900 dark:text-foreground block">
                          Aarohi Mehta
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-text-muted block">
                          Beauty • 124K Followers
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <Image src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" alt="Camille Dupont" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <span className="font-sans font-semibold text-xs text-slate-900 dark:text-foreground block">
                          Camille Dupont
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-text-muted block">
                          Fashion & Skincare • 88K
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                      <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80" alt="Sora Lin" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <span className="font-sans font-semibold text-xs text-slate-900 dark:text-foreground block">
                          Sora Lin
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-text-muted block">
                          Editorial Aesthetic • 210K
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ---------------------------------------------------
                STATE 02: CREATOR DISCOVERY
            --------------------------------------------------- */}
            {activeTab === "discovery" && (
              <div className="animate-fadeIn transition-opacity duration-300 space-y-6">
                <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h3 className="font-serif text-2xl font-medium text-slate-900 dark:text-foreground mb-2">
                    AI Creator Matching Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans mb-6">
                    Scanning 4.2M vetted creator accounts for affinity with &ldquo;Minimalist Skincare&rdquo;.
                  </p>

                  <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <span className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-foreground">
                      98 Creators Match Current Aesthetic Profile
                    </span>
                    <span className="bg-secondary/20 dark:bg-secondary/30 text-secondary dark:text-pink-200 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full self-start sm:self-auto">
                      HIGH FIT
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------
                STATE 03: COLLABORATION
            --------------------------------------------------- */}
            {activeTab === "collaboration" && (
              <div className="animate-fadeIn transition-opacity duration-300 space-y-6">
                <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h3 className="font-serif text-2xl font-medium text-slate-900 dark:text-foreground mb-2">
                    Content Approval & In-App Review
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans mb-6">
                    Collaborative frame-by-frame commenting on pending creator video submissions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-xl p-5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5 font-sans">
                        APPROVED (18)
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans">
                        Ready for publishing to Instagram Reels.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-xl p-5">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-1.5 font-sans">
                        CHANGES REQUESTED (3)
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans">
                        Captions need updated promo discount code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------
                STATE 04: ANALYTICS
            --------------------------------------------------- */}
            {activeTab === "analytics" && (
              <div className="animate-fadeIn transition-opacity duration-300 space-y-6">
                <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h3 className="font-serif text-2xl font-medium text-slate-900 dark:text-foreground mb-2">
                    Real-Time Revenue Attribution
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans mb-6">
                    Direct Shopify & Stripe integration recording sales generated via unique creator discount links.
                  </p>

                  <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-text-muted block mb-1 font-sans">
                        ATTRIBUTED GMV
                      </span>
                      <span className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-foreground">
                        $189,450.00
                      </span>
                    </div>

                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl sm:text-2xl font-sans self-start sm:self-auto">
                      3.78x ROAS
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------
                STATE 05: PAYMENTS
            --------------------------------------------------- */}
            {activeTab === "payments" && (
              <div className="animate-fadeIn transition-opacity duration-300 space-y-6">
                <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h3 className="font-serif text-2xl font-medium text-slate-900 dark:text-foreground mb-2">
                    Automated Global Escrow
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-text-muted font-sans mb-6">
                    Pay creators in 140+ currencies with automated tax compliance, 1099 generation, and milestone escrow locks.
                  </p>

                  <div className="bg-white dark:bg-surface border border-slate-200/90 dark:border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <span className="font-sans font-semibold text-sm sm:text-base text-slate-900 dark:text-foreground">
                      Escrow Balance Secured: $42,000
                    </span>
                    <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-text-secondary text-xs font-bold tracking-widest px-3.5 py-1 rounded-full uppercase self-start sm:self-auto">
                      PROTECTED
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
