"use client";

import React from "react";

// =========================================================
// FOOTER DATA
// =========================================================
const FOOTER_COLUMNS = [
  {
    title: "DIRECTORY",
    links: [
      { label: "Editorial Index", href: "#" },
      { label: "Lookbook", href: "#" },
      { label: "Tastemakers", href: "#" },
      { label: "Curation Board", href: "#" },
      { label: "Haute Houses", href: "#" },
    ],
  },
  {
    title: "PROTOCOL",
    links: [
      { label: "Synergy Protocol", href: "#" },
      { label: "Smart Escrow", href: "#" },
      { label: "Frame Review", href: "#" },
      { label: "Rights Whitelisting", href: "#" },
      { label: "SLA Assurance", href: "#" },
    ],
  },
  {
    title: "CONCIERGE",
    links: [
      { label: "Private Salon", href: "#" },
      { label: "Campaign Desk", href: "#" },
      { label: "Creative Directors", href: "#" },
      { label: "Talent Advisory", href: "#" },
      { label: "Enterprise", href: "#" },
    ],
  },
  {
    title: "CHARTER",
    links: [
      { label: "Legal Terms", href: "#" },
      { label: "Privacy Charter", href: "#" },
      { label: "Security & Escrow", href: "#" },
      { label: "Code of Ethics", href: "#" },
      { label: "Press Room", href: "#" },
    ],
  },
];

// =========================================================
// MAIN FOOTER COMPONENT
// =========================================================
export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0a] text-white pt-14 sm:pt-16 md:pt-20 pb-10 px-4 sm:px-6 lg:px-10 xl:px-12 border-t border-white/10 transition-colors duration-300">
      <div className="mx-auto max-w-[1440px]">
        {/* =========================================================
            MAIN FOOTER GRID (BRAND INFO LEFT, 4 COLUMNS RIGHT)
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-16 border-b border-white/10">
          {/* Left Column: Maison Synergie Brand & Socials (5 Cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand Logo Header */}
              <a
                href="#"
                className="group inline-flex items-center gap-1.5 font-serif text-xl sm:text-2xl font-medium text-white"
              >
                <span className="tracking-wide transition-[letter-spacing] duration-300 ease-out group-hover:tracking-[0.06em]">
                  CREATORLINK
                </span>
                <span className="text-secondary text-2xl leading-none">•</span>
              </a>

              {/* Description */}
              <p className="text-xs sm:text-sm text-white/60 font-sans max-w-sm mt-4 mb-6 leading-relaxed">
                The premier editorial collaboration exchange uniting visionary
                creators with the world&apos;s most discerning luxury brands.
              </p>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 mt-2">
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-[#222222] text-white/80 hover:bg-secondary hover:text-black hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,79,135,0.4)] transition-all duration-300 ease-out flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                className="w-10 h-10 rounded-full bg-[#222222] text-white/80 hover:bg-secondary hover:text-black hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,79,135,0.4)] transition-all duration-300 ease-out flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.9a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 12.16a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.02z" />
                </svg>
              </a>

              {/* X */}
              <a
                href="#"
                aria-label="X"
                className="w-10 h-10 rounded-full bg-[#222222] text-white/80 hover:bg-secondary hover:text-black hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,79,135,0.4)] transition-all duration-300 ease-out flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-[#222222] text-white/80 hover:bg-secondary hover:text-black hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,79,135,0.4)] transition-all duration-300 ease-out flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Columns: 4 Directory Link Columns (7 Cols on Desktop) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-4 sm:mb-5 block">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 sm:space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-xs sm:text-[13px] text-white/60 hover:text-white transition-colors duration-200 block font-sans"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            BOTTOM COPYRIGHT & SYSTEM STATUS BAR
        ========================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60 font-sans">
          {/* Bottom Left Copyright */}
          <p>© 2025 Maison Synergie Inc. All Haute Rights Reserved.</p>

          {/* Bottom Right System Status & Locations */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center sm:justify-end">
            {/* Pulsing Green Live Status Dot */}
            <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>

            {/* Static Status Text */}
            <span className="font-semibold text-white text-xs whitespace-nowrap">
              All Systems Operational
            </span>

            {/* Vertical Divider */}
            <span className="text-white/20 font-light select-none">|</span>

            {/* Global Hubs */}
            <span className="text-white/60 text-xs whitespace-nowrap">
              Paris • New York • Milan • Tokyo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
