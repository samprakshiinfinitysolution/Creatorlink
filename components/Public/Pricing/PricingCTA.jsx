"use client";

import React from "react";
import Link from "next/link";

export default function PricingCTA() {
  return (
    <section className="w-full bg-background text-foreground py-10 sm:py-14 px-4 sm:px-6 lg:px-10 transition-colors duration-300">
      <div className="mx-auto max-w-[1100px]">
        
        {/* Main CTA Card */}
        <div className="group bg-white dark:bg-surface border border-pink-200/70 dark:border-white/10 hover:border-secondary/50 rounded-2xl sm:rounded-[22px] p-5 sm:p-6 lg:px-8 lg:py-6 shadow-xs hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 text-left">
          
          {/* Left Icon + Text Group */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            
            {/* Support Headset Circle Icon */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-secondary/15 dark:bg-secondary/20 border border-pink-200/60 dark:border-pink-500/20 flex items-center justify-center flex-shrink-0 text-slate-800 dark:text-foreground">
              <svg
                className="w-5 h-5 text-slate-900 dark:text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.125 11.25a7.125 7.125 0 1 0-14.25 0v2.625A2.625 2.625 0 0 0 7.5 16.5h.375a.75.75 0 0 0 .75-.75v-3.75a.75.75 0 0 0-.75-.75H7.5A5.625 5.625 0 0 1 12 5.625a5.625 5.625 0 0 1 4.5 5.625h-.375a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75h.375a2.625 2.625 0 0 0 2.625-2.625v-2.625ZM16.5 16.5a2.625 2.625 0 0 1-2.625 2.625h-1.875"
                />
              </svg>
            </div>

            {/* Heading & Description */}
            <div>
              <h2 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-foreground leading-tight">
                Not sure which plan fits?
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-text-secondary leading-normal mt-0.5">
                Speak with our strategists and find the exact tier for your active campaigns.
              </p>
            </div>
          </div>

          {/* Right Button */}
          <div className="w-full sm:w-auto flex-shrink-0">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto bg-slate-900 dark:bg-slate-900 hover:bg-secondary text-white font-sans text-xs sm:text-sm font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group/btn whitespace-nowrap"
            >
              <span>Book a Demo</span>
              <span className="text-base group-hover/btn:translate-x-1 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
