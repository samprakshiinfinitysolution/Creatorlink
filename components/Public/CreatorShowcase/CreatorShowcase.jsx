"use client";
import Image from "next/image";

import { useState } from "react";

const MOBILE_CATEGORIES = [
  "All Salons",
  "Haute Fashion",
  "Beauty & Skin",
  "UGC & Micro-Film",
  "Travel & Hideaways",
  "Fine Dining",
  "Minimal Tech",
];

export default function CreatorShowcase() {
  const [activeCategory, setActiveCategory] = useState("All Salons");
  const [search, setSearch] = useState("");

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-background
        px-5
        pb-4
        pt-8
        text-foreground

        sm:px-6

        lg:px-10
        lg:pt-10
      "
    >
      <style>{`
        .creator-float-slow {
          animation: creatorFloat 6s ease-in-out infinite;
        }

        .creator-line-top {
          stroke-dashoffset: 0;
          animation: dashMoveLeftToRight 1s linear infinite;
        }

        .creator-line-bottom {
          stroke-dashoffset: 0;
          animation: dashMoveRightToLeft 1s linear infinite;
        }

        @keyframes dashMoveLeftToRight {
          to {
            stroke-dashoffset: -32;
          }
        }

        @keyframes dashMoveRightToLeft {
          to {
            stroke-dashoffset: 32;
          }
        }
      `}</style>
      {/* =====================================================
          MOBILE / TABLET SHOWCASE
          Below 1024px
      ===================================================== */}

      <div
        className="
          relative
          mx-auto
          
          w-full
          lg:hidden
        "
      >
        {/* ================= MAYA MOBILE ================= */}

        <div
          className="
            creator-float
            relative
            z-20
            ml-[28px]
            w-[min(356px,calc(100vw-56px))]
          "
        >
          <div
            className="
              flex
              h-[100px]
              w-full
              items-center
              gap-3
              rounded-[26px]
              border
              border-border-theme
              bg-surface
              px-3
              shadow-[0_12px_35px_rgba(0,0,0,0.06)]
              transition-all
              duration-500
              hover:-translate-y-1
            "
          >
            {/* IMAGE */}

            <div
              className="
                relative
                h-[64px]
                w-[64px]
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-secondary/20
              "
            >
              <Image src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=300&q=85" alt="Maya creator" fill className="h-full w-full object-cover" sizes="33vw" />
            </div>

            {/* NAME + STATS */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[14px] font-semibold text-primary">
                  @maya.studio
                </p>

                <span className="shrink-0 text-[12px] text-secondary-dark">
                  ✦
                </span>
              </div>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-2
                  text-[12px]
                  text-text-secondary
                "
              >
                <span>128K reach</span>

                <span className="text-border-theme">•</span>

                <span className="font-medium text-secondary-dark">
                  4.8% Eng
                </span>
              </div>
            </div>

            {/* CATEGORY + PRICE */}

            <div
              className="
                flex
                shrink-0
                flex-col
                items-end
                justify-center
                gap-2
                pr-1
              "
            >
              <span
                className="
                  rounded-full
                  bg-secondary/[0.12]
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-secondary-dark
                "
              >
                Fashion
              </span>

              <div className="text-right leading-none">
                <p className="text-[10px] text-text-secondary">
                  From
                </p>

                <p className="mt-0.5 text-[13px] font-bold text-primary">
                  $250
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONNECTOR ================= */}

        <div
          className="
            ml-[68px]
            h-[20px]
            w-px
            border-l
            border-dashed
            border-secondary/50
          "
        />

        {/* ================= LUCIAN MOBILE ================= */}

        <div
          className="
            creator-float-slow
            relative
            z-20
            ml-[clamp(80px,21vw,108px)]
            w-[min(356px,calc(100vw-56px))]
          "
        >
          <div
            className="
              flex
              h-[92px]
              w-full
              items-center
              gap-3
              rounded-[26px]
              border
              border-border-theme
              bg-surface
              px-3
              shadow-[0_12px_35px_rgba(0,0,0,0.06)]
              transition-all
              duration-500
              hover:-translate-y-1
            "
          >
            {/* IMAGE */}

            <div
              className="
                relative
                h-[60px]
                w-[60px]
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-secondary/20
              "
            >
              <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=85" alt="Lucian creator" fill className="h-full w-full object-cover" sizes="33vw" />
            </div>

            {/* NAME + STATS */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[14px] font-semibold text-primary">
                  @lucian.atelier
                </p>

                <span className="shrink-0 text-[12px] text-secondary-dark">
                  ✦
                </span>
              </div>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-2
                  whitespace-nowrap
                  text-[12px]
                  text-text-secondary
                "
              >
                <span>340K reach</span>

                <span className="text-border-theme">•</span>

                <span className="font-medium text-secondary-dark">
                  6.2% Eng
                </span>
              </div>
            </div>

            {/* CATEGORY */}

            <span
              className="
                shrink-0
                rounded-full
                bg-secondary/[0.08]
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-primary
              "
            >
              Editorial
            </span>
          </div>
        </div>

        {/* ================= MOBILE OFFER ================= */}

        <div
          className="
            relative
            z-30
            ml-[48px]
            -mt-[14px]
            w-fit
          "
        >
          <div
            className="
              rounded-full
              border
              border-secondary
              bg-primary
              px-5
              py-2
              shadow-[0_8px_25px_rgba(255,79,135,0.18)]
            "
          >
            <p
              className="
                whitespace-nowrap
                text-[11px]
                font-medium
                text-white
              "
            >
              Offer Received: $1,200 • LVMH Group
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP SHOWCASE
          1024px+
      ===================================================== */}

      <div
        className="
          relative
          mx-auto
          hidden
          h-[720px]
          max-w-[1500px]
          lg:block
        "
      >
        {/* ================= PINK DASHED LINE ================= */}

        <svg
          className="
            creator-line-top
            pointer-events-none
            absolute
            left-[17%]
            top-[27%]
            z-0
            h-[180px]
            w-[66%]
          "
          viewBox="0 0 900 180"
          fill="none"
        >
          <path
            d="M0 30 C180 70 270 70 420 55 C590 40 700 55 900 95"
            stroke="var(--theme-secondary)"
            strokeWidth="2"
            strokeDasharray="7 9"
            opacity="0.65"
          />
        </svg>

        {/* ================= PURPLE DASHED LINE ================= */}

        <svg
          className="
            creator-line-bottom
            pointer-events-none
            absolute
            left-[17%]
            top-[51%]
            z-0
            h-[180px]
            w-[66%]
          "
          viewBox="0 0 900 180"
          fill="none"
        >
          <path
            d="M0 80 C180 120 280 115 430 65 C600 10 720 55 900 105"
            stroke="var(--theme-tertiary)"
            strokeWidth="2"
            strokeDasharray="7 9"
            opacity="0.65"
          />
        </svg>

        {/* ================= MAYA ================= */}

        <div className="creator-float absolute left-[7%] top-[5%] z-10 w-[270px] -rotate-[3deg]">
          <div
            className="
              overflow-hidden
              rounded-[26px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[235px] overflow-hidden rounded-[19px]">
              <Image src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=85" alt="Maya creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

              <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#333]">
                <span className="mr-1 text-secondary">●</span>
                4.8% ENG
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pb-1 pt-3">
              <div>
                <p className="text-[14px] font-semibold text-primary">
                  @maya.studio
                  <span className="ml-1 text-secondary-dark">✦</span>
                </p>

                <p className="mt-1 text-[12px] text-text-secondary">
                  Fashion & Haute Beauty
                </p>
              </div>

              <span className="rounded-lg bg-secondary/[0.08] px-2.5 py-1 text-[11px] font-semibold text-primary">
                128K
              </span>
            </div>

            <div className="border-t border-border-theme px-1 pt-2 text-[11px] text-text-secondary">
              Rate Index
            </div>
          </div>
        </div>

        {/* ================= LUCIAN ================= */}

        <div className="creator-float-slow absolute right-[7%] top-[1%] z-10 w-[270px] rotate-[3deg]">
          <div
            className="
              overflow-hidden
              rounded-[26px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[235px] overflow-hidden rounded-[19px]">
              <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85" alt="Lucian creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

              <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#333]">
                <span className="mr-1 text-secondary">●</span>
                6.2% ENG
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pb-1 pt-3">
              <div>
                <p className="text-[14px] font-semibold text-primary">
                  @lucian.atelier
                  <span className="ml-1 text-secondary-dark">✦</span>
                </p>

                <p className="mt-1 text-[12px] text-text-secondary">
                  High-End Editorial
                </p>
              </div>

              <span className="rounded-lg bg-secondary/[0.08] px-2.5 py-1 text-[11px] font-semibold text-primary">
                340K
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border-theme px-1 pt-2 text-[11px]">
              <span className="text-text-secondary">
                From
              </span>

              <span className="font-semibold text-primary">
                $720
              </span>
            </div>
          </div>
        </div>

        {/* ================= CENTER OFFER ================= */}

        <div className="absolute left-1/2 top-[38%] z-30 w-[290px] -translate-x-1/2">
          <div
            className="
              rounded-full
              border
              border-secondary/40
              bg-surface
              px-5
              py-3
              shadow-[0_15px_40px_rgba(255,79,135,0.15)]
            "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-white">
                ✓
              </div>

              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-primary">
                  Offer Received: $1,200
                </p>

                <p className="mt-0.5 text-[10px] text-text-secondary">
                  LVMH Group • 2 Reel Campaign
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CLARA ================= */}

        <div className="creator-float-slow absolute bottom-[8%] left-[15%] z-20 w-[300px] rotate-[2deg]">
          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[190px] overflow-hidden rounded-[18px]">
              <Image src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=85" alt="Clara creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

              <div className="absolute bottom-3 left-3 rounded-full bg-[#222]/80 px-3 py-1 text-[10px] font-medium text-white">
                ▶ TikTok Motion
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-3">
              <div>
                <p className="text-[14px] font-semibold text-primary">
                  @clara.film
                  <span className="ml-1 text-secondary-dark">✦</span>
                </p>

                <p className="mt-1 text-[12px] text-text-secondary">
                  UGC Director • 8.4% Eng
                </p>
              </div>

              <span className="text-[14px] font-semibold text-secondary-dark">
                From $180
              </span>
            </div>
          </div>
        </div>

        {/* ================= SORA ================= */}

        <div className="creator-float absolute bottom-[8%] right-[15%] z-20 w-[300px] -rotate-[2deg]">
          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-border-theme
              bg-surface
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,0.08)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:rotate-0
              hover:scale-[1.03]
            "
          >
            <div className="relative h-[190px] overflow-hidden rounded-[18px]">
              <Image src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=85" alt="Sora creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

              <div className="absolute bottom-3 left-3 rounded-full bg-secondary px-3 py-1 text-[10px] font-medium text-white">
                Architectural Travel
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-3">
              <div>
                <p className="text-[14px] font-semibold text-primary">
                  @sora.visuals
                  <span className="ml-1 text-secondary-dark">✦</span>
                </p>

                <p className="mt-1 text-[12px] text-text-secondary">
                  215K Reach • 5.1% Eng
                </p>
              </div>

              <span className="text-[14px] font-semibold text-primary">
                From $450
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}