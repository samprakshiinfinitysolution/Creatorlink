"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "@/redux/admin/auth/admin_auth_slice";
import ThemeToggle from "@/components/common/ThemeToggle/ThemeToggle";

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

function ShieldCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
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

export default function AdminHeader({ setMobileOpen = () => {} }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { adminUser: user } = useSelector((state) => state.adminAuth || {});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await dispatch(adminLogout());
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  const adminInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : "AD";

  return (
    <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-border-theme h-16 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Menu Trigger & Portal Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold tracking-wide uppercase">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Admin Console</span>
        </div>
      </div>

      {/* Right: Theme Toggle & Admin Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Theme Toggle */}
        <ThemeToggle />

        {/* Profile Avatar & Actions */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-surface-muted transition-colors cursor-pointer select-none"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary border border-secondary/30 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {adminInitials}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <ChevronDownIcon className="hidden sm:block text-text-secondary" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-border-theme shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-border-theme">
                <p className="text-xs font-bold text-foreground truncate">{user?.name || "Administrator"}</p>
                <p className="text-[11px] text-text-secondary truncate">{user?.email || "admin@creatorlink.com"}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider">
                  Role: Admin
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-foreground hover:bg-surface-muted transition-colors"
                >
                  <SettingsIcon className="text-text-secondary" />
                  <span>Platform Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-border-theme">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                >
                  <LogoutIcon />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

