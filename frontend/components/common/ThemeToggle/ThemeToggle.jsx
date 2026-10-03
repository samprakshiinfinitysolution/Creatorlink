"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
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
      aria-label="Toggle theme"
      className="  flex
  h-9
  w-9
  shrink-0
  items-center
  justify-center
  rounded-full
  border
  border-black/10
  bg-white
  text-[16px]
  shadow-sm
  transition-all
  duration-200
  hover:scale-105
  dark:border-white/10
  dark:bg-background

  sm:h-10
  sm:w-10"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}