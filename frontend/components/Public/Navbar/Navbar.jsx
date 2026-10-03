"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle/ThemeToggle";

export default function Navbar() {
    return (
        <header className="fixed left-1/2 top-5 z-50 w-[92%] max-w-7xl -translate-x-1/2">
            <nav
                className="
                    flex
                    items-center
                    justify-between
                    rounded-full
                    border
                    border-black/5
                    bg-white/85
                    px-5
                    py-3
                    shadow-[0_12px_36px_-6px_rgba(255,79,135,0.08)]
                    backdrop-blur-xl
                    transition-colors
                    duration-300
                    dark:border-white/10
                    dark:bg-[#111111]/90
                "
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="
                        shrink-0
                        font-serif
                        text-xl
                        font-bold
                        tracking-tight
                        text-[#111111]
                        dark:text-white
                    "
                >
                    CREATORLINK
                </Link>

                {/* Navigation */}
                <div
                    className="
                        hidden
                        items-center
                        gap-7
                        text-sm
                        font-medium
                        text-black/65
                        md:flex
                        dark:text-white/70
                    "
                >
                    <Link
                        href="/creators"
                        className="transition-colors hover:text-[#FF4F87]"
                    >
                        Creators
                    </Link>

                    <Link
                        href="/brands"
                        className="transition-colors hover:text-[#FF4F87]"
                    >
                        Brands
                    </Link>

                    <Link
                        href="/how-it-works"
                        className="transition-colors hover:text-[#FF4F87]"
                    >
                        How It Works
                    </Link>

                    <Link
                        href="/pricing"
                        className="transition-colors hover:text-[#FF4F87]"
                    >
                        Pricing
                    </Link>

                    <Link
                        href="/about"
                        className="transition-colors hover:text-[#FF4F87]"
                    >
                        About
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <Link
                        href="/login"
                        className="
                            hidden
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-[#111111]
                            transition-opacity
                            hover:opacity-70
                            sm:block
                            dark:text-white
                        "
                    >
                        Log In
                    </Link>

                    <Link
                        href="/signup"
                        className="
                            rounded-full
                            bg-[#111111]
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-md
                            transition-all
                            duration-300
                            hover:bg-[#FF4F87]
                            dark:bg-white
                            dark:text-[#111111]
                            dark:hover:bg-[#FF4F87]
                            dark:hover:text-white
                        "
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    );
}