"use client";

import React, { useState } from "react";

export default function PricingFAQ() {
  // Item 0 (index 0) is open by default on initial page load
  const [activeFaq, setActiveFaq] = useState(0);

  const faqData = [
    {
      id: 1,
      question: "What happens after I upgrade?",
      answer:
        "Your upgraded features activate instantly. Any remaining balance on your prior subscription will be prorated automatically towards your new tier without service interruption.",
    },
    {
      id: 2,
      question: "Can I change my plan later?",
      answer:
        "Yes, you can upgrade, downgrade, or switch between monthly and annual plans at any time directly from your billing workspace.",
    },
    {
      id: 3,
      question: "Can I cancel anytime?",
      answer:
        "Absolutely. There are no lock-in periods on monthly plans. If you cancel, your account remains fully active until the end of your current billing period.",
    },
    {
      id: 4,
      question: "Do plans include creator payments?",
      answer:
        "Platform membership covers discovery, CRM, and analytics software. Creator compensation is paid directly by your brand through our escrow system with 0% platform take fees on Pro and Premium tiers.",
    },
    {
      id: 5,
      question: "Can agencies manage multiple brands?",
      answer:
        "Yes! Our Enterprise and Agency tiers include dedicated workspace partitions, client approval portals, and independent billing profiles for multiple brand clients.",
    },
    {
      id: 6,
      question: "Is there a free trial?",
      answer:
        "We provide a 14-day full access trial for both Pro and Enterprise solutions. No credit card is required to begin exploring the platform.",
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
        
        {/* =========================================================
            1. SECTION HEADER
        ========================================================= */}
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3 text-center">
          FREQUENTLY ASKED QUESTIONS
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 text-center max-w-2xl mx-auto">
          Questions before you choose?
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed text-center max-w-xl mx-auto mb-10 sm:mb-14">
          Everything you need to know about plans, billing, and platform logistics.
        </p>

        {/* =========================================================
            2. FAQ ACCORDION LIST
        ========================================================= */}
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
                {/* Question Header Button */}
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-sans font-semibold text-sm sm:text-base text-slate-900 dark:text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 rounded-2xl"
                >
                  <span className="leading-snug pr-2">{item.question}</span>

                  {/* Arrow Indicator */}
                  <span className="flex-shrink-0 text-slate-400 dark:text-text-muted group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-300 ease-out ${
                        isOpen ? "rotate-180 text-slate-800 dark:text-white" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                {/* Answer Content Panel */}
                <div
                  id={`faq-answer-${idx}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm font-sans text-slate-500 dark:text-text-secondary leading-relaxed border-t border-slate-100/80 dark:border-white/5 mt-1 pt-4">
                      {item.answer}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
