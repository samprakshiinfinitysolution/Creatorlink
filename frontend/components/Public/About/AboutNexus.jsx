'use client';

import React from 'react';
import Image from 'next/image';

export default function AboutNexus() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Local Component Keyframes for Subtle Continuous Node Floating */}
      <style>{`
        @keyframes nexusFloat1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3.5px); }
        }
        @keyframes nexusFloat2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2.5px); }
        }
        @keyframes nexusFloat3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] lg:w-[700px] h-[320px] sm:h-[500px] lg:h-[700px] bg-secondary/10 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">

        {/* ====================================================
            1. SECTION HEADER CONTENT
        ==================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-5 sm:gap-6">
          <div className="max-w-2xl">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-[10px] sm:text-xs font-mono font-bold tracking-wider text-secondary uppercase mb-3 sm:mb-6 shadow-sm">
              <span className="text-secondary text-xs sm:text-sm">✢</span>
              <span>THE GUILD ARCHITECTURE</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
              An interconnected board of creative exchange.
            </h2>
          </div>

          {/* Supporting Text */}
          <p className="text-sm sm:text-lg font-sans text-text-secondary leading-relaxed max-w-md">
            Every interaction is pinned, authenticated, and secured in an open ecosystem engineered for high-trust partnerships.
          </p>
        </div>

        {/* ====================================================
            2. MAIN ARCHITECTURE CANVAS
        ==================================================== */}
        <div className="relative p-3.5 sm:p-8 lg:p-16 rounded-[20px] sm:rounded-[32px] lg:rounded-[40px] bg-surface border border-border-theme shadow-xl min-h-0 lg:min-h-[640px] flex flex-col lg:block items-center justify-center overflow-hidden">
          
          {/* Concentric Background Dashed Rings (Desktop/Tablet) */}
          <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-dashed border-secondary/20 pointer-events-none" />
          <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-dashed border-secondary/25 pointer-events-none" />

          {/* Connecting SVG Overlay Lines (Desktop) */}
          <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0 stroke-secondary/25" strokeWidth="1" strokeDasharray="4 4">
            {/* Top Left -> Center */}
            <line x1="22%" y1="20%" x2="50%" y2="50%" />
            {/* Top Right -> Center */}
            <line x1="78%" y1="20%" x2="50%" y2="50%" />
            {/* Mid Left -> Center */}
            <line x1="18%" y1="50%" x2="50%" y2="50%" />
            {/* Mid Right -> Center */}
            <line x1="82%" y1="50%" x2="50%" y2="50%" />
            {/* Bottom Left -> Center */}
            <line x1="24%" y1="80%" x2="50%" y2="50%" />
            {/* Bottom Right -> Center */}
            <line x1="76%" y1="80%" x2="50%" y2="50%" />
          </svg>

          {/* --------------------------------------------------
              NEXUS CONTAINER FOR MOBILE & DESKTOP
              Desktop: Floating absolute positions via lg:contents
              Mobile: Clean vertical mobile architecture stack
          -------------------------------------------------- */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md mx-auto lg:contents">

            {/* 1. TOP LEFT: CREATORS */}
            <div className="w-full lg:w-auto relative lg:absolute lg:top-14 lg:left-14 z-20 transition-all duration-500 ease-out -rotate-[0.5deg] lg:-rotate-[2deg] hover:rotate-0 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-secondary hover:shadow-xl group">
              <div
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-surface border border-border-theme shadow-md backdrop-blur-sm group-hover:border-secondary transition-colors w-full"
                style={{ animation: 'nexusFloat1 5.2s ease-in-out 0s infinite' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Creators"
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-secondary/30 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans text-[11px] sm:text-xs font-bold text-foreground tracking-wider uppercase group-hover:text-secondary transition-colors truncate">
                    CREATORS
                  </h4>
                  <p className="font-sans text-[9px] sm:text-[10px] text-text-secondary truncate">
                    Independent Talent Guild
                  </p>
                </div>
              </div>
            </div>

            {/* 2. TOP RIGHT: BRANDS */}
            <div className="w-full lg:w-auto relative lg:absolute lg:top-14 lg:right-14 z-20 transition-all duration-500 ease-out rotate-[0.5deg] lg:rotate-[2deg] hover:rotate-0 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-secondary hover:shadow-xl group">
              <div
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-surface border border-border-theme shadow-md backdrop-blur-sm group-hover:border-secondary transition-colors w-full"
                style={{ animation: 'nexusFloat2 5.8s ease-in-out 0.8s infinite' }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary text-xs font-bold shrink-0">
                  ✦
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans text-[11px] sm:text-xs font-bold text-foreground tracking-wider uppercase group-hover:text-secondary transition-colors truncate">
                    BRANDS
                  </h4>
                  <p className="font-sans text-[9px] sm:text-[10px] text-text-secondary truncate">
                    Visionary Houses
                  </p>
                </div>
              </div>
            </div>

            {/* 3. MIDDLE LEFT: PEER REVIEWS */}
            <div className="w-full lg:w-auto relative lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:left-10 z-20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-secondary group">
              <div
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-surface border border-border-theme shadow-md text-[10px] sm:text-xs font-mono font-bold text-foreground tracking-wider uppercase group-hover:border-secondary group-hover:text-secondary transition-colors w-full"
                style={{ animation: 'nexusFloat3 4.8s ease-in-out 1.5s infinite' }}
              >
                <span className="text-secondary text-xs">★</span>
                <span>PEER REVIEWS</span>
              </div>
            </div>

            {/* --------------------------------------------------
                CENTER CREATOR HUB
                Positioned in center of vertical stack on mobile,
                and absolute center on desktop.
            -------------------------------------------------- */}
            <div className="relative z-20 my-2 sm:my-4 lg:my-0 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
              {/* Ambient Pulse Glow */}
              <div className="absolute inset-0 rounded-full bg-secondary/15 blur-xl animate-pulse pointer-events-none" />

              {/* Central Circle */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-52 lg:h-52 rounded-full bg-surface border-2 border-secondary/40 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center text-center p-3 sm:p-4 group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:border-secondary hover:shadow-secondary/25">
                <span className="text-secondary text-xs sm:text-sm lg:text-base mb-0.5 sm:mb-1">📌</span>
                <h3 className="font-serif text-xs sm:text-base lg:text-lg font-bold tracking-wider text-foreground leading-tight uppercase">
                  CREATOR HUB
                </h3>
                <span className="font-mono text-[7.5px] sm:text-[9px] font-bold text-text-secondary tracking-widest uppercase mt-0.5">
                  THE CENTRAL NEXUS
                </span>
                <span className="font-serif italic text-[7.5px] sm:text-[9px] text-secondary mt-0.5 sm:mt-1">
                  pins · contracts · escrow
                </span>
              </div>
            </div>

            {/* 4. MIDDLE RIGHT: SHARED BOARDS */}
            <div className="w-full lg:w-auto relative lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-10 z-20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-secondary group">
              <div
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-surface border border-border-theme shadow-md text-[10px] sm:text-xs font-mono font-bold text-foreground tracking-wider uppercase group-hover:border-secondary group-hover:text-secondary transition-colors w-full"
                style={{ animation: 'nexusFloat1 5.5s ease-in-out 2.1s infinite' }}
              >
                <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                <span>SHARED BOARDS</span>
              </div>
            </div>

            {/* 5. BOTTOM LEFT: CURATED ASSETS */}
            <div className="w-full lg:w-auto relative lg:absolute lg:bottom-14 lg:left-16 z-20 transition-all duration-500 ease-out -rotate-[0.5deg] lg:-rotate-[1.5deg] hover:rotate-0 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-secondary hover:shadow-xl group">
              <div
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-surface border border-border-theme shadow-md backdrop-blur-sm group-hover:border-secondary transition-colors w-full"
                style={{ animation: 'nexusFloat2 6.0s ease-in-out 1.1s infinite' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&q=80"
                  alt="Curated Assets"
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-secondary/30 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans text-[11px] sm:text-xs font-bold text-foreground tracking-wider uppercase group-hover:text-secondary transition-colors truncate">
                    CURATED ASSETS
                  </h4>
                  <p className="font-sans text-[9px] sm:text-[10px] text-text-secondary truncate">
                    Original Master Files
                  </p>
                </div>
              </div>
            </div>

            {/* 6. BOTTOM RIGHT: ESCROW MILESTONES */}
            <div className="w-full lg:w-auto relative lg:absolute lg:bottom-14 lg:right-16 z-20 transition-all duration-500 ease-out rotate-[0.5deg] lg:rotate-[1.5deg] hover:rotate-0 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-secondary hover:shadow-xl group">
              <div
                className="flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-surface border border-border-theme shadow-md backdrop-blur-sm group-hover:border-secondary transition-colors w-full"
                style={{ animation: 'nexusFloat3 5.0s ease-in-out 0.4s infinite' }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary text-xs shrink-0">
                  🔒
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans text-[11px] sm:text-xs font-bold text-foreground tracking-wider uppercase group-hover:text-secondary transition-colors truncate">
                    ESCROW MILESTONES
                  </h4>
                  <p className="font-sans text-[9px] sm:text-[10px] text-text-secondary truncate">
                    Secure Automated Payout
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

