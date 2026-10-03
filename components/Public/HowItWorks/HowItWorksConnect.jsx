"use client";

import React from "react";

export default function HowItWorksConnect() {
  return (
    <section className="relative overflow-hidden bg-[#FAF4F5] dark:bg-background/95 text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* Ambient soft glow lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.035] dark:bg-secondary/[0.015] blur-[170px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & FEATURE PILL
          ------------------------------------------------------- */}
          <div className="lg:col-span-5 text-left">
            
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              03 · CONNECT
            </span>

            {/* Editorial Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Start a conversation <br className="hidden sm:inline" />
              before the <br className="hidden sm:inline" />
              collaboration.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-8 max-w-md">
              Pitch seamlessly inside dedicated editorial message threads. Exchange conceptual moodboards, refine expectations, and confirm tone before any contracts are committed.
            </p>

            {/* Feature Status Pill */}
            <div className="bg-white/95 dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-xs inline-flex items-center gap-2.5 max-w-full hover:-translate-y-0.5 transition-transform duration-300">
              <div className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 text-xs">
                <svg className="w-3.5 h-3.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="font-sans text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                Direct in-platform brand-to-creator messaging
              </span>
            </div>

          </div>


          {/* -------------------------------------------------------
              RIGHT COLUMN: CONVERSATION WORKSPACE CARD
          ------------------------------------------------------- */}
          <div className="lg:col-span-7">
            
            {/* Main Conversation Workspace Card */}
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[5px] hover:scale-[1.01] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out cursor-default text-left">
              
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
                
                {/* Brand & Creator Avatar + Channel Name */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans font-bold text-xs flex items-center justify-center border border-slate-200/80 dark:border-white/10 shadow-2xs flex-shrink-0">
                    GB
                  </div>
                  
                  <div>
                    <h3 className="font-sans font-bold text-sm sm:text-base tracking-wide text-slate-900 dark:text-foreground mb-0.5 leading-tight">
                      GLOW BEAUTY <span className="text-secondary font-normal mx-0.5">↔</span> AAROHI MEHTA
                    </h3>
                    <span className="text-xs font-sans text-slate-500 dark:text-text-muted block font-medium">
                      Campaign Negotiation Channel
                    </span>
                  </div>
                </div>

                {/* Status Pill Top-Right */}
                <div className="self-start sm:self-auto">
                  <span className="bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 border border-pink-200/60 dark:border-pink-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full font-sans inline-block shadow-2xs">
                    COLLABORATION REQUESTED
                  </span>
                </div>

              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-white/10 mb-6" />

              {/* Messages Container */}
              <div className="space-y-4 mb-6">
                
                {/* First Message (Brand - Left Aligned) */}
                <div className="flex items-start gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-slate-200/70 dark:border-white/10 mt-1 shadow-2xs">
                    GB
                  </div>
                  
                  <div className="bg-[#FFF5F7] dark:bg-secondary/[0.08] border border-pink-100/90 dark:border-pink-500/20 rounded-2xl rounded-tl-xs p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed max-w-[90%] sm:max-w-[82%] hover:-translate-y-[2px] hover:shadow-xs transition-all duration-300 ease-out">
                    We'd love to work with you on our new beauty launch. Your lighting style in your recent botanical film is exactly what we have in mind for our serum reveal.
                  </div>
                </div>

                {/* Second Message (Creator - Right Aligned) */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#FDF2F5] dark:bg-secondary/[0.12] border border-pink-100/90 dark:border-pink-500/25 rounded-2xl rounded-tr-xs p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed max-w-[90%] sm:max-w-[82%] hover:-translate-y-[2px] hover:shadow-xs transition-all duration-300 ease-out text-left">
                    I love the brief! I have an idea for the opening macro shot already ✨ Let's do a golden hour reflection through the bottle glass.
                  </div>

                  <div className="w-8 h-8 rounded-full bg-[#FCE7F3] dark:bg-secondary/30 text-secondary dark:text-pink-100 font-sans font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-pink-200/60 dark:border-pink-500/20 mt-1 shadow-2xs">
                    AM
                  </div>
                </div>

              </div>

              {/* Bottom Status Bar Divider */}
              <div className="border-t border-slate-100 dark:border-white/10 pt-4" />

              {/* Bottom Status Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-sans">
                <span className="font-medium text-slate-500 dark:text-text-muted">
                  Status: <strong className="font-semibold text-slate-700 dark:text-slate-300">Proposal Reviewed</strong>
                </span>
                <span className="font-bold text-slate-900 dark:text-foreground">
                  1-Click Agreement Ready
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
