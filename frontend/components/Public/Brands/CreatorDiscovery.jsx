"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/theme/ScrollReveal";

const sampleCreators = [
  // COLUMN 1
  {
    id: "creator-1",
    label: "Fashion & Editorial",
    category: "Fashion & Lifestyle",
    services: "Reels & Photography",
    style: "Architectural & Minimalist Style",
    image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054698/creatorlink/public/avatars/gye9m9prpdv81gc9ipkp.webp",
    imgHeight: "h-[380px] sm:h-[420px]",
    tiltClass: "md:-rotate-[1deg]",
    column: 1,
  },
  {
    id: "creator-2",
    label: "Culinary & Lifestyle",
    category: "Food & Travel",
    services: "Morning Rituals & Recipes",
    style: "Slow Living & Aesthetic Details",
    image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054745/creatorlink/public/campaigns/tt4slqpoo1tprmx7ndss.webp",
    imgHeight: "h-[250px] sm:h-[270px]",
    tiltClass: "md:rotate-[0.5deg]",
    column: 1,
  },

  // COLUMN 2
  {
    id: "creator-3",
    label: "Clean Skincare",
    category: "Beauty & Care",
    services: "Product Features & Tutorials",
    style: "Natural Light & Close-ups",
    image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054701/creatorlink/public/avatars/qooau1mzc4okikpsrqri.webp",
    imgHeight: "h-[280px] sm:h-[310px]",
    tiltClass: "md:rotate-[1deg]",
    column: 2,
  },
  {
    id: "creator-4",
    label: "Gastronomy & Stays",
    category: "Food & Travel",
    services: "Destination & Dining Features",
    style: "Warm Earthy Tones",
    image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054791/creatorlink/public/editorial/dedtikmndkhx27kdw1f0.webp",
    imgHeight: "h-[360px] sm:h-[400px]",
    tiltClass: "md:-rotate-[0.5deg]",
    column: 2,
  },

  // COLUMN 3
  {
    id: "creator-5",
    label: "Travel & Heritage",
    category: "Fashion & Lifestyle",
    services: "Editorial Shoots & Stories",
    style: "Cinematic Travel Visuals",
    image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054795/creatorlink/public/avatars/tqkymtysvusyyu0sydzr.webp",
    imgHeight: "h-[230px] sm:h-[250px]",
    tiltClass: "md:-rotate-[0.8deg]",
    column: 3,
  },
  {
    id: "creator-6",
    label: "Digital & Design",
    category: "Technology & More",
    services: "Creative Workflows & Reviews",
    style: "Clean Spatial Layouts",
    image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054798/creatorlink/public/editorial/phnhdibguvjhruowm7ba.webp",
    imgHeight: "h-[260px] sm:h-[280px]",
    tiltClass: "md:rotate-[1deg]",
    column: 3,
  },

  // COLUMN 4
  {
    id: "creator-7",
    label: "Mindful Wellness",
    category: "Beauty & Care",
    services: "Routine Videos & Guides",
    style: "Organic Wellness & Care",
    image: "https://res.cloudinary.com/atr5osne/image/upload/v1792054803/creatorlink/public/editorial/n33uuvvvrnbnhth7qzbf.webp",
    imgHeight: "h-[330px] sm:h-[360px]",
    tiltClass: "md:rotate-[0.5deg]",
    column: 4,
  },
];

const filters = [
  "All Creators",
  "Beauty & Care",
  "Fashion & Lifestyle",
  "Food & Travel",
  "Technology & More",
];

