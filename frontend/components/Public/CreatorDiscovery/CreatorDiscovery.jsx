"use client";

import { useState, useRef, useEffect } from "react";

const PLATFORM_OPTIONS = [
  "All Channels",
  "Instagram Verified",
  "TikTok Motion",
  "YouTube High-Res",
];

const INDUSTRY_OPTIONS = [
  "All Niches",
  "Fashion & Luxury",
  "Beauty & Wellness",
  "Food & Hospitality",
  "Travel & Lifestyle",
  "Tech & Culture",
];

const AUDIENCE_OPTIONS = [
  "Any Tier",
  "Micro (10K - 50K)",
  "Mid-Tier (50K - 250K)",
  "Macro (250K - 1M+)",
];

const BUDGET_OPTIONS = [
  "$200 - $1,000",
  "$1,000 - $5,000",
  "$5,000 - $25,000",
  "Custom Retainer",
];

const CATEGORIES = [
  { name: "All Salons", count: "12.4k" },
  { name: "Haute Fashion", count: "2.4k" },
  { name: "Beauty & Skin", count: "1.8k" },
  { name: "UGC & Micro-Film", count: "950" },
  { name: "Travel & Hideaways", count: "1.2k" },
  { name: "Fine Dining", count: "840" },
  { name: "Minimal Tech", count: "610" },
];

