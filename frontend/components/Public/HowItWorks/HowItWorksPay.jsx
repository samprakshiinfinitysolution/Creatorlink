"use client";

import React from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function HowItWorksPay() {
  const supportingPoints = [
    "Discuss compensation in advance.",
    "Agree on payment terms.",
    "Keep deliverables and expectations clear.",
    "Complete payment as agreed.",
  ];

  const paymentSteps = [
    {
      id: 1,
      title: "AGREE",
      subtitle: "Clear Terms",
      icon: (
        <svg className="w-4 h-4 text-secondary mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "CREATE",
      subtitle: "Deliverables Done",
      icon: (
        <svg className="w-4 h-4 text-secondary mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "REVIEW",
      subtitle: "Approval Check",
      icon: (
        <svg className="w-4 h-4 text-secondary mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 4,
      title: "COMPLETE",
      subtitle: "Payment Handled",
      isHighlight: true,
      icon: (
        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      {/* Ambient soft glow background lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[160px]" />

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* -------------------------------------------------------
              LEFT COLUMN: EYEBROW, HEADING, DESCRIPTION & POINTS
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={0} className="lg:col-span-5 text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary block mb-4 font-sans">
              08 · PAYMENT
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-5">
              Clear Expectations. Transparent Payments.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-6 max-w-md">
              The creator and brand should have a clear understanding of the agreed compensation and payment terms before the collaboration begins. Once the agreed work is completed, payment should be handled according to those terms.
            </p>

            <ul className="space-y-2.5 mb-8 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
              {supportingPoints.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* -------------------------------------------------------
              RIGHT COLUMN: TRANSPARENT PAYMENT WORKFLOW CARD
          ------------------------------------------------------- */}
          <ScrollReveal direction="left" delay={120} className="lg:col-span-7">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 shadow-sm hover:-translate-y-[4px] hover:scale-[1.005] hover:border-secondary/40 hover:shadow-[0_16px_36px_-8px_rgba(255,79,135,0.18)] transition-all duration-300 ease-out text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-slate-900 dark:text-foreground mb-1 leading-snug">
                    Respect the Work. Value the Creativity.
                  </h3>
                  <p className="font-sans text-xs text-slate-500 dark:text-text-muted">
                    Clear payment expectations help build stronger and more trustworthy working relationships.
                  </p>
                </div>
                <div className="self-start sm:self-auto">
                  <span className="bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans inline-block shadow-2xs">
                    TRANSPARENT TERMS
                  </span>
                </div>
              </div>

              {/* 4 Steps Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
                {paymentSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`rounded-2xl p-3.5 sm:p-4 text-center transition-all duration-300 ${
                      step.isHighlight
                        ? "bg-[#EAF5EC] dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30"
                        : "bg-[#FAF4F5]/80 dark:bg-secondary/[0.06] border border-pink-100/80 dark:border-pink-500/15"
                    }`}
                  >
                    {step.icon}
                    <span className={`text-xs font-bold font-sans block mb-0.5 ${step.isHighlight ? "text-emerald-800 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}>
                      {step.title}
                    </span>
                    <span className={`text-[11px] font-sans font-medium block ${step.isHighlight ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-text-muted"}`}>
                      {step.subtitle}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary Guidelines Box */}
              <div className="bg-[#FAF4F5]/60 dark:bg-secondary/[0.04] border border-pink-100/70 dark:border-pink-500/15 rounded-2xl p-4.5 sm:p-5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-sans mb-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Transparent Collaboration Standard
                  </span>
                  <span className="text-secondary font-bold text-xs uppercase tracking-wider">
                    Aligned
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-600 dark:text-text-secondary leading-relaxed">
                  Both parties confirm milestones and payment terms prior to content production, ensuring confidence and smooth execution throughout the campaign.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
