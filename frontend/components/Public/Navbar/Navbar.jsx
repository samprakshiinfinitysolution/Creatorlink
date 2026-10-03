"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/common/ThemeToggle/ThemeToggle";

function MenuIcon({ open }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="transition-transform duration-300"
    >
      <line
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        className={`origin-center transition-all duration-300 ${
          open ? "rotate-45 translate-y-[6px]" : ""
        }`}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        className={`origin-center transition-all duration-300 ${
          open ? "opacity-0 scale-x-0" : ""
        }`}
      />
      <line
        x1="4"
        y1="18"
        x2="20"
        y2="18"
        className={`origin-center transition-all duration-300 ${
          open ? "-rotate-45 -translate-y-[6px]" : ""
        }`}
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 8.6c0 5.5-8.8 10.4-8.8 10.4S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />
    </svg>
  );
}

const navItems = [
  { label: "Creators", href: "/creators" },
  { label: "Brands", href: "/brands" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <style>{`
        .dark header nav {
          background: #1b1b1b !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        .dark header nav a:not([class*="dark:text-black"]) {
          color: #ffffff !important;
        }

        .dark header nav a:not([class*="dark:text-black"]):hover {
          color: #ff6b9d !important;
        }

        .dark header nav a:first-child {
          color: #ffffff !important;
        }

        .dark .mobile-menu {
          background: #1b1b1b !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }

        .dark .mobile-menu a:not([class*="dark:text-black"]) {
          color: #ffffff !important;
        }

        .dark .mobile-menu a:not([class*="dark:text-black"]):hover {
          color: #ff6b9d !important;
        }

        .dark .mobile-menu [class*="bg-black/10"] {
          background: rgba(255, 255, 255, 0.12) !important;
        }
      `}</style>
      {/* =====================================================
          DESKTOP NAVBAR
          1024px+
      ===================================================== */}

      <header className="fixed left-1/2 top-4 z-50 hidden w-[94%] -translate-x-1/2 lg:block xl:top-5 xl:w-[88%] 2xl:w-[84%]">
        <nav
          className="
            flex h-[70px] items-center
            rounded-full
            border border-border-theme
            bg-surface/95
            px-5
            shadow-[0_8px_30px_rgba(0,0,0,0.04)]
            backdrop-blur-md
            transition-colors duration-300
            xl:h-[82px]
            xl:px-10
          "
        >
          {/* LOGO */}

          <Link
            href="/"
            className="
              shrink-0
              text-[19px]
              tracking-[-0.04em]
              text-primary
              transition-colors
              duration-300
              xl:text-[25px]
            "
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            CREATORLINK
            <span className="ml-1 text-secondary">•</span>
          </Link>

          {/* MENU */}

          <div className="ml-auto flex items-center gap-4 xl:gap-6 2xl:gap-7">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    relative
                    py-2
                    text-[13px]
                    font-medium
                    text-primary
                    transition-all
                    duration-200
                    hover:-translate-y-[3px]
                    hover:text-secondary
                    xl:text-[15px]

                    ${isActive
                      ? "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-secondary"
                      : ""
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* SEARCH */}

            <button
              type="button"
              aria-label="Search"
              className="
                flex
                shrink-0
                items-center
                justify-center
                text-primary
                transition-all
                duration-200
                hover:-translate-y-1
                hover:text-secondary
              "
            >
              <SearchIcon />
            </button>

            {/* HEART */}

            <button
              type="button"
              aria-label="Favorites"
              className="
                flex
                shrink-0
                items-center
                justify-center
                text-primary
                transition-all
                duration-200
                hover:-translate-y-1
                hover:text-secondary
              "
            >
              <HeartIcon />
            </button>

            {/* SIGN IN */}

            <Link
              href="/signup"
              className="
                shrink-0
                text-[13px]
                font-medium
                text-primary
                transition-all
                duration-200
                hover:-translate-y-1
                hover:text-secondary
                xl:text-[15px]
              "
            >
              Sign Up
            </Link>

            {/* REQUEST ACCESS */}

            <Link
              href="/login"
              className="
                flex
                h-[50px]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary
                px-5
                text-[13px]
                font-semibold
                text-white
                transition-all
                duration-200
                hover:scale-[1.02]
                hover:bg-theme-hover
                dark:bg-primary
                dark:text-black
                xl:h-[48px]
                xl:px-7
                xl:text-[15px]
              "
            >
              Log in
            </Link>

            {/* THEME */}

            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* =====================================================
          MOBILE + TABLET NAVBAR
          Below 1024px
      ===================================================== */}

      <header className="fixed left-0 top-0 z-50 w-full lg:hidden">
        <nav
          className="
            relative
            h-[92px]
            border-b
            border-border-theme
            bg-surface/95
            backdrop-blur-md
            transition-colors
            duration-300
            sm:h-[104px]
          "
        >
          {/* HAMBURGER */}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="
              absolute
              left-5
              top-1/2
              flex
              -translate-y-1/2
              items-center
              justify-center
              text-primary
              transition-colors
              hover:text-secondary
              sm:left-7
            "
          >
            <MenuIcon open={open} />
          </button>

          {/* CENTER LOGO */}

          <Link
            href="/"
            className="
              absolute
              left-[68px]
              right-[125px]
              top-1/2
              -translate-y-1/2
              text-center
              text-primary

              min-[400px]:left-[78px]
              min-[400px]:right-[135px]

              sm:left-[90px]
              sm:right-[145px]
            "
          >
            <div
              className="
                whitespace-nowrap
                text-[15px]
                tracking-[-0.04em]

                min-[375px]:text-[17px]
                min-[400px]:text-[18px]
                sm:text-[21px]
              "
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              CREATORLINK
              <span className="ml-1 text-secondary">•</span>
            </div>

            <div
              className="
                mt-1
                whitespace-nowrap
                text-[8px]
                font-medium
                tracking-[0.12em]
                text-secondary

                min-[400px]:text-[9px]
                sm:text-[10px]
              "
            >
              TOP 1% CURATED SALON
            </div>
          </Link>

          {/* RIGHT ACTIONS */}

          <div
            className="
              absolute
              right-3
              top-1/2
              flex
              -translate-y-1/2
              items-center
              gap-1

              min-[400px]:right-4
              min-[400px]:gap-2

              sm:right-6
              sm:gap-3
            "
          >
            {/* BELL */}

            <button
              type="button"
              aria-label="Notifications"
              className="
                relative
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                text-primary
                transition-colors
                hover:text-secondary
              "
            >
              <BellIcon />

              <span className="absolute right-[5px] top-[6px] h-[5px] w-[5px] rounded-full bg-secondary" />
            </button>

            {/* SEARCH */}

            <button
              type="button"
              aria-label="Search"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                text-primary
                transition-colors
                hover:text-secondary
              "
            >
              <SearchIcon />
            </button>

            {/* THEME */}

            <ThemeToggle />
          </div>
        </nav>

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        {open && (
          <div
            className="
              mobile-menu
              h-[calc(100dvh-92px)]
              sm:h-[calc(100dvh-104px)]
              w-full
              overflow-y-auto
              border-b
              border-border-theme
              bg-surface
              px-6
              pt-4
              pb-8
              shadow-xl
              transition-colors
              duration-300
            "
          >
            <div className="flex flex-col gap-1">
              {/* MAIN NAVIGATION LINKS */}
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex
                      items-center
                      py-2.5
                      text-[15px]
                      font-medium
                      transition-colors
                      duration-200
                      ${isActive ? "text-secondary font-semibold" : "text-primary hover:text-secondary"}
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* HORIZONTAL DIVIDER AFTER ABOUT */}
              <div className="my-2.5 h-px w-full bg-border-theme" />

              {/* AUTHENTICATION AREA */}
              <div className="flex flex-col gap-3 pt-1">
                {/* SIGN UP */}
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className={`
                    flex
                    items-center
                    py-2
                    text-[15px]
                    font-medium
                    transition-colors
                    duration-200
                    ${pathname === "/signup" ? "text-secondary font-semibold" : "text-primary hover:text-secondary"}
                  `}
                >
                  Sign Up
                </Link>

                {/* LOG IN */}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="
                    mt-1
                    flex
                    h-[46px]
                    w-full
                    max-w-[200px]
                    items-center
                    justify-center
                    rounded-full
                    bg-primary
                    text-[14px]
                    font-semibold
                    text-white
                    shadow-xs
                    transition-all
                    duration-200
                    hover:scale-[1.02]
                    hover:bg-theme-hover
                    dark:bg-primary
                    dark:text-black
                    dark:hover:bg-theme-hover
                  "
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}