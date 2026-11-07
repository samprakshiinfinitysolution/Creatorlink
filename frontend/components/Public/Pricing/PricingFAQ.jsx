"use client";

import React, { useState } from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

export default function PricingFAQ() {
  const [activeFaq, setActiveFaq] = useState(0);

  const faqData = [
    {
      id: 1,
      question: "Is there a free trial for brands?",
      answer:
        "Yes. Eligible brand plans include a 5-day free trial according to the plan and trial eligibility configured on CreatorLink. You can explore the platform before continuing with a paid subscription.",
    },
    {
      id: 2,
      question: "Do creators have to pay to join CreatorLink?",
      answer:
        "No compulsory paid subscription is required for creators to get started. Creators can join, build their profile and explore opportunities. Optional paid plans may be available if enabled.",
    },
    {
      id: 3,
      question: "How much does a brand subscription cost?",
      answer:
        "Brand subscription prices depend on the plan you select. The latest monthly and yearly prices are displayed on this page in Indian Rupees.",
    },
    {
      id: 4,
      question: "Can I switch my subscription plan?",
      answer:
        "Plan changes depend on the subscription options and billing rules available for your account. Check your account's subscription settings for available options.",
    },
    {
      id: 5,
      question: "Are creator collaboration payments included in the subscription?",
      answer:
        "Creator compensation is separate from the platform subscription unless the selected plan explicitly states otherwise. Brands and creators should agree on collaboration compensation and payment terms.",
    },
    {
      id: 6,
      question: "Are monthly and yearly plans available?",
      answer:
        "Available billing periods depend on the plans configured by CreatorLink. Where both options are available, you can compare the monthly and yearly prices.",
    },
    {
      id: 7,
      question: "Are optional creator plans available?",
      answer:
        "CreatorLink may offer optional paid features or plans when enabled. Creators can still get started without being forced into a paid subscription.",
    },
    {
      id: 8,
      question: "Does the free trial automatically charge me?",
      answer:
        "Trial billing, payment method requirements and renewal rules depend on the configured subscription process. Clearly display the actual terms before a user starts a trial. Do not claim no-card-required or automatic charging unless verified.",
    },
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 border-b border-border-theme/60 transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-secondary/[0.03] dark:bg-secondary/[0.015] blur-[180px]" />

      <div className="mx-auto max-w-[1240px] relative z-10 text-center">
        {/* Header */}
        <ScrollReveal direction="up" delay={0}>
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 text-center">
            FREQUENTLY ASKED QUESTIONS
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 text-center max-w-2xl mx-auto">
            Everything You Need to Know About Pricing.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed text-center max-w-xl mx-auto mb-10 sm:mb-14">
            Clear answers to common questions about plans, trials, and platform access.
          </p>
        </ScrollReveal>

        {/* FAQ Accordion List */}
        <ScrollReveal direction="up" delay={80}>
          <div className="max-w-[780px] mx-auto text-left space-y-3.5 sm:space-y-4">
            {faqData.map((item, idx) => {
              const isOpen = activeFaq === idx;

              return (
                <div
                  key={item.id}
                  className={`group bg-white dark:bg-surface border rounded-2xl sm:rounded-[20px] overflow-hidden shadow-2xs transition-all duration-300 ${
                    isOpen
                      ? "border-slate-300 dark:border-white/20 shadow-xs"
                      : "border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-sans font-semibold text-sm sm:text-base text-slate-900 dark:text-foreground">
                      {item.question}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white text-xs shrink-0 transform transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-text-secondary font-sans leading-relaxed border-t border-slate-100 dark:border-white/5">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
