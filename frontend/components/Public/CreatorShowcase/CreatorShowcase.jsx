"use client";
import Image from "next/image";

import { useState } from "react";
import ScrollReveal from "@/components/theme/ScrollReveal";

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
        px-3.5
        pb-4
        pt-8
        text-foreground

        min-[380px]:px-5

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

      <ScrollReveal
        direction="scale"
        delay={150}
        className="
          relative
          mx-auto
          w-full
          max-w-[390px]
          sm:max-w-[420px]
          lg:hidden
        "
      >
        {/* ================= MAYA MOBILE ================= */}

        <div
          className="
            creator-float
            relative
            z-20
            w-full
            max-w-[316px]
            mr-auto
            min-[390px]:max-w-[336px]
            sm:max-w-[356px]
          "
        >
          <div
            className="
              flex
              h-[86px]
              w-full
              items-center
              gap-2
              rounded-[22px]
              border
              border-border-theme
              bg-surface
              px-2.5
              shadow-[0_12px_35px_rgba(0,0,0,0.06)]
              transition-all
              duration-500
              hover:-translate-y-1
              min-[390px]:h-[92px]
              min-[390px]:gap-2.5
              min-[390px]:px-3
              sm:h-[100px]
              sm:gap-3
              sm:rounded-[26px]
              sm:px-3.5
            "
          >
            {/* IMAGE */}

            <div
              className="
                relative
                h-[50px]
                w-[50px]
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-secondary/20
                min-[390px]:h-[56px]
                min-[390px]:w-[56px]
                sm:h-[64px]
                sm:w-[64px]
              "
            >
              <Image
                src="https://res.cloudinary.com/atr5osne/image/upload/v1792054762/creatorlink/public/creators/i4nwvw8gvyq69fy8to1e.webp"
                alt="Maya creator"
                fill
                className="h-full w-full object-cover"
                sizes="(max-width: 640px) 56px, 64px"
              />
            </div>

            {/* NAME + STATS */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[12.5px] font-semibold text-primary min-[390px]:text-[13px] sm:text-[14px]">
                  @maya.studio
                </p>

                <span className="shrink-0 text-[11px] text-secondary-dark sm:text-[12px]">
                  ✦
                </span>
              </div>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-[10.5px]
                  text-text-secondary
                  min-[390px]:text-[11px]
                  sm:gap-2
                  sm:text-[12px]
                "
              >
                <span className="whitespace-nowrap">128K reach</span>

                <span className="text-border-theme">•</span>

                <span className="whitespace-nowrap font-medium text-secondary-dark">
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
                gap-1
                pr-1
                min-[390px]:gap-1.5
                sm:gap-2
              "
            >
              <span
                className="
                  rounded-full
                  bg-secondary/[0.12]
                  px-2
                  py-0.5
                  text-[9px]
                  font-semibold
                  text-secondary-dark
                  min-[390px]:text-[9.5px]
                  sm:px-2.5
                  sm:py-1
                  sm:text-[10px]
                "
              >
                Fashion
              </span>

              <div className="text-right leading-none">
                <p className="text-[9px] text-text-secondary min-[390px]:text-[9.5px] sm:text-[10px]">
                  From
                </p>

                <p className="mt-0.5 text-[11.5px] font-bold text-primary min-[390px]:text-[12px] sm:text-[13px]">
                  $250
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONNECTOR LINE ================= */}

        <div className="relative my-1 flex h-[22px] w-full items-center sm:my-1.5 sm:h-[26px]">
          <svg
            className="pointer-events-none h-full w-[120px] ml-5 min-[390px]:ml-7 overflow-visible"
            viewBox="0 0 60 24"
            fill="none"
          >
            <path
              d="M 8 0 C 8 16, 46 8, 46 24"
              stroke="var(--theme-secondary)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              className="opacity-60"
            />
          </svg>
        </div>

        {/* ================= LUCIAN MOBILE ================= */}

        <div
          className="
            creator-float-slow
            relative
            z-20
            w-full
            max-w-[316px]
            ml-auto
            min-[390px]:max-w-[336px]
            sm:max-w-[356px]
          "
        >
          <div
            className="
              flex
              h-[84px]
              w-full
              items-center
              gap-2
              rounded-[22px]
              border
              border-border-theme
              bg-surface
              px-2.5
              shadow-[0_12px_35px_rgba(0,0,0,0.06)]
              transition-all
              duration-500
              hover:-translate-y-1
              min-[390px]:h-[88px]
              min-[390px]:gap-2.5
              min-[390px]:px-3
              sm:h-[92px]
              sm:gap-3
              sm:rounded-[26px]
              sm:px-3.5
            "
          >
            {/* IMAGE */}

            <div
              className="
                relative
                h-[48px]
                w-[48px]
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-secondary/20
                min-[390px]:h-[54px]
                min-[390px]:w-[54px]
                sm:h-[60px]
                sm:w-[60px]
              "
            >
              <Image
                src="https://res.cloudinary.com/atr5osne/image/upload/v1792054721/creatorlink/public/creators/lyhqi3si95n8so90e1gl.webp"
                alt="Lucian creator"
                fill
                className="h-full w-full object-cover"
                sizes="(max-width: 640px) 54px, 60px"
              />
            </div>

            {/* NAME + STATS */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[12.5px] font-semibold text-primary min-[390px]:text-[13px] sm:text-[14px]">
                  @lucian.atelier
                </p>

                <span className="shrink-0 text-[11px] text-secondary-dark sm:text-[12px]">
                  ✦
                </span>
              </div>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-[10.5px]
                  text-text-secondary
                  min-[390px]:text-[11px]
                  sm:gap-2
                  sm:text-[12px]
                "
              >
                <span className="whitespace-nowrap">340K reach</span>

                <span className="text-border-theme">•</span>

                <span className="whitespace-nowrap font-medium text-secondary-dark">
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
                px-2
                py-0.5
                text-[9px]
                font-semibold
                text-primary
                min-[390px]:text-[9.5px]
                sm:px-2.5
                sm:py-1
                sm:text-[10px]
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
            mt-3.5
            flex
            justify-center
            min-[380px]:justify-start
            min-[380px]:ml-6
            sm:ml-10
            sm:mt-4
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-secondary/60
              bg-primary
              px-3.5
              py-1.5
              shadow-[0_8px_25px_rgba(255,79,135,0.18)]
              dark:bg-surface
              dark:border-secondary/50
              sm:px-4.5
              sm:py-2
            "
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white">
              ✓
            </span>

            <p
              className="
                whitespace-nowrap
                text-[10.5px]
                font-medium
                text-white
                dark:text-primary
                min-[380px]:text-[11px]
              "
            >
              Offer Received:{" "}
              <span className="font-semibold text-secondary-dark dark:text-secondary">
                $1,200
              </span>{" "}
              • LVMH Group
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* =====================================================
          DESKTOP SHOWCASE
          1024px+
      ===================================================== */}

      <ScrollReveal
        direction="scale"
        delay={150}
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
              <Image src="https://res.cloudinary.com/atr5osne/image/upload/v1792054762/creatorlink/public/creators/i4nwvw8gvyq69fy8to1e.webp" alt="Maya creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

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
              <Image src="https://res.cloudinary.com/atr5osne/image/upload/v1792054721/creatorlink/public/creators/lyhqi3si95n8so90e1gl.webp" alt="Lucian creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

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
              <Image src="https://res.cloudinary.com/atr5osne/image/upload/v1792054938/creatorlink/public/creators/hoz1pqturtg0l2cbxunp.webp" alt="Clara creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

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
              <Image src="https://res.cloudinary.com/atr5osne/image/upload/v1792056004/creatorlink/public/editorial/sgcos8o3wlzt7bgczudt.webp" alt="Sora creator" fill className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" sizes="50vw" />

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
      </ScrollReveal>
    </section>
  );
}