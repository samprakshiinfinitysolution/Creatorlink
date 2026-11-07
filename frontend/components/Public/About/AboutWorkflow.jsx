'use client';

import React from 'react';
import ScrollReveal from '@/components/theme/ScrollReveal';

const WORKFLOW_STEPS = [
  {
    step: '01',
    stage: 'DISCOVER',
    title: 'Find the Right People.',
    description:
      'Explore creator profiles and discover brands or creative professionals that match your interests and goals.',
  },
  {
    step: '02',
    stage: 'CONNECT',
    title: 'Start a Conversation.',
    description:
      'Connect with potential partners, share campaign ideas and understand what each side is looking for.',
  },
  {
    step: '03',
    stage: 'PLAN',
    title: 'Align on the Details.',
    description:
      'Discuss deliverables, timelines, compensation and campaign expectations before starting the work.',
  },
  {
    step: '04',
    stage: 'CREATE',
    title: 'Bring Ideas to Life.',
    description:
      'Work together to create content that reflects the creator\'s style and the brand\'s campaign direction.',
  },
  {
    step: '05',
    stage: 'GROW',
    title: 'Build Lasting Connections.',
    description:
      'Complete collaborations, gain experience and explore opportunities to work together again.',
  },
];

export default function AboutWorkflow() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. HEADER CONTENT
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="max-w-3xl mb-12 sm:mb-16 text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-4 shadow-xs font-sans">
              <span className="text-secondary text-sm">✦</span>
              <span>THE CREATORLINK EXPERIENCE</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-5">
              From First Discovery to Meaningful Collaboration.
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg font-sans text-text-secondary leading-relaxed max-w-2xl">
              CreatorLink brings the important stages of a creator-brand collaboration together in a simple journey. Discover the right people, connect, align on expectations and create together.
            </p>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. FIVE WORKFLOW CARDS
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
          {WORKFLOW_STEPS.map((step, idx) => (
            <ScrollReveal
              key={step.step}
              direction="up"
              delay={idx * 50}
              className="h-full"
            >
              <div className="group h-full bg-surface border border-border-theme hover:border-secondary/60 rounded-[26px] p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
                <div>
                  {/* Step Number & Stage Tag */}
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-border-theme">
                    <span className="font-mono text-xl font-bold text-secondary">
                      {step.step}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold font-sans tracking-wider uppercase">
                      {step.stage}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-serif font-bold text-foreground mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
