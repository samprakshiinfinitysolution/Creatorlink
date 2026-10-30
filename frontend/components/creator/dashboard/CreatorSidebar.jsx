"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/auth_slice";
import { clearProfile } from "@/redux/creator/profile/profile_slice";
import {
  fetchCreatorUnreadNotificationCount,
  markCreatorCategoryNotificationsRead
} from "@/redux/creator/notifications/notifications_slice";

// =========================================================
// SVG ICONS
// =========================================================
function HamburgerIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function DashboardIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}

function PortfolioIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ServicesIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CampaignsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function DiscoverIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function WorkspaceIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function MessagesIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function PaymentsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ReviewsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function NotificationsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function LogoutIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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

// =========================================================
// NAVIGATION CONFIGURATION
// =========================================================
const navItems = [
  { name: "Dashboard", href: "/creator/dashboard", icon: DashboardIcon },
  { name: "Portfolio", href: "/creator/portfolio", icon: PortfolioIcon },
  { name: "Services", href: "/creator/services", icon: ServicesIcon },
  { name: "Campaigns", href: "/creator/campaigns", icon: CampaignsIcon, categories: ["campaign", "booking"] },
  { name: "Discover Campaigns", href: "/creator/campaigns/discover", icon: DiscoverIcon },
  { name: "Workspace", href: "/creator/workspace", icon: WorkspaceIcon, categories: ["workspace"] },
  { name: "Messages", href: "/creator/messages", icon: MessagesIcon, categories: ["message"] },
  { name: "Payments", href: "/creator/payments", icon: PaymentsIcon, categories: ["payment"] },
  { name: "Reviews", href: "/creator/reviews", icon: ReviewsIcon, categories: ["review"] },
  { name: "Notifications", href: "/creator/notifications", icon: NotificationsIcon },
];

