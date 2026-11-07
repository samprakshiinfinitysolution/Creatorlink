'use client';

import React from 'react';
import Link from 'next/link';
import ScrollReveal from '@/components/theme/ScrollReveal';

export default function AboutHorizon() {
  return (
    <section className="relative py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[900px] h-[350px] sm:h-[600px] lg:h-[900px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            MAIN HORIZON / FINAL CTA CONTAINER
        ==================================================== */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <ScrollReveal direction="up" delay={0}>
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-6 sm:mb-8 shadow-xs font-sans">
              <span className="text-secondary text-sm">✦</span>
              <span>BE PART OF CREATORLINK</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-5">
              Your Next Great Connection Starts Here.
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-sm sm:text-base lg:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl mb-8 sm:mb-10">
              Whether you&apos;re a creator ready to showcase your talent or a brand looking for fresh creative perspectives, CreatorLink is a place to start exploring new possibilities.
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-md hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Join CreatorLink</span>
                <span>→</span>
              </Link>

              <Link
                href="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-surface border border-border-theme hover:border-secondary text-foreground font-sans font-semibold text-xs tracking-wider uppercase shadow-xs transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Explore How It Works</span>
              </Link>
            </div>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm font-sans font-semibold tracking-widest uppercase text-text-secondary">
              Discover. Connect. Create. Grow.
            </p>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