export default function CreatorDiscovery() {
  const [activeFilter, setActiveFilter] = useState("All Creators");

  const filteredCreators = sampleCreators.filter((creator) => {
    if (activeFilter === "All Creators") return true;
    return creator.category === activeFilter;
  });

  // Group filtered creators into 4 columns for desktop layout
  const col1 = filteredCreators.filter((c) => c.column === 1);
  const col2 = filteredCreators.filter((c) => c.column === 2);
  const col3 = filteredCreators.filter((c) => c.column === 3);
  const col4 = filteredCreators.filter((c) => c.column === 4);

  return (
    <section className="relative overflow-hidden bg-[#FAF7F6] dark:bg-background text-foreground py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 xl:px-12 border-b border-border-theme/60 transition-colors duration-300">
      
      {/* CSS Rules for Restrained Hover and Reduced Motion */}
      <style jsx global>{`
        .creator-card-hover {
          transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease, border-color 400ms ease;
        }
        @media (min-width: 768px) {
          .creator-card-hover:hover {
            transform: translateY(-7px) rotate(0deg) scale(1.02) !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .creator-card-hover {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1440px] relative z-10">
        
        {/* =========================================================
            HEADER & CATEGORY FILTERS
        ========================================================= */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
            
            {/* Left Text Intro */}
            <div className="max-w-2xl text-left">
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-secondary font-sans block mb-3">
                EXPLORE CREATIVE TALENT
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
                Meet the Creators Behind Your Next Great Campaign.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
                Every brand needs a creative voice that connects with its audience. Explore creator profiles across different niches, understand their content style and discover potential partners for your next campaign.
              </p>
            </div>

            {/* Right Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 lg:pt-0">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-secondary text-white font-semibold shadow-sm"
                        : "bg-white dark:bg-surface text-slate-700 dark:text-text-secondary border border-slate-200 dark:border-white/10 hover:border-secondary/40 hover:bg-slate-50 dark:hover:bg-surface-muted"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

          </div>
        </ScrollReveal>

        {/* =========================================================
            4-COLUMN MASONRY / EDITORIAL ROSTER GRID
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-start">
          
          {/* -------------------------------------------------------
              COLUMN 1
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={70} className="space-y-6 sm:space-y-7">
            {col1.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </ScrollReveal>

          {/* -------------------------------------------------------
              COLUMN 2 (Offset downward for editorial stagger)
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={140} className="space-y-6 sm:space-y-7 lg:pt-8">
            {col2.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </ScrollReveal>

          {/* -------------------------------------------------------
              COLUMN 3
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={210} className="space-y-6 sm:space-y-7">
            {col3.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </ScrollReveal>

          {/* -------------------------------------------------------
              COLUMN 4 + EXCLUSIVE ACCESS PANEL
          ------------------------------------------------------- */}
          <ScrollReveal direction="up" delay={280} className="space-y-6 sm:space-y-7 lg:pt-4">
            {col4.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}

            {/* BRAND INVITE PANEL */}
            <div className="bg-[#FCEFEF] dark:bg-secondary/10 border border-[#F7D8DF] dark:border-secondary/30 rounded-3xl p-6 sm:p-7 shadow-sm text-left">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-secondary font-sans block mb-2">
                READY TO FIND YOUR CREATIVE PARTNER?
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-3">
                Your Next Creator Collaboration Starts Here.
              </h3>
              <p className="text-xs text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-5">
                Explore creator profiles, understand their creative style and find potential partners for your next campaign.
              </p>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-xs font-sans text-slate-700 dark:text-foreground">
                  <span className="text-secondary font-bold">✓</span>
                  Explore different creative niches.
                </div>
                <div className="flex items-center gap-2 text-xs font-sans text-slate-700 dark:text-foreground">
                  <span className="text-secondary font-bold">✓</span>
                  Discover unique content styles.
                </div>
                <div className="flex items-center gap-2 text-xs font-sans text-slate-700 dark:text-foreground">
                  <span className="text-secondary font-bold">✓</span>
                  Find potential collaboration partners.
                </div>
              </div>

              <Link
                href="/signup?role=brand"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1C1917] dark:bg-white text-white dark:text-slate-900 hover:bg-secondary dark:hover:bg-secondary dark:hover:text-white font-sans font-semibold text-xs tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>Join as a Brand</span>
                <span>→</span>
              </Link>
            </div>

          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}

{/* REUSABLE EDITORIAL CREATOR CARD COMPONENT */}
function CreatorCard({ creator }) {
  return (
    <div
      className={`group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-xl hover:shadow-pink-900/10 dark:hover:shadow-secondary/20 creator-card-hover text-left ${creator.tiltClass}`}
    >
      {/* Image Container */}
      <div className={`relative w-full ${creator.imgHeight} rounded-2xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-surface-muted`}>
        <Image
          src={creator.image}
          alt={creator.label}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Details Container */}
      <div className="px-1">
        <div className="flex items-baseline justify-between mb-1 gap-2">
          <h3 className="text-base font-sans font-bold text-slate-900 dark:text-foreground truncate group-hover:text-secondary transition-colors duration-200">
            {creator.label}
          </h3>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-secondary flex-shrink-0">
            {creator.category}
          </span>
        </div>

        <p className="text-xs font-sans text-slate-600 dark:text-text-secondary mb-2 truncate">
          {creator.style}
        </p>

        <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-text-muted font-sans">
          <span>{creator.services}</span>
          <span className="text-secondary font-bold text-xs">Explore →</span>
        </div>
      </div>
    </div>
  );
}
