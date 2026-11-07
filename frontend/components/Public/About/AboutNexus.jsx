'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/theme/ScrollReveal';

export default function AboutNexus() {
  const ecosystemCards = [
    {
      id: 'creators',
      category: 'CREATORS',
      subtitle: 'Creative Talent',
      title: 'FOR CREATORS',
      description:
        'Showcase your talent, highlight your content style and explore opportunities to collaborate with brands that match your interests.',
      image:
        'https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp',
      badge: 'Talent Showcase',
    },
    {
      id: 'brands',
      category: 'BRANDS',
      subtitle: 'Campaign Opportunities',
      title: 'FOR BRANDS',
      description:
        'Discover creative talent, share campaign ideas and connect with creators who can help bring your brand story to life.',
      image:
        'https://res.cloudinary.com/atr5osne/image/upload/v1792054740/creatorlink/public/editorial/hwajtuk9gwkhujb9glj8.webp',
      badge: 'Brand Vision',
    },
    {
      id: 'collaborations',
      category: 'COLLABORATIONS',
      subtitle: 'Working Together',
      title: 'FOR COLLABORATIONS',
      description:
        'Bring both sides together to discuss requirements, align expectations and work towards meaningful campaign outcomes.',
      image:
        'https://res.cloudinary.com/atr5osne/image/upload/v1792054714/creatorlink/public/editorial/se3wpecdot8jphnowzci.webp',
      badge: 'Direct Alignment',
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-background text-foreground overflow-hidden border-t border-border-theme">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] lg:w-[700px] h-[320px] sm:h-[500px] lg:h-[700px] bg-secondary/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ====================================================
            1. SECTION HEADER CONTENT
        ==================================================== */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6 text-left">
            <div className="max-w-2xl">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-bold tracking-wider text-secondary uppercase mb-4 shadow-xs font-sans">
                <span className="text-secondary text-sm">✦</span>
                <span>THE CREATORLINK ECOSYSTEM</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
                A Place Where Creative Talent Meets Brand Vision.
              </h2>
            </div>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base font-sans text-text-secondary leading-relaxed max-w-md">
              Great collaborations happen when the right people come together. CreatorLink brings brands and creators into one connected space where they can discover each other, share ideas and explore opportunities to work together.
            </p>
          </div>
        </ScrollReveal>

        {/* ====================================================
            2. THREE CLEAR ECOSYSTEM CARDS
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {ecosystemCards.map((card, idx) => (
            <ScrollReveal
              key={card.id}
              direction="up"
              delay={idx * 60}
              className="h-full"
            >
              <div className="group h-full bg-surface border border-border-theme hover:border-secondary/60 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
                <div>
                  {/* Top Meta Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-theme">
                    <div>
                      <span className="text-xs font-extrabold tracking-wider uppercase text-secondary font-sans block">
                        {card.category}
                      </span>
                      <span className="text-[11px] text-text-secondary font-sans">
                        {card.subtitle}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-[10px] font-sans font-bold uppercase">
                      {card.badge}
                    </span>
                  </div>

                  {/* Image Frame */}
                  <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden mb-5 bg-surface-muted">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-2">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    {card.description}
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