function ChevronDownIcon({ isOpen }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-secondary" : "text-text-secondary"
        }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-secondary shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FilterDropdown({
  id,
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}) {
  return (
    <div className="relative flex-1 min-w-0" data-filter-id={id}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          group flex w-full flex-col justify-center rounded-[18px] sm:rounded-[20px]
          border bg-background/60 px-4 py-3 sm:py-3.5 text-left
          transition-all duration-200 outline-none
          hover:border-secondary/40 hover:bg-background
          dark:bg-[#161616]/70 dark:hover:bg-[#191919]
          ${isOpen
            ? "border-secondary/60 ring-2 ring-secondary/15 bg-background dark:bg-[#191919]"
            : "border-border-theme"
          }
        `}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-bold tracking-[0.09em] text-text-secondary uppercase">
            {label}
          </span>
          <ChevronDownIcon isOpen={isOpen} />
        </div>

        <p className="mt-1 truncate text-[13px] sm:text-[14px] font-semibold text-primary">
          {value}
        </p>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="
            absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[210px]
            rounded-[20px] border border-border-theme bg-surface p-1.5
            shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl
            dark:bg-[#1c1c1c] dark:shadow-[0_18px_45px_rgba(0,0,0,0.6)]
            animate-in fade-in zoom-in-95 duration-150
          "
        >
          <div className="max-h-[260px] overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(option)}
                  className={`
                    flex w-full items-center justify-between rounded-[14px] px-3.5 py-2.5
                    text-left text-[13px] transition-colors duration-150
                    ${isSelected
                      ? "bg-secondary/[0.09] font-semibold text-secondary"
                      : "text-text-secondary hover:bg-secondary/[0.06] hover:text-primary dark:text-[#c4c4c4] dark:hover:text-white"
                    }
                  `}
                >
                  <span className="truncate pr-2">{option}</span>
                  {isSelected && <CheckIcon />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatorDiscovery() {
  const [platform, setPlatform] = useState("All Channels");
  const [industry, setIndustry] = useState("All Niches");
  const [audience, setAudience] = useState("Any Tier");
  const [budget, setBudget] = useState("$200 - $1,000");

  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All Salons");

  const containerRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleToggle = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="creator-discovery"
      className="hidden lg:block relative bg-background px-4 py-12 text-foreground sm:px-6 md:px-8 lg:px-10 lg:py-20"
    >
      {/* ================= AMBIENT PINK GLOW ================= */}
      <div
        className="
          pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          h-[340px] w-[88%] max-w-[1100px] rounded-full
          bg-secondary/[0.08] blur-[120px] dark:bg-secondary/[0.05]
        "
        aria-hidden="true"
      />

      {/* ================= MAIN DISCOVERY CARD ================= */}
      <div
        ref={containerRef}
        className="
          relative mx-auto w-full max-w-[1360px]
          rounded-[28px] border border-border-theme bg-surface
          p-6 sm:p-8 lg:p-11
          shadow-[0_20px_50px_rgba(0,0,0,0.03)]
          transition-colors duration-300
          dark:bg-[#1a1a1a] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]
          sm:rounded-[px]
        "
      >
        {/* ================= CARD HEADER ================= */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-[760px]">
            <h2
              className="
                text-[26px] leading-[1.08] tracking-[-0.035em] text-foreground
                min-[400px]:text-[30px] sm:text-[36px] lg:text-[42px] xl:text-[46px]
              "
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Find creators who fit your brand.
            </h2>

            <p className="mt-2.5 text-[14px] leading-relaxed text-text-secondary sm:text-[15px] lg:text-[16px]">
              Filter instantly across 12,000+ vetted tastemakers with audited engagement.
            </p>
          </div>

          {/* ACTIVE STATUS PILL */}
          <div className="shrink-0 self-start sm:self-end">
            <div
              className="
                inline-flex items-center gap-2 rounded-full
                border border-border-theme bg-background/80 px-3.5 py-1.5
                text-[11px] font-medium tracking-[0.08em] text-text-secondary
                backdrop-blur-sm dark:border-white/10 dark:bg-surface/90
              "
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
              </span>

              <span className="font-bold text-primary">1,480</span>
              <span className="text-[10px] sm:text-[11px]">ACTIVE RIGHT NOW</span>
            </div>
          </div>
        </div>

        {/* ================= THIN DIVIDER ================= */}
        <div className="my-6 h-px w-full bg-border-theme sm:my-8" />

        {/* ================= 4 FILTERS + EXPLORE CTA ================= */}
        <div
          className="
            grid grid-cols-1 gap-2.5
            sm:grid-cols-2
            lg:grid-cols-[1fr_1fr_1fr_1fr_auto]
            lg:items-stretch lg:gap-3
          "
        >
          {/* 1. PLATFORM */}
          <FilterDropdown
            id="platform"
            label="Platform"
            value={platform}
            options={PLATFORM_OPTIONS}
            isOpen={openDropdown === "platform"}
            onToggle={() => handleToggle("platform")}
            onSelect={(val) => {
              setPlatform(val);
              setOpenDropdown(null);
            }}
          />

          {/* 2. INDUSTRY */}
          <FilterDropdown
            id="industry"
            label="Industry"
            value={industry}
            options={INDUSTRY_OPTIONS}
            isOpen={openDropdown === "industry"}
            onToggle={() => handleToggle("industry")}
            onSelect={(val) => {
              setIndustry(val);
              setOpenDropdown(null);
            }}
          />

          {/* 3. AUDIENCE SIZE */}
          <FilterDropdown
            id="audience"
            label="Audience Size"
            value={audience}
            options={AUDIENCE_OPTIONS}
            isOpen={openDropdown === "audience"}
            onToggle={() => handleToggle("audience")}
            onSelect={(val) => {
              setAudience(val);
              setOpenDropdown(null);
            }}
          />

          {/* 4. BUDGET TARGET */}
          <FilterDropdown
            id="budget"
            label="Budget Target"
            value={budget}
            options={BUDGET_OPTIONS}
            isOpen={openDropdown === "budget"}
            onToggle={() => handleToggle("budget")}
            onSelect={(val) => {
              setBudget(val);
              setOpenDropdown(null);
            }}
          />

          {/* 5. EXPLORE CTA */}
          <button
            type="button"
            className="
              group flex h-[58px] min-h-[58px] w-full items-center justify-center gap-2.5
              rounded-[18px] bg-primary px-6 text-[14px] font-semibold text-white
              shadow-sm transition-all duration-200
              hover:scale-[1.02] hover:bg-theme-hover
              dark:bg-primary dark:text-black dark:hover:bg-theme-hover
              sm:rounded-[20px] lg:h-auto lg:w-auto lg:px-7 lg:text-[15px]
            "
          >
            <span className="whitespace-nowrap">Explore 12k+</span>
            <span className="text-[17px] transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        {/* ================= CATEGORY CHIPS ================= */}
        <div className="mt-7 sm:mt-8">
          <div
            className="
              flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              sm:flex-wrap sm:gap-2.5
            "
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(cat.name)}
                  className={`
                    inline-flex shrink-0 items-center rounded-full px-4 py-2 sm:py-2.5
                    text-[12px] sm:text-[13px] transition-all duration-200
                    ${isActive
                      ? "bg-primary font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:bg-primary dark:text-black"
                      : "border border-border-theme bg-background/50 font-medium text-text-secondary hover:border-secondary/40 hover:text-primary hover:shadow-[0_2px_12px_rgba(255,79,135,0.08)] dark:bg-[#161616]/60 dark:hover:text-white"
                    }
                  `}
                >
                  <span className="whitespace-nowrap">{cat.name}</span>
                  <span
                    className={`
                      ml-2 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold
                      ${isActive
                        ? "bg-white/20 text-white dark:bg-black/15 dark:text-black"
                        : "bg-black/[0.04] text-text-secondary dark:bg-white/[0.08] dark:text-[#b0b0b0]"
                      }
                    `}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
