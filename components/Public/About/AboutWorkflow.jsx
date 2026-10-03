'use client';

import React from 'react';

const WORKFLOW_STEPS = [
  {
    step: '01',
    stage: 'STAGE ONE',
    title: 'DISCOVER',
    description:
      'Browse vetted lookbooks curated by visual signatures, authentic metrics, and creative tone.',
    badgeType: 'default',
    floatDelay: '0s',
    floatDuration: '5.2s',
    animationName: 'workflowFloat1',
  },
  {
    step: '02',
    stage: 'STAGE TWO',
    title: 'CONNECT',
    description:
      'Initiate direct dialogue. No opaque agents, no hidden markups, pure alignment from day one.',
    badgeType: 'default',
    floatDelay: '0.7s',
    floatDuration: '5.8s',
    animationName: 'workflowFloat2',
  },
  {
    step: '03',
    stage: 'STAGE THREE',
    title: 'COLLABORATE',
    description:
      'Co-create living campaign boards with clear scopes, timelines, and rights management.',
    badgeType: 'default',
    floatDelay: '1.4s',
    floatDuration: '4.9s',
    animationName: 'workflowFloat3',
  },
  {
    step: '04',
    stage: 'STAGE FOUR',
    title: 'CREATE',
    description:
      'High-fidelity production executed with complete creator perspective and brand reverence.',
    badgeType: 'pink',
    floatDelay: '0.4s',
    floatDuration: '5.5s',
    animationName: 'workflowFloat4',
  },
  {
    step: '05',
    stage: 'STAGE FIVE',
    title: 'GROW',
    description:
      'Transform memorable campaigns into multi-season ambassador agreements and guild equity.',
    badgeType: 'dark',
    floatDelay: '1.1s',
    floatDuration: '6.1s',
    animationName: 'workflowFloat5',
  },
];

export default function AboutWorkflow() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Local Component Keyframes for Staggered Continuous Card Floating */}
      <style>{`
        @keyframes workflowFloat1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes workflowFloat2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes workflowFloat3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes workflowFloat4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3.5px); }
        }
        @keyframes workflowFloat5 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4.5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .workflow-float-card {
            animation: none !important;
          }
        }
      `}</style>

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[900px] h-[350px] sm:h-[600px] lg:h-[900px] bg-secondary/10 blur-[120px] sm:blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER CONTENT
        ==================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-14 lg:mb-20 gap-6">
          <div className="max-w-2xl">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-[10px] sm:text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-4 sm:mb-6 shadow-sm">
              <span className="text-secondary text-xs sm:text-sm">📈</span>
              <span>PINNED WORKFLOW</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
              From initial pin to cultural reality.
            </h2>
          </div>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base lg:text-lg font-sans text-text-secondary leading-relaxed max-w-md">
            A frictionless 5-step continuum designed to respect creator voice while ensuring brand clarity.
          </p>
        </div>

        {/* ====================================================
            2. FIVE WORKFLOW CARDS GRID
            Desktop: 5 columns horizontal row
            Tablet: 2 columns balanced layout
            Mobile: 1 column clean stacked layout
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-4 max-w-sm md:max-w-none mx-auto">
          {WORKFLOW_STEPS.map((card) => {
            return (
              <div
                key={card.step}
                className="group relative flex flex-col items-start p-6 sm:p-7 rounded-[22px] sm:rounded-[26px] bg-surface border border-border-theme shadow-md hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-secondary cursor-pointer min-h-[300px] sm:min-h-[320px] justify-between"
              >
                {/* Floating inner container wrapper for continuous non-hover motion */}
                <div
                  className="workflow-float-card flex flex-col items-start w-full h-full justify-between"
                  style={{
                    animation: `${card.animationName} ${card.floatDuration} ease-in-out ${card.floatDelay} infinite`,
                  }}
                >
                  {/* TOP DECORATION & BADGE */}
                  <div className="w-full flex flex-col items-start mb-6">
                    {/* Pink Striped Washi Tape Element */}
                    <div
                      className="w-10 h-2.5 rounded-sm bg-secondary/25 border border-secondary/30 mb-5 opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(135deg, rgba(236,72,153,0.4) 0px, rgba(236,72,153,0.4) 3px, transparent 3px, transparent 7px)',
                      }}
                      aria-hidden="true"
                    />

                    {/* Circular Number Badge */}
                    {card.badgeType === 'pink' ? (
                      /* Card 04 - Strong Pink Badge */
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary text-primary-foreground font-serif font-bold text-xs sm:text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        {card.step}
                      </div>
                    ) : card.badgeType === 'dark' ? (
                      /* Card 05 - Dark/Black Badge */
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-foreground text-background font-serif font-bold text-xs sm:text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        {card.step}
                      </div>
                    ) : (
                      /* Cards 01-03 - Standard Light Surface Badge */
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border-theme bg-surface text-foreground font-serif font-bold text-xs sm:text-sm flex items-center justify-center shadow-sm group-hover:border-secondary group-hover:text-secondary group-hover:scale-105 transition-all">
                        {card.step}
                      </div>
                    )}
                  </div>

                  {/* BOTTOM CONTENT: STAGE, TITLE, DESCRIPTION */}
                  <div className="w-full flex flex-col items-start">
                    {/* Stage Label */}
                    <span className="font-mono text-[10px] sm:text-[11px] font-bold text-secondary tracking-widest uppercase mb-1">
                      {card.stage}
                    </span>

                    {/* Stage Title */}
                    <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-secondary transition-colors mb-2 sm:mb-3">
                      {card.title}
                    </h3>

                    {/* Description Paragraph */}
                    <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {card.description}
                    </p>
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
