"use client";

import { useEffect, useState } from "react";

function SunIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.18" />
      <path d="M12 2v2.2" />
      <path d="M12 19.8V22" />
      <path d="m4.93 4.93 1.55 1.55" />
      <path d="m17.52 17.52 1.55 1.55" />
      <path d="M2 12h2.2" />
      <path d="M19.8 12H22" />
      <path d="m4.93 19.07 1.55-1.55" />
      <path d="m17.52 6.48 1.55-1.55" />
    </svg>
  );
}

function MoonIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Sparkle star beside crescent */}
      <path d="M18.5 4.5v3m-1.5-1.5h3" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = savedTheme === "dark" || document.documentElement.classList.contains("dark");

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setDark(nextDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
      title={dark ? "Switch to Day" : "Switch to Night"}
      className={`
        group
        relative
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-black/10
        bg-surface/95
        text-primary
        shadow-xs
        backdrop-blur-md
        transition-all
        duration-300
        hover:scale-105
        hover:border-secondary/40
        hover:text-secondary
        hover:shadow-md
        active:scale-95
        dark:border-white/10
        dark:bg-zinc-800/90
        dark:text-white
        dark:hover:border-secondary/50
        dark:hover:text-secondary
        sm:h-10
        sm:w-10
        cursor-pointer
        ${className}
      `}
    >
      <span className="relative flex items-center justify-center transition-transform duration-500 ease-out group-hover:rotate-12">
        {mounted && dark ? (
          <MoonIcon className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] text-amber-300 dark:text-amber-200 transition-colors" />
        ) : (
          <SunIcon className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] text-amber-500 transition-colors" />
        )}
      </span>
    </button>
  );
}