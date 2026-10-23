"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/auth_slice";
import { getBrandProfile, clearBrandProfile } from "@/redux/brand/profile/profile_slice";
import ThemeToggle from "@/components/common/ThemeToggle/ThemeToggle";
import BrandNotificationDropdown from "@/components/brand/notifications/BrandNotificationDropdown";

// =========================================================
// SVG ICONS
// =========================================================
function MenuIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function MegaphoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function SettingsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
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

function LogoutIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export default function BrandHeader({ setMobileOpen = () => { } }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
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
    profile?.contactInformation?.name ||
    userObj?.name ||
    authUser?.name ||
    profile?.companyName ||
    profile?.brandName ||
    profile?.name ||
    "Emma Hoyer";

  const displayRole =
    profile?.contactInformation?.designation ||
    profile?.designation ||
    profile?.role ||
    "Marketing manager";

  const displayEmail =
    userObj?.email ||
    authUser?.email ||
    profile?.email ||
    "emma.hoyer@brand.com";

  // Initial letter (matching the user's reference image avatar: pink circle with "E")
  const initial = (displayName && displayName.trim().length > 0)
    ? displayName.trim()[0].toUpperCase()
    : "E";

  // Logo URL and safe image states
  const cleanLogoUrl = typeof profile?.logo === "string" ? profile.logo.trim() : "";
  const isLoaded = Boolean(cleanLogoUrl) && loadedLogoUrl === cleanLogoUrl;
  const isFailed = Boolean(cleanLogoUrl) && failedLogoUrl === cleanLogoUrl;
  const hasValidLogo = Boolean(cleanLogoUrl) && !isFailed;

  const handleLogout = async () => {
    setDropdownOpen(false);
    setNotificationOpen(false);
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

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    if (pathname?.includes("/brand/campaigns")) {
      router.push(`/brand/campaigns?search=${encodeURIComponent(q)}`);
    } else {
      router.push(`/brand/creators?search=${encodeURIComponent(q)}`);
    }
  };

  // Close dropdown on click outside or Escape key
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
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-md text-foreground border-b border-border-theme px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-6 transition-colors duration-200 min-w-0 max-w-full">
      {/* Left Section: Mobile Menu Toggle + Modern White Searchbar */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0 max-w-xl">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors shrink-0"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* White Search Bar with Gray Right Button (Turns Pink on Hover) */}
        <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div className="w-full flex items-center bg-white dark:bg-surface border border-slate-200/90 dark:border-border-theme rounded-full shadow-2xs pl-2.5 sm:pl-4 pr-1 sm:pr-1.5 py-1 sm:py-1.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#ff2d6c]/25 focus-within:border-[#ff2d6c]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search..."
              className="w-full min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-text-secondary/60 pr-1.5 truncate"
            />
            {/* Black search icon button on the right by default */}
            <button
              type="button"
              onClick={handleSearch}
              title="Search"
              className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#252525] text-white hover:bg-[#111111] transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xs hover:shadow-md hover:shadow-black/20 group"
            >
              <SearchIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Section: Announcements, Divider, Settings, Notifications, Theme Toggle, Profile */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* 1. Megaphone / Announcement Icon */}
        <button
          type="button"
          onClick={() => router.push("/brand/notifications")}
          title="Announcements & Updates"
          className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-text-secondary hover:text-[#ff2d6c] hover:bg-slate-100 dark:hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <MegaphoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* 2. Vertical Divider */}
        <div className="hidden sm:block h-4 sm:h-5 w-[1px] bg-slate-200 dark:bg-border-theme shrink-0 mx-0.5" />

        {/* 3. Settings Gear Icon */}
        <Link
          href="/brand/profile"
          title="Settings & Profile"
          className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-text-secondary hover:text-[#ff2d6c] hover:bg-slate-100 dark:hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>

        {/* 4. Notification Bell Dropdown */}
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

        {/* 5. Dark / Light Theme Toggle */}
        <ThemeToggle />

        {/* 6. Brand Profile Section (Matching Reference: Pink Avatar + Emma Hoyer + Marketing manager + Chevron) */}
        <div className="relative pl-1 sm:pl-2" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleDropdownToggle}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2 sm:py-1 rounded-full hover:bg-slate-100 dark:hover:bg-surface-muted transition-colors cursor-pointer text-left focus:outline-none group"
          >
            {/* Circular Pink Avatar */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ff2d6c] text-white font-bold font-sans text-xs sm:text-sm flex items-center justify-center shrink-0 uppercase shadow-xs overflow-hidden">
              {hasValidLogo ? (
                <>
                  {!isLoaded && <span>{initial}</span>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={cleanLogoUrl}
                    src={cleanLogoUrl}
                    alt={displayName}
                    onLoad={() => setLoadedLogoUrl(cleanLogoUrl)}
                    onError={() => setFailedLogoUrl(cleanLogoUrl)}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
                      }`}
                  />
                </>
              ) : (
                <span>{initial}</span>
              )}
            </div>

            {/* Profile Name & Role (Hidden on small mobile) */}
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-[#ff2d6c] transition-colors truncate max-w-[110px] lg:max-w-[150px]">
                {displayName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-text-secondary truncate max-w-[110px] lg:max-w-[150px]">
                {displayRole}
              </span>
            </div>

            {/* Dropdown Chevron Down */}
            <ChevronDownIcon
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-foreground transition-transform duration-200 shrink-0 ${dropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border-theme rounded-2xl shadow-xl p-2 z-50 text-foreground font-sans select-none animate-in fade-in slide-in-from-top-1 duration-150">
              {/* User Summary Header */}
              <div className="px-3 py-2 border-b border-border-theme mb-1">
                <span className="block text-xs font-semibold text-foreground truncate">
                  {displayName}
                </span>
                <span className="block text-[11px] text-text-secondary truncate mt-0.5">
                  {displayRole}
                </span>
                {displayEmail && (
                  <span className="block text-[10px] text-slate-400 dark:text-text-secondary truncate mt-0.5">
                    {displayEmail}
                  </span>
                )}
              </div>

              {/* Profile Link */}
              <Link
                href="/brand/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <UserIcon />
                <span>Profile Details</span>
              </Link>

              {/* Settings Link */}
              <Link
                href="/brand/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <SettingsIcon />
                <span>Settings</span>
              </Link>

              {/* Log Out Button */}
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
    </header>
  );
}
