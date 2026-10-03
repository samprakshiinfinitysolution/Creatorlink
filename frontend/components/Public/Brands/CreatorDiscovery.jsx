"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const allCreators = [
  // COLUMN 1 CREATORS
  {
    id: "amara",
    name: "Amara Deshmukh",
    price: "₹28K",
    location: "Mumbai",
    category: "Architectural Fashion",
    filterCategory: "High Fashion",
    followers: "52.1K",
    rating: "4.9 ★",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    imgHeight: "h-[380px] sm:h-[420px]",
    tiltClass: "md:-rotate-[1deg]",
    column: 1,
  },
  {
    id: "tanya",
    name: "Tanya Sen",
    price: "₹15K",
    location: "Bengaluru",
    category: "Morning Rituals",
    filterCategory: "Culinary Art",
    followers: "36.5K",
    rating: "4.7 ★",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    imgHeight: "h-[250px] sm:h-[270px]",
    tiltClass: "md:rotate-[0.5deg]",
    column: 1,
  },

  // COLUMN 2 CREATORS
  {
    id: "rhea",
    name: "Rhea Pillai",
    price: "₹35K",
    location: "Delhi",
    category: "Clean Skincare",
    filterCategory: "Beauty & Care",
    followers: "88.4K",
    rating: "5.0 ★",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    imgHeight: "h-[280px] sm:h-[310px]",
    tiltClass: "md:rotate-[1deg]",
    column: 2,
  },
  {
    id: "dev",
    name: "Dev Patel",
    price: "₹20K",
    location: "Goa",
    category: "Gastronomy & Tablescapes",
    filterCategory: "Culinary Art",
    followers: "64.2K",
    rating: "4.9 ★",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    imgHeight: "h-[360px] sm:h-[400px]",
    tiltClass: "md:-rotate-[0.5deg]",
    column: 2,
  },

  // COLUMN 3 CREATORS
  {
    id: "kabir",
    name: "Kabir Singhania",
    price: "₹40K",
    location: "Jaipur",
    category: "Heritage Leisure",
    filterCategory: "High Fashion",
    followers: "110K",
    rating: "4.9 ★",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    imgHeight: "h-[230px] sm:h-[250px]",
    tiltClass: "md:-rotate-[0.8deg]",
    column: 3,
  },
  {
    id: "nandini",
    name: "Nandini Rao",
    price: "₹18K",
    location: "Hyderabad",
    category: "Spatial Design",
    filterCategory: "High Fashion",
    followers: "41.0K",
    rating: "4.8 ★",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    imgHeight: "h-[260px] sm:h-[280px]",
    tiltClass: "md:rotate-[1deg]",
    column: 3,
  },

  // COLUMN 4 CREATORS
  {
    id: "zoya",
    name: "Zoya Merchant",
    price: "₹24K",
    location: "Pune",
    category: "Mindful Wellness",
    filterCategory: "Beauty & Care",
    followers: "42.8K",
    rating: "4.8 ★",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    imgHeight: "h-[330px] sm:h-[360px]",
    tiltClass: "md:rotate-[0.5deg]",
    column: 4,
  },
];

const filters = ["All Vetted", "Beauty & Care", "High Fashion", "Culinary Art"];

