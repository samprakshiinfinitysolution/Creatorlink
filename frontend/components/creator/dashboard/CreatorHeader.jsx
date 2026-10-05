"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/auth_slice";
import { getCreatorProfile, clearProfile } from "@/redux/creator/profile/profile_slice";
import ThemeToggle from "@/components/common/ThemeToggle/ThemeToggle";

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

  return "CL";
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

function BellIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
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

function ChevronDownIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export default function CreatorHeader({ setMobileOpen = () => { } }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const { profile, loading: profileLoading, error: profileError } = useSelector(
    (state) => state.profile || {}
  );
  const { user: authUser, loading: authLoading } = useSelector(
    (state) => state.auth || {}
  );

  useEffect(() => {
    if (!profile && !profileLoading && !profileError) {
      dispatch(getCreatorProfile());
    }
  }, [dispatch, profile, profileLoading, profileError]);

  const userObj = profile?.user || (authUser?.user ? authUser.user : authUser);

  const displayName =
    userObj?.name ||
    profile?.name ||
    "";

  const displayEmail =
    userObj?.email ||
    profile?.email ||
    "";

  const isDataLoading = (profileLoading || authLoading || (!profile && !authUser)) && !profileError;

  const initials = isDataLoading ? "" : getInitials(displayName, displayEmail);

  const router = useRouter();

  const handleLogout = async () => {
    setDropdownOpen(false);
    dispatch(clearProfile());
    await dispatch(logout());
    router.push("/login");
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
    <header className="sticky top-0 z-20 w-full bg-surface text-foreground border-b border-border-theme px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>

        <div>
          <h1 className="font-serif font-semibold text-lg sm:text-xl text-foreground tracking-tight leading-none">
            Creator Dashboard
          </h1>
          <p className="text-[11px] sm:text-xs text-text-secondary font-sans mt-1 hidden sm:block">
            Overview of your active campaigns, earnings, and services
          </p>
        </div>
      </div>

      {/* Right: Actions & Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notification Icon Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted border border-border-theme transition-colors cursor-pointer"
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface" />
        </button>

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        {/* Creator Profile Chip with Dropdown */}
        <div className="relative pl-2 sm:pl-3 border-l border-border-theme" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface-muted transition-colors cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary/15 text-secondary font-semibold font-sans text-xs sm:text-sm flex items-center justify-center border border-secondary/30 shrink-0 uppercase">
              {initials}
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border-theme rounded-2xl shadow-lg p-1.5 z-50 text-foreground font-sans select-none animate-in fade-in slide-in-from-top-1 duration-150">
              {/* User Summary Header */}
              <div className="px-3 py-2 border-b border-border-theme mb-1">
                <span className="block text-xs font-semibold text-foreground truncate">
                  {displayName || "Creator User"}
                </span>
                {displayEmail && (
                  <span className="block text-[10px] text-text-secondary truncate mt-0.5">
                    {displayEmail}
                  </span>
                )}
              </div>

              {/* 1. Profile */}
              <Link
                href="/creator/profile"
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
