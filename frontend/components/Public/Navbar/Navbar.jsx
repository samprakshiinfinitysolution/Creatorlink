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
      width="22"
      height="22"
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

  // Handle background scroll locking when mobile menu is active
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

  // Close menu automatically upon route transition
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Close menu if viewport expands to desktop breakpoint (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
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

        @keyframes mobileMenuSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-menu-animate {
          animation: mobileMenuSlideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .mobile-menu-animate {
            animation: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          DESKTOP & TABLET PILL NAVBAR
          768px+ (md and above)
          (Seamless responsive scaling across md, lg, xl, and 2xl)
      ===================================================== */}

      <header className="fixed left-1/2 top-3 md:top-4 z-50 hidden w-[96%] md:w-[94%] max-w-[1536px] -translate-x-1/2 md:block xl:top-5 xl:w-[88%] 2xl:w-[84%]">
        <nav
          className="
            flex h-[66px] md:h-[70px] xl:h-[82px] items-center justify-between
            rounded-full
            border border-border-theme
            bg-surface/95
            px-3.5 md:px-5 lg:px-6 xl:px-10
            shadow-[0_8px_30px_rgba(0,0,0,0.04)]
            backdrop-blur-md
            transition-colors duration-300
          "
        >
          {/* LOGO */}

          <div className="flex items-center justify-start shrink-0">
            <Link
              href="/"
              className="
                shrink-0
                text-[16px]
                md:text-[18px]
                lg:text-[19px]
                xl:text-[25px]
                tracking-[-0.04em]
                text-primary
                transition-colors
                duration-300
              "
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              CREATORLINK
              <span className="ml-1 text-secondary">✦</span>
            </Link>
          </div>

          {/* NAVIGATION LINKS */}

          <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap-4 xl:gap-6 2xl:gap-7 shrink-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    relative
                    py-2
                    text-[12px]
                    md:text-[12.5px]
                    lg:text-[13px]
                    xl:text-[15px]
                    font-medium
                    text-primary
                    whitespace-nowrap
                    transition-all
                    duration-200
                    hover:-translate-y-[3px]
                    hover:text-secondary

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
          </div>

          {/* RIGHT ACTIONS */}

          <div className="flex items-center justify-end gap-2 md:gap-2.5 lg:gap-3.5 xl:gap-6 2xl:gap-7 shrink-0">
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

            {/* HEART (Wishlist: clean on xl 1280px+) */}

            <button
              type="button"
              aria-label="Favorites"
              className="
                hidden
                xl:flex
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
                text-[12px]
                md:text-[12.5px]
                lg:text-[13px]
                xl:text-[15px]
                font-medium
                text-primary
                transition-all
                duration-200
                hover:-translate-y-1
                hover:text-secondary
              "
            >
              Sign Up
            </Link>

            {/* REQUEST ACCESS */}

            <Link
              href="/login"
              className="
                flex
                h-[40px]
                md:h-[44px]
                lg:h-[48px]
                xl:h-[48px]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary
                px-3.5
                md:px-4
                lg:px-5
                xl:px-7
                text-[12px]
                md:text-[12.5px]
                lg:text-[13px]
                xl:text-[15px]
                font-semibold
                text-white
                transition-all
                duration-200
                hover:scale-[1.02]
                hover:bg-theme-hover
                dark:bg-primary
                dark:text-black
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
          MOBILE NAVBAR
          Below 768px (md)
      ===================================================== */}

      <header className="fixed left-0 top-0 z-50 w-full md:hidden">
        <nav
          className="
            relative
            h-[90px]
            border-b
            border-border-theme
            bg-surface/95
            backdrop-blur-md
            transition-colors
            duration-300
            sm:h-[104px]
          "
        >
          {/* HAMBURGER BUTTON (Comfortable touch target min 44x44px) */}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="
              absolute
              left-2
              top-1/2
              -translate-y-1/2
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              text-primary
              transition-colors
              hover:text-secondary
              hover:bg-black/5
              dark:hover:bg-white/5
              active:scale-95
              cursor-pointer
              min-[360px]:left-2.5
              min-[400px]:left-3.5
              sm:left-6
            "
          >
            <MenuIcon open={open} />
          </button>

          {/* CENTER LOGO (True mathematical center alignment with adaptive scaling) */}

          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              flex
              flex-col
              items-center
              justify-center
              text-center
              text-primary
              transition-opacity
              hover:opacity-85
              max-w-[calc(100%-145px)]
              min-[375px]:max-w-[calc(100%-175px)]
              min-[430px]:max-w-[calc(100%-215px)]
              sm:max-w-[calc(100%-250px)]
            "
          >
            <div
              className="
                truncate
                text-[13.5px]
                tracking-[-0.03em]
                leading-tight
                min-[340px]:text-[14.5px]
                min-[360px]:text-[16px]
                min-[400px]:text-[18px]
                sm:text-[21px]
              "
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              CREATORLINK
              <span className="ml-1 text-secondary">✦</span>
            </div>

            <div
              className="
                mt-0.5
                truncate
                text-[7px]
                font-medium
                tracking-[0.14em]
                text-secondary
                leading-tight
                min-[340px]:text-[7.5px]
                min-[360px]:text-[8.5px]
                min-[400px]:text-[9px]
                sm:text-[10px]
              "
            >
              TOP 1% CURATED SALON
            </div>
          </Link>

          {/* RIGHT ACTIONS (Responsively balanced across device widths) */}

          <div
            className="
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              flex
              items-center
              gap-1
              min-[360px]:right-2.5
              min-[400px]:right-3.5
              min-[400px]:gap-1.5
              sm:right-6
              sm:gap-2.5
            "
          >
            {/* WISHLIST / FAVORITES (Shown on tablet and landscape phablets >= 540px) */}

            <button
              type="button"
              aria-label="Favorites"
              className="
                hidden
                min-[540px]:flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                text-primary
                transition-all
                hover:bg-black/5
                hover:text-secondary
                dark:hover:bg-white/5
                active:scale-95
                cursor-pointer
                sm:h-10
                sm:w-10
              "
            >
              <HeartIcon />
            </button>

            {/* NOTIFICATIONS (Shown on large mobile >= 430px) */}

            <button
              type="button"
              aria-label="Notifications"
              className="
                relative
                hidden
                min-[430px]:flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                text-primary
                transition-all
                hover:bg-black/5
                hover:text-secondary
                dark:hover:bg-white/5
                active:scale-95
                cursor-pointer
                sm:h-10
                sm:w-10
              "
            >
              <BellIcon />
              <span className="absolute right-[6px] top-[7px] h-[5px] w-[5px] rounded-full bg-secondary" />
            </button>

            {/* SEARCH (Always accessible across all mobile devices) */}

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
                rounded-full
                text-primary
                transition-all
                hover:bg-black/5
                hover:text-secondary
                dark:hover:bg-white/5
                active:scale-95
                cursor-pointer
                sm:h-10
                sm:w-10
              "
            >
              <SearchIcon />
            </button>

            {/* THEME TOGGLE (Always accessible across all mobile devices) */}

            <ThemeToggle />
          </div>
        </nav>

        {/* =====================================================
            MOBILE MENU DRAWER
        ===================================================== */}

        {open && (
          <div
            className="
              mobile-menu
              mobile-menu-animate
              fixed
              inset-x-0
              top-[90px]
              sm:top-[104px]
              h-[calc(100dvh-90px)]
              sm:h-[calc(100dvh-104px)]
              w-full
              overflow-y-auto
              border-b
              border-border-theme
              bg-surface
              px-5
              pt-4
              pb-10
              shadow-2xl
              transition-colors
              duration-300
              sm:px-8
            "
          >
            <div className="mx-auto flex max-w-md flex-col gap-1">
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
                      justify-between
                      rounded-xl
                      px-3.5
                      py-3
                      text-[16px]
                      font-medium
                      transition-all
                      duration-200
                      hover:bg-black/5
                      dark:hover:bg-white/5
                      ${isActive
                        ? "text-secondary font-semibold bg-secondary/10 dark:bg-secondary/15"
                        : "text-primary hover:text-secondary"
                      }
                    `}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="text-xs font-mono text-secondary">✦</span>
                    )}
                  </Link>
                );
              })}

              {/* HORIZONTAL DIVIDER AFTER ABOUT */}
              <div className="my-3 h-px w-full bg-border-theme" />

              {/* QUICK SHORTCUTS FOR SMALL MOBILE (<430px) */}
              <div className="flex items-center justify-around py-2 min-[430px]:hidden border-b border-border-theme/60 mb-2">
                <button
                  type="button"
                  aria-label="Favorites"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:text-secondary text-xs font-medium cursor-pointer"
                >
                  <HeartIcon />
                  <span>Wishlist</span>
                </button>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:text-secondary text-xs font-medium cursor-pointer"
                >
                  <span className="relative">
                    <BellIcon />
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-secondary" />
                  </span>
                  <span>Alerts</span>
                </button>
              </div>

              {/* AUTHENTICATION AREA */}
              <div className="flex flex-col gap-3 pt-1">
                {/* SIGN UP */}
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className={`
                    flex
                    items-center
                    rounded-xl
                    px-3.5
                    py-2.5
                    text-[16px]
                    font-medium
                    transition-colors
                    duration-200
                    hover:bg-black/5
                    dark:hover:bg-white/5
                    ${pathname === "/signup"
                      ? "text-secondary font-semibold bg-secondary/10 dark:bg-secondary/15"
                      : "text-primary hover:text-secondary"
                    }
                  `}
                >
                  Sign Up
                </Link>

                {/* LOG IN */}
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="
                    mt-2
                    flex
                    h-[48px]
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-primary
                    text-[15px]
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:scale-[1.01]
                    hover:bg-theme-hover
                    active:scale-[0.99]
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
