"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/auth_slice";
import { getBrandProfile, clearBrandProfile } from "@/redux/brand/profile/profile_slice";
import ThemeToggle from "@/components/common/ThemeToggle/ThemeToggle";
import BrandNotificationDropdown from "@/components/brand/notifications/BrandNotificationDropdown";

function getInitials(name, email) {
  if (name && typeof name === "string" && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (email && typeof email === "string" && email.trim()) {
    return email.trim()[0].toUpperCase();
  }

  return "BU";
}

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

function UserIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function SettingsIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

const dashboardNavLinks = [
  { name: "Dashboard", href: "/brand/dashboard" },
  { name: "Campaigns", href: "/brand/campaigns" },
  { name: "Discover Creators", href: "/brand/creators" },
  { name: "Bookings", href: "/brand/bookings" },
  { name: "Workspace", href: "/brand/workspace" },
  { name: "Messages", href: "/brand/messages" },
  { name: "Payments", href: "/brand/payments" },
  { name: "Reviews", href: "/brand/reviews" },
];

export default function BrandDashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadedLogoUrl, setLoadedLogoUrl] = useState(null);
  const [failedLogoUrl, setFailedLogoUrl] = useState(null);
  const dropdownRef = useRef(null);

  const { profile, fetchLoading, loading: profileLoading, error: profileError } = useSelector(
    (state) => state.brandProfile || {}
  );
  const isFetching = Boolean(fetchLoading ?? profileLoading);
  const { user: authUser } = useSelector(
    (state) => state.auth || {}
  );

  const isNotFoundError =
    Boolean(profileError) &&
    (typeof profileError === "string"
      ? profileError.toLowerCase().includes("not found")
      : typeof profileError === "object" && typeof profileError?.message === "string"
      ? profileError.message.toLowerCase().includes("not found")
      : false);

  const hasAttemptedFetch = useRef(false);

  useEffect(() => {
    if (!profile && !isFetching && !isNotFoundError && !hasAttemptedFetch.current) {
      hasAttemptedFetch.current = true;
      dispatch(getBrandProfile());
    }
  }, [dispatch, profile, isFetching, isNotFoundError]);

  const userObj = profile?.user || (authUser?.user ? authUser.user : authUser);

  const displayName =
    profile?.companyName ||
    profile?.brandName ||
    userObj?.name ||
    authUser?.name ||
    profile?.name ||
    userObj?.email ||
    authUser?.email ||
    profile?.email ||
    "";

  const displayEmail =
    userObj?.email ||
    authUser?.email ||
    profile?.email ||
    "";

  const brandUserName =
    userObj?.name ||
    authUser?.name ||
    profile?.contactInformation?.name ||
    profile?.companyName ||
    displayName ||
    "Brand User";

  const brandUserEmail =
    userObj?.email ||
    authUser?.email ||
    profile?.contactInformation?.email ||
    displayEmail ||
    "";

  const initials = getInitials(brandUserName, brandUserEmail);

  const cleanLogoUrl = typeof profile?.logo === "string" ? profile.logo.trim() : "";
  const isLoaded = Boolean(cleanLogoUrl) && loadedLogoUrl === cleanLogoUrl;
  const isFailed = Boolean(cleanLogoUrl) && failedLogoUrl === cleanLogoUrl;
  const hasValidLogo = Boolean(cleanLogoUrl) && !isFailed;

  const handleLogout = async () => {
    setDropdownOpen(false);
    setNotificationOpen(false);
    setMobileMenuOpen(false);
    hasAttemptedFetch.current = false;
    dispatch(clearBrandProfile());
    await dispatch(logout());
    router.push("/login");
  };

  const handleDropdownToggle = () => {
    if (!profile && !isFetching && profileError && !isNotFoundError) {
      hasAttemptedFetch.current = true;
      dispatch(getBrandProfile());
    }
    setDropdownOpen((prev) => {
      if (!prev) setNotificationOpen(false);
      return !prev;
    });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setNotificationOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
      `}</style>

      {/* =====================================================
          DESKTOP FLOATING PILL NAVBAR (1024px+)
      ===================================================== */}
      <header className="fixed left-1/2 top-4 z-50 hidden w-[96%] -translate-x-1/2 lg:block xl:top-5 xl:w-[94%] 2xl:w-[90%]">
        <nav
          className="
            flex h-[72px] items-center justify-between
            rounded-full
            border border-border-theme
            bg-surface/95
            px-5
            shadow-[0_8px_30px_rgba(0,0,0,0.05)]
            backdrop-blur-md
            transition-colors duration-300
            xl:h-[78px]
            xl:px-8
          "
        >
          {/* LOGO */}
          <div className="flex items-center justify-start shrink-0">
            <Link
              href="/brand/dashboard"
              className="
                shrink-0
                text-[18px]
                tracking-[-0.04em]
                text-primary
                transition-colors
                duration-300
                xl:text-[22px]
                font-bold
              "
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              CREATORLINK
              <span className="ml-1 text-secondary">✦</span>
            </Link>
          </div>

          {/* DASHBOARD NAVIGATION LINKS */}
          <div className="flex items-center justify-center gap-2 xl:gap-3 2xl:gap-4 overflow-x-auto no-scrollbar py-1">
            {dashboardNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative
                    px-2.5
                    py-1.5
                    text-[12px]
                    font-medium
                    whitespace-nowrap
                    transition-all
                    duration-200
                    hover:-translate-y-[2px]
                    hover:text-secondary
                    xl:px-3
                    xl:text-[13px]
                    2xl:text-[14px]

                    ${isActive
                      ? "text-secondary font-semibold after:absolute after:bottom-[-2px] after:left-2 after:right-2 after:h-[2px] after:bg-secondary"
                      : "text-primary"
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* RIGHT ACTIONS: NOTIFICATIONS, DAY/NIGHT THEME, PROFILE */}
          <div className="flex items-center justify-end gap-3 xl:gap-4 shrink-0">
            {/* Notification Bell Dropdown */}
            <BrandNotificationDropdown
              isOpen={notificationOpen}
              onToggle={() => {
                setNotificationOpen((prev) => {
                  if (!prev) setDropdownOpen(false);
                  return !prev;
                });
              }}
              onClose={() => setNotificationOpen(false)}
            />

            {/* DAY & NIGHT THEME TOGGLE */}
            <ThemeToggle />

            {/* BRAND PROFILE AVATAR & DROPDOWN */}
            <div className="relative pl-1 border-l border-border-theme" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleDropdownToggle}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-muted transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary/15 text-secondary font-semibold font-sans text-xs sm:text-sm flex items-center justify-center border border-secondary/30 shrink-0 uppercase overflow-hidden shadow-2xs">
                  {hasValidLogo ? (
                    <>
                      {!isLoaded && <span className="animate-pulse">{initials}</span>}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={cleanLogoUrl}
                        src={cleanLogoUrl}
                        alt={profile?.companyName || displayName || "Brand logo"}
                        onLoad={() => setLoadedLogoUrl(cleanLogoUrl)}
                        onError={() => setFailedLogoUrl(cleanLogoUrl)}
                        className={`w-full h-full object-cover transition-opacity duration-200 ${
                          isLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
                        }`}
                      />
                    </>
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-surface border border-border-theme rounded-2xl shadow-xl p-2 z-50 text-foreground font-sans select-none animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-border-theme mb-1">
                    <span className="block text-xs font-semibold text-foreground truncate">
                      {displayName || "Brand User"}
                    </span>
                    {displayEmail && (
                      <span className="block text-[10px] text-text-secondary truncate mt-0.5">
                        {displayEmail}
                      </span>
                    )}
                  </div>

                  <Link
                    href="/brand/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors"
                  >
                    <UserIcon />
                    <span>Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/brand/profile");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer text-left"
                  >
                    <SettingsIcon />
                    <span>Settings</span>
                  </button>

                  <div className="pt-1 border-t border-border-theme mt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogoutIcon />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* =====================================================
          MOBILE + TABLET NAVBAR (Below 1024px)
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
          {/* HAMBURGER TOGGLE */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
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
              cursor-pointer
              sm:left-7
            "
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>

          {/* CENTER LOGO */}
          <Link
            href="/brand/dashboard"
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
              <span className="ml-1 text-secondary">✦</span>
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
              gap-2

              min-[400px]:right-4
              sm:right-6
              sm:gap-3
            "
          >
            {/* Notification Bell Dropdown */}
            <BrandNotificationDropdown
              isOpen={notificationOpen}
              onToggle={() => {
                setNotificationOpen((prev) => {
                  if (!prev) setDropdownOpen(false);
                  return !prev;
                });
              }}
              onClose={() => setNotificationOpen(false)}
            />

            {/* DAY & NIGHT THEME TOGGLE */}
            <ThemeToggle />
          </div>
        </nav>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
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
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider px-1 py-1 block">
                Brand Dashboard
              </span>

              {/* DASHBOARD NAVIGATION LINKS */}
              {dashboardNavLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex
                      items-center
                      py-2.5
                      px-3
                      rounded-xl
                      text-[14px]
                      font-medium
                      transition-colors
                      duration-200
                      ${isActive
                        ? "bg-secondary/15 text-secondary font-semibold"
                        : "text-primary hover:text-secondary hover:bg-surface-muted"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* HORIZONTAL DIVIDER */}
              <div className="my-3 h-px w-full bg-border-theme" />

              {/* USER INFO & LOG OUT */}
              <div className="space-y-3 pt-1">
                <div className="px-3.5 py-2.5 rounded-xl bg-surface-muted/60 border border-border-theme">
                  <span className="block text-xs font-semibold text-foreground truncate">
                    {displayName || "Brand User"}
                  </span>
                  {displayEmail && (
                    <span className="block text-[10px] text-text-secondary truncate mt-0.5">
                      {displayEmail}
                    </span>
                  )}
                </div>

                <Link
                  href="/brand/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors"
                >
                  <UserIcon />
                  <span>Profile & Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                >
                  <LogoutIcon />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Layout Spacer so dashboard content smoothly clears the floating pill navbar */}
      <div className="w-full h-[92px] sm:h-[104px] lg:h-[98px] xl:h-[110px] pointer-events-none" aria-hidden="true" />
    </>
  );
}
