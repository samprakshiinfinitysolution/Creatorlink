"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function PricingGrowthCTA() {
  const avatars = [
    {
      id: 1,
      name: "Aarohi Mehta",
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 2,
      name: "Marcus Chen",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 3,
      name: "Camille Dupont",
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 4,
      name: "Sora Lin",
      src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background text-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[700px] rounded-full bg-secondary/[0.04] dark:bg-secondary/[0.02] blur-[180px]" />

      <div className="mx-auto max-w-[1140px] relative z-10">
        
        {/* Main Growth CTA Card */}
        <div className="bg-surface-muted dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-16 shadow-sm text-center relative overflow-hidden transition-all duration-300">
          
          {/* Eyebrow Pill */}
          <div className="inline-block bg-white/80 dark:bg-secondary/20 text-secondary dark:text-pink-200 border border-pink-200/60 dark:border-pink-500/20 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full px-4 py-1 mb-5 sm:mb-6 shadow-2xs">
            READY TO GROW?
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-4 max-w-xl mx-auto">
            Build better creator campaigns.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed max-w-md mx-auto mb-8 sm:mb-10">
            Join thousands of modern brands scaling their social influence with Creator Hub today.
          </p>

          {/* Two Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-8 sm:mb-10">
            {/* Get Started Button */}
            <Link
              href="/signup"
              className="w-full sm:w-auto text-center bg-secondary/20 dark:bg-secondary/30 text-slate-900 dark:text-foreground font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-secondary hover:text-white dark:hover:bg-secondary dark:hover:text-white hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-2xs"
            >
              Get Started
            </Link>

            {/* Book a Demo Button */}
            <Link
              href="/signup"
              className="w-full sm:w-auto text-center bg-white dark:bg-slate-900/90 text-slate-900 dark:text-foreground font-sans font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full border border-slate-200/80 dark:border-white/20 hover:border-secondary hover:text-secondary dark:hover:text-pink-200 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-2xs"
            >
              Book a Demo
            </Link>
          </div>

          {/* Creator Avatar Stack */}
          <div className="flex items-center justify-center -space-x-2.5">
            {avatars.map((avatar) => (
              <Image key={avatar.id} src={avatar.src} alt={avatar.name} width={44} height={44} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-2xs transition-all duration-300 hover:scale-110 hover:z-20 hover:shadow-md hover:ring-2 hover:ring-secondary/50 cursor-pointer" />
            ))}
            
            {/* Final "+5K" Dark Badge Circle */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 dark:bg-slate-950 text-white font-sans text-xs font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-2xs transition-all duration-300 hover:scale-110 hover:z-20 cursor-pointer select-none">
              +5K
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