function SidebarContent({
  pathname,
  setMobileOpen,
  handleLogout,
  collapsed = false,
  toggleCollapsed = () => {},
  countsByCategory = {}
}) {
  return (
    <div
      className={`flex flex-col h-full bg-surface text-foreground border-r border-border-theme select-none transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Top Header with 3-bar Toggle Button */}
      <div
        className={`border-b border-border-theme flex items-center h-16 shrink-0 transition-all ${
          collapsed ? "justify-center px-2" : "justify-between px-4 sm:px-5"
        }`}
      >
        {!collapsed ? (
          <>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-serif text-lg font-medium tracking-wide text-foreground truncate"
            >
              <span>CREATORLINK</span>
              <span className="text-secondary text-lg leading-none">✦</span>
            </Link>

            {/* Desktop 3-bar toggle button */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden lg:flex p-1.5 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <HamburgerIcon className="w-5 h-5" />
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <CloseIcon />
            </button>
          </>
        ) : (
          /* Collapsed Header: Centered 3-bar Toggle Button */
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <HamburgerIcon className="w-5 h-5 text-secondary" />
          </button>
        )}
      </div>

      {/* Navigation Items List */}
      <nav
        className={`flex-1 space-y-0.5 overflow-y-auto custom-scrollbar transition-all ${
          collapsed ? "px-2 py-2.5" : "px-3 py-3"
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/creator/dashboard" &&
              item.href !== "/creator/campaigns" &&
              pathname?.startsWith(item.href + "/")) ||
            (item.href === "/creator/campaigns" &&
              pathname?.startsWith("/creator/campaigns/") &&
              !pathname?.startsWith("/creator/campaigns/discover"));

          const badgeCount = (item.categories || []).reduce(
            (sum, cat) => sum + (countsByCategory[cat] || 0),
            0
          );

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={item.name}
              className={`flex items-center rounded-xl font-sans font-medium text-[13px] sm:text-[13.5px] transition-all duration-150 group ${
                collapsed
                  ? `justify-center w-full h-10 ${
                      isActive
                        ? "bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] font-semibold"
                        : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                    }`
                  : `gap-2.5 px-3 py-2 ${
                      isActive
                        ? "bg-[#fff0f4] dark:bg-[#2a171f] text-[#ff2d6c] font-semibold"
                        : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                    }`
              }`}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive ? "text-[#ff2d6c]" : "text-text-secondary group-hover:text-foreground"
                  }`}
                />
                {collapsed && badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-bold bg-[#ff2d6c] text-white leading-none shrink-0 shadow-2xs">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.name}</span>
                  {badgeCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold bg-[#ff2d6c] text-white leading-none shrink-0 shadow-2xs">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className={`border-t border-border-theme transition-all ${collapsed ? "p-2" : "p-3"}`}>
        <button
          type="button"
          onClick={handleLogout}
          title="Log Out"
          className={`w-full flex items-center rounded-xl font-sans font-medium text-[13px] sm:text-[13.5px] text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all duration-150 cursor-pointer text-left ${
            collapsed ? "justify-center h-10" : "gap-2.5 px-3 py-2"
          }`}
        >
          <LogoutIcon className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
}

// Persistent memory across client-side page navigation to prevent flicker
let isGlobalCreatorSidebarCollapsed = false;
if (typeof window !== "undefined") {
  try {
    isGlobalCreatorSidebarCollapsed = localStorage.getItem("creator_sidebar_collapsed") === "true";
  } catch {
    // ignore
  }
}

export default function CreatorSidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const countsByCategory = useSelector(
    (state) => state.creatorNotifications?.countsByCategory || {}
  );

  // Fetch unread notification counts on mount
  useEffect(() => {
    dispatch(fetchCreatorUnreadNotificationCount());
  }, [dispatch]);

  // Automatically mark module notifications as read when the module is actively viewed
  const lastMarkedRef = useRef("");

  useEffect(() => {
    if (!pathname) return;

    const matchingItem = navItems.find((item) => {
      if (!item.categories || item.categories.length === 0) return false;
      if (pathname === item.href) return true;
      if (item.href === "/creator/campaigns") {
        return (
          pathname.startsWith("/creator/campaigns/") &&
          !pathname.startsWith("/creator/campaigns/discover")
        );
      }
      return pathname.startsWith(item.href + "/");
    });

    if (!matchingItem) return;

    const unreadCountForModule = matchingItem.categories.reduce(
      (sum, cat) => sum + (countsByCategory[cat] || 0),
      0
    );

    const markKey = `${pathname}:${matchingItem.categories.join(",")}`;

    if (unreadCountForModule > 0 && lastMarkedRef.current !== markKey) {
      lastMarkedRef.current = markKey;
      dispatch(markCreatorCategoryNotificationsRead(matchingItem.categories.join(",")));
    }
  }, [pathname, countsByCategory, dispatch]);

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("creator_sidebar_collapsed");
        if (saved !== null) {
          return saved === "true";
        }
      } catch {
        // ignore
      }
    }
    return isGlobalCreatorSidebarCollapsed;
  });

  // Ensure body class is synchronized
  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("creator-sidebar-collapsed");
    } else {
      document.body.classList.remove("creator-sidebar-collapsed");
    }
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      isGlobalCreatorSidebarCollapsed = next;
      try {
        localStorage.setItem("creator_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      if (next) {
        document.body.classList.add("creator-sidebar-collapsed");
      } else {
        document.body.classList.remove("creator-sidebar-collapsed");
      }
      return next;
    });
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    dispatch(clearProfile());
    await dispatch(logout());
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Fixed Sidebar with Expand / Collapse Transition */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-30 shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <SidebarContent
          pathname={pathname}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogout}
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          countsByCategory={countsByCategory}
        />
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex flex-col w-64 max-w-full h-full shadow-2xl">
            <SidebarContent
              pathname={pathname}
              setMobileOpen={setMobileOpen}
              handleLogout={handleLogout}
              collapsed={false}
              toggleCollapsed={() => {}}
              countsByCategory={countsByCategory}
            />
          </div>
        </div>
      )}
    </>
  );
}
