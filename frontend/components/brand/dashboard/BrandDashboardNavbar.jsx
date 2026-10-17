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

function MenuIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

const navLinks = [
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

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-md border-b border-border-theme transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
              href="/brand/dashboard"
              className="flex items-center gap-1.5 font-serif text-lg sm:text-xl font-bold tracking-wider text-foreground hover:opacity-90 transition-opacity shrink-0"
            >
              <span>CREATORLINK</span>
              <span className="text-secondary text-lg leading-none">✦</span>
            </Link>
          </div>

          {/* Desktop Horizontal Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-secondary/15 text-secondary font-semibold shadow-2xs"
                      : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Notifications, Theme Toggle, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

            {/* Brand Profile Avatar Chip with Dropdown */}
            <div className="relative pl-1 sm:pl-2 border-l border-border-theme" ref={dropdownRef}>
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

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border-theme rounded-2xl shadow-xl p-1.5 z-50 text-foreground font-sans select-none animate-in fade-in slide-in-from-top-1 duration-150">
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
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-30 bg-black/50 backdrop-blur-xs flex">
          <div className="w-full max-w-xs bg-surface border-r border-border-theme p-4 flex flex-col justify-between shadow-2xl h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider px-3 py-1.5 block">
                Navigation
              </span>
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium transition-colors ${
                      isActive
                        ? "bg-secondary/15 text-secondary font-semibold"
                        : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border-theme space-y-2">
              <div className="px-3 py-2 rounded-xl bg-surface-muted/50 border border-border-theme">
                <span className="block text-xs font-semibold text-foreground truncate">
                  {displayName || "Brand User"}
                </span>
                {displayEmail && (
                  <span className="block text-[10px] text-text-secondary truncate">
                    {displayEmail}
                  </span>
                )}
              </div>
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
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
}