export default function CreatorDiscovery() {
  const [activeFilter, setActiveFilter] = useState("All Vetted");

  const filteredCreators = allCreators.filter((creator) => {
    if (activeFilter === "All Vetted") return true;
    return creator.filterCategory === activeFilter;
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          
          {/* Left Text Intro */}
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#947870] dark:text-secondary font-sans block mb-3">
              CURATED ROSTER
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-slate-900 dark:text-foreground leading-[1.15] mb-4">
              Your next collaboration could be here.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-secondary font-sans leading-relaxed">
              Discover vetted, high-engagement tastemakers across fashion, beauty, architecture, travel, and culinary lifestyle.
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
                  className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-[#F5D8CE] dark:bg-secondary text-slate-900 dark:text-white font-semibold shadow-sm"
                      : "bg-white dark:bg-surface text-slate-700 dark:text-text-secondary border border-slate-200 dark:border-white/10 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-surface-muted"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

        </div>

        {/* =========================================================
            4-COLUMN MASONRY / EDITORIAL ROSTER GRID
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-start">
          
          {/* -------------------------------------------------------
              COLUMN 1
          ------------------------------------------------------- */}
          <div className="space-y-6 sm:space-y-7">
            {col1.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>

          {/* -------------------------------------------------------
              COLUMN 2 (Offset downward for editorial stagger)
          ------------------------------------------------------- */}
          <div className="space-y-6 sm:space-y-7 lg:pt-8">
            {col2.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>

          {/* -------------------------------------------------------
              COLUMN 3
          ------------------------------------------------------- */}
          <div className="space-y-6 sm:space-y-7">
            {col3.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>

          {/* -------------------------------------------------------
              COLUMN 4 + EXCLUSIVE ACCESS PANEL
          ------------------------------------------------------- */}
          <div className="space-y-6 sm:space-y-7 lg:pt-4">
            {col4.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}

            {/* COMPACT EXCLUSIVE ACCESS PANEL */}
            <div className="bg-[#FCEFEF] dark:bg-secondary/10 border border-[#F7D8DF] dark:border-secondary/30 rounded-3xl p-6 sm:p-7 shadow-sm">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-secondary font-sans block mb-2">
                EXCLUSIVE ACCESS
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-slate-900 dark:text-foreground leading-tight mb-3">
                Access 4,500+<br />Curated Tastemakers
              </h3>
              <p className="text-xs text-slate-600 dark:text-text-secondary font-sans leading-relaxed mb-5">
                Filter by audience geographic distribution, real engagement, and aesthetic genre.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs font-sans text-slate-700 dark:text-foreground">
                  <span className="text-secondary font-bold">✓</span>
                  Audience authenticity verified
                </div>
                <div className="flex items-center gap-2 text-xs font-sans text-slate-700 dark:text-foreground">
                  <span className="text-secondary font-bold">✓</span>
                  Custom brand aesthetic matching
                </div>
                <div className="flex items-center gap-2 text-xs font-sans text-slate-700 dark:text-foreground">
                  <span className="text-secondary font-bold">✓</span>
                  Direct escrow & rights management
                </div>
              </div>

              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1C1917] hover:bg-black text-white font-sans font-semibold text-xs tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>Request Brand Invite</span>
                <span>→</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

{/* REUSABLE EDITORIAL CREATOR CARD COMPONENT */}
function CreatorCard({ creator }) {
  return (
    <div
      className={`group bg-white dark:bg-surface border border-slate-200/80 dark:border-white/10 rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-xl hover:shadow-pink-900/10 dark:hover:shadow-secondary/20 creator-card-hover ${creator.tiltClass}`}
    >
      {/* Image Container */}
      <div className={`relative w-full ${creator.imgHeight} rounded-2xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-surface-muted`}>
        <Image
          src={creator.image}
          alt={creator.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Details Container */}
      <div className="px-1">
        {/* Name & Price */}
        <div className="flex items-baseline justify-between mb-1 gap-2">
          <h3 className="text-base sm:text-lg font-sans font-bold text-slate-900 dark:text-foreground truncate group-hover:text-secondary transition-colors duration-200">
            {creator.name}
          </h3>
          <span className="text-xs font-sans font-bold text-slate-600 dark:text-text-muted flex-shrink-0">
            {creator.price}
          </span>
        </div>

        {/* Location & Category */}
        <p className="text-xs font-sans text-slate-500 dark:text-text-secondary mb-3 truncate">
          {creator.location} • {creator.category}
        </p>

        {/* Footer info: Followers & Rating */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-text-muted font-sans">
          <span>{creator.followers} Followers</span>
          {creator.rating && (
            <span className="px-2 py-0.5 rounded-full bg-[#FCEFEF] dark:bg-secondary/20 text-secondary text-[11px] font-bold">
              {creator.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
