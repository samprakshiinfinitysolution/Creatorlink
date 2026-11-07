'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/theme/ScrollReveal';

export default function AboutSharedVision() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-[#181716] dark:bg-background text-white overflow-hidden border-t border-white/10">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[650px] lg:w-[900px] h-[400px] sm:h-[650px] lg:h-[900px] bg-secondary/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="md:col-span-7 flex flex-col items-start text-left">
            <ScrollReveal direction="up" delay={0}>
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wider text-secondary uppercase mb-6 shadow-xs font-sans">
                <span className="text-secondary text-sm">✦</span>
                <span>OUR VISION</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-[1.12] mb-6">
                <span>A Future Built on</span>
                <br />
                <span className="text-secondary italic">Creative Connections.</span>
              </h2>

              {/* Description */}
              <p className="font-sans text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mb-6">
                We envision a creator economy where discovering opportunities and building professional relationships feels more accessible. A space where brands value creativity and creators have more ways to showcase their work and connect with businesses.
              </p>

              {/* Supporting Statement Pill */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-xl mb-4">
                <p className="text-xs sm:text-sm font-sans font-medium text-pink-200 italic">
                  &ldquo;We want every good idea to have the opportunity to find the right creative partner.&rdquo;
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT VISUAL COLUMN */}
          <div className="md:col-span-5 w-full">
            <ScrollReveal direction="scale" delay={100}>
              <div className="relative rounded-[32px] overflow-hidden aspect-[4/5] border border-white/15 shadow-2xl bg-white/5">
                <Image
                  src="https://res.cloudinary.com/atr5osne/image/upload/v1792054717/creatorlink/public/editorial/ir7hxl0x2guq9j4yoxto.webp"
                  alt="Our Vision for Creator Collaborations"
                  fill
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary font-sans block mb-1">
                    SHARED HORIZONS
                  </span>
                  <p className="font-serif text-base sm:text-lg font-bold text-white">
                    Connecting creativity with opportunity.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
