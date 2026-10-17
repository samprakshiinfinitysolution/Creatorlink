"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/auth_slice";
import { getBrandProfile, clearBrandProfile } from "@/redux/brand/profile/profile_slice";
import ThemeToggle from "@/components/common/ThemeToggle/ThemeToggle";
import BrandNotificationDropdown from "@/components/brand/notifications/BrandNotificationDropdown";

// Helper function to calculate initials dynamically from name or email
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


export default function BrandHeader({ setMobileOpen = () => { } }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loadedLogoUrl, setLoadedLogoUrl] = useState(null);
  const [failedLogoUrl, setFailedLogoUrl] = useState(null);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
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

  // Authenticated brand user's name for initials fallback
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

  // Logo URL and safe image states
  const cleanLogoUrl = typeof profile?.logo === "string" ? profile.logo.trim() : "";
  const isLoaded = Boolean(cleanLogoUrl) && loadedLogoUrl === cleanLogoUrl;
  const isFailed = Boolean(cleanLogoUrl) && failedLogoUrl === cleanLogoUrl;
  const hasValidLogo = Boolean(cleanLogoUrl) && !isFailed;

  const router = useRouter();

  const handleLogout = async () => {
    setDropdownOpen(false);
    setNotificationOpen(false);
    hasAttemptedFetch.current = false;
    dispatch(clearBrandProfile());
    await dispatch(logout());
    router.push("/login");
  };

  const handleDropdownToggle = () => {
    // If previous fetch failed due to a genuine network/server error, allow retry
    if (!profile && !isFetching && profileError && !isNotFoundError) {
      hasAttemptedFetch.current = true;
      dispatch(getBrandProfile());
    }
    setDropdownOpen((prev) => {
      if (!prev) setNotificationOpen(false);
      return !prev;
    });
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
    <header className="sticky top-0 z-20 w-full bg-surface text-foreground border-b border-border-theme px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors duration-200 min-w-0 max-w-full">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors shrink-0"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="font-serif font-semibold text-base sm:text-xl text-foreground tracking-tight leading-none truncate">
            Brand Dashboard
          </h1>
          <p className="text-[11px] sm:text-xs text-text-secondary font-sans mt-1 hidden sm:block truncate">
            Overview of your active campaigns, creators, and workspace
          </p>
        </div>
      </div>

      {/* Right: Actions & Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        {/* Brand Profile Chip with Dropdown */}
        <div className="relative pl-2 sm:pl-3 border-l border-border-theme" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleDropdownToggle}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-muted transition-colors cursor-pointer text-left focus:outline-none"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary/15 text-secondary font-semibold font-sans text-xs sm:text-sm flex items-center justify-center border border-secondary/30 shrink-0 uppercase overflow-hidden">
              {hasValidLogo ? (
                <>
                  {!isLoaded && (
                    <span className="animate-pulse">{initials}</span>
                  )}
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

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border-theme rounded-2xl shadow-lg p-1.5 z-50 text-foreground font-sans select-none animate-in fade-in slide-in-from-top-1 duration-150">
              {/* User Summary Header */}
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

              {/* 1. Profile */}
              <Link
                href="/brand/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <UserIcon />
                <span>Profile</span>
              </Link>

              {/* 2. Settings */}
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer text-left"
              >
                <SettingsIcon />
                <span>Settings</span>
              </button>

              {/* 3. Log Out */}
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
