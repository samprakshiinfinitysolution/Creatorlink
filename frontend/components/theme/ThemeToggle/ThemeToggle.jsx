"use client";

import { useContext } from "react";

import { ThemeContext } from "@/components/theme/ThemeProvider/ThemeProvider";

const ThemeToggle = () => {

    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
            }
            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-black/10
                bg-white
                text-[#111111]
                transition-all
                duration-300
                hover:border-[#FF4F87]
                hover:text-[#FF4F87]

                dark:border-white/10
                dark:bg-[#242124]
                dark:text-white
                dark:hover:border-[#FF4F87]
            "
        >
            {theme === "light" ? (
                /* Sun */
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                >
                    <circle cx="12" cy="12" r="4" />

                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </svg>
            ) : (
                /* Moon */
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;