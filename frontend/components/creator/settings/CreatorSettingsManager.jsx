"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import ChangePasswordForm from "@/components/common/Security/ChangePasswordForm";

// =========================================================
// SVG ICONS
// =========================================================
function InstagramIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2.5} />
    </svg>
  );
}

function UsersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.805 3.75 3.75 0 00-5.741-3.238M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-15 9a5.25 5.25 0 0110.5 0v.75H6v-.75z" />
    </svg>
  );
}

function PhotoIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ChartBarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function HeartIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function ChatBubbleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.84-.84 4.542 4.542 0 00.99-2.073A7.838 7.838 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function SyncArrowsIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function SpinnerIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function AlertCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function InfoCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

function ShieldLockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function UserCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ArrowTopRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}

function ClockIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function formatSyncDateWithTime(dateValue) {
  if (!dateValue) return "Sync time unavailable";
  const date = new Date(dateValue);
  const time = date.getTime();
  if (!Number.isFinite(time) || isNaN(time) || time <= 0) {
    return "Sync time unavailable";
  }

  try {
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date).toLowerCase();

    return `Last synced: ${formattedDate}, ${formattedTime}`;
  } catch {
    return "Sync time unavailable";
  }
}

function formatMetricCount(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num) || isNaN(num) || num < 0) return "—";
  return num.toLocaleString();
}

export default function CreatorSettingsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastProcessedQueryRef = useRef("");

  const { user: authUser } = useSelector((state) => state.auth || {});

  // Fetch connected Instagram account details from backend
  const fetchConnectedAccount = useCallback(() => {
    return axiosInstance
      .get("/creator/instagram/account")
      .then((res) => {
        const accountData = res.data?.data?.account;
        if (accountData) {
          setConnectedAccount(accountData);
        } else {
          setConnectedAccount(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch connected Instagram account:", err);
        setConnectedAccount(null);
      })
      .finally(() => {
        setIsLoadingAccount(false);
      });
  }, []);

  // Initial fetch on mount using fetchConnectedAccount
  useEffect(() => {
    fetchConnectedAccount();
  }, [fetchConnectedAccount]);

  // Handle Meta OAuth callback query parameters
  useEffect(() => {
    if (!searchParams) return;
    const instagramStatus = searchParams.get("instagram");
    if (!instagramStatus) return;

    const currentQueryKey = searchParams.toString();
    if (lastProcessedQueryRef.current === currentQueryKey) return;
    lastProcessedQueryRef.current = currentQueryKey;

    let nextFeedback = null;
    if (instagramStatus === "success") {
      const rawUser = searchParams.get("username")?.trim();
      const displayUser = rawUser
        ? rawUser.startsWith("@")
          ? rawUser
          : `@${rawUser}`
        : null;

      nextFeedback = {
        type: "success",
        message: displayUser
          ? `Instagram account ${displayUser} connected successfully!`
          : "Instagram account connected successfully!",
      };
    } else if (instagramStatus === "error") {
      const rawMessage = searchParams.get("message")?.trim();
      nextFeedback = {
        type: "error",
        message: rawMessage || "Instagram authorization failed. Please try again.",
      };
    } else if (instagramStatus === "cancelled") {
      nextFeedback = {
        type: "warning",
        message: "Instagram connection was cancelled. No changes were made.",
      };
    } else if (instagramStatus === "multiple_accounts") {
      nextFeedback = {
        type: "info",
        message:
          "Multiple Instagram Professional accounts were found. Please ensure only one account is linked to your Facebook page.",
      };
    }

    if (nextFeedback) {
      setTimeout(() => {
        setFeedback(nextFeedback);
        if (instagramStatus === "success") {
          fetchConnectedAccount();
        }
      }, 0);
    }

    // Clean query parameters from URL without triggering unnecessary page reloads
    const params = new URLSearchParams(searchParams.toString());
    params.delete("instagram");
    params.delete("username");
    params.delete("message");
    const newQuery = params.toString();
    const cleanUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(cleanUrl, { scroll: false });
  }, [searchParams, router, pathname, fetchConnectedAccount]);

  // Initiate Instagram OAuth flow
  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    setFeedback(null);
    try {
      const res = await axiosInstance.get("/creator/instagram/connect");
      const authUrl = res.data?.data?.authUrl;

      if (!authUrl || typeof authUrl !== "string") {
        throw new Error("Authorization URL was not returned by the server.");
      }

      window.location.href = authUrl;
    } catch (err) {
      console.error("Instagram connect error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to initiate Instagram connection. Please try again.";
      setFeedback({
        type: "error",
        message: errorMsg,
      });
      setIsConnecting(false);
    }
  };

  // Handle manual refresh / sync of Instagram metrics
  const handleRefreshMetrics = async () => {
    if (isRefreshing || !connectedAccount) return;
    setIsRefreshing(true);
    setFeedback(null);

    try {
      const res = await axiosInstance.post("/creator/instagram/refresh");
      const updatedData = res.data?.data?.account;
      if (updatedData) {
        setConnectedAccount(updatedData);
      }
      setFeedback({
        type: "success",
        message: res.data?.message || "Instagram metrics refreshed successfully!",
      });
    } catch (err) {
      console.error("Failed to refresh Instagram metrics:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to refresh Instagram metrics. Please try again later.";
      setFeedback({
        type: "error",
        message: errorMsg,
      });
      // If unauthorized/expired, reload account details
      if (err.response?.status === 401) {
        fetchConnectedAccount();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const isExpired = connectedAccount?.status === "EXPIRED";
  const isConnected = Boolean(connectedAccount) && !isExpired;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Settings Main Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 w-full min-w-0">
          {/* Header Title & Actions Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="mb-2">
                <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                  ACCOUNT MANAGEMENT
                </span>
              </div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-foreground tracking-wide">
                Creator Settings
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
                Manage your connected social accounts, security credentials, and session security.
              </p>
            </div>

            {/* Quick Profile Link */}
            <Link
              href="/creator/profile"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#252525] hover:bg-[#111111] dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <UserCircleIcon className="w-4 h-4" />
              <span>Edit Profile Details</span>
              <ArrowTopRightIcon className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Instagram Integration Section */}
          <section className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            {/* Header: Instagram icon on top-left, title and description, Connected badge on top-right */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[#171717] dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-neutral-700">
                  <InstagramIcon className="w-5 h-5 text-[#171717] dark:text-neutral-100" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground font-sans tracking-tight">
                    Instagram Integration
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5 font-sans">
                    Connect your Instagram Professional account to sync verified metrics and portfolio content.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isLoadingAccount ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/10 animate-pulse shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400/50" />
                  <span className="h-3 w-16 bg-neutral-400/20 rounded" />
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 shrink-0">
                  <AlertCircleIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Connection Expired</span>
                </span>
              ) : isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>Ready to Connect</span>
                </span>
              )}
            </div>

            {/* Notification Alert Banner */}
            {feedback && (
              <div
                className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl text-xs font-sans animate-in fade-in duration-200 ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : feedback.type === "error"
                    ? "bg-red-500/10 border border-red-500/20 text-red-500"
                    : feedback.type === "warning"
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {feedback.type === "success" ? (
                    <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : feedback.type === "warning" ? (
                    <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-500" />
                  ) : feedback.type === "info" ? (
                    <InfoCircleIcon className="w-4 h-4 shrink-0 text-blue-500" />
                  ) : (
                    <AlertCircleIcon className="w-4 h-4 shrink-0 text-red-500" />
                  )}
                  <span className="leading-relaxed font-medium">{feedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-foreground/50 hover:text-foreground text-xs font-semibold cursor-pointer shrink-0 ml-1 transition-colors"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Middle Section: Account Information and 3 Metrics */}
            {isLoadingAccount ? (
              <div className="space-y-4 animate-pulse pt-1">
                <div className="h-4 w-48 bg-foreground/10 rounded" />
                <div className="h-6 w-60 bg-foreground/10 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-foreground/10 rounded-full" />
                  <div className="h-6 w-28 bg-foreground/10 rounded-full" />
                </div>
              </div>
            ) : connectedAccount ? (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
                {/* Left: Account title, handle, and pills */}
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-foreground font-sans">
                    Instagram Professional Account
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-lg sm:text-xl font-bold text-foreground font-sans tracking-tight">
                      @{connectedAccount.username}
                    </span>
                    <a
                      href={`https://instagram.com/${connectedAccount.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#171717] dark:text-neutral-200 hover:text-[#ff2d6c] transition-colors p-0.5"
                      title="View profile on Instagram"
                    >
                      <ExternalLinkIcon className="w-4 h-4 text-[#171717] dark:text-neutral-200" />
                    </a>
                  </div>

                  {isExpired && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium pt-1">
                      <AlertCircleIcon className="w-4 h-4 shrink-0" />
                      <span>
                        {connectedAccount.disconnectionReason || "Instagram connection expired. Please reconnect."}
                      </span>
                    </div>
                  )}

                  {/* Avg Likes & Avg Comments Pills */}
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {typeof connectedAccount.averageLikes === "number" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60">
                        <HeartIcon className="w-3.5 h-3.5 text-[#171717] dark:text-neutral-200" />
                        <span>{connectedAccount.averageLikes.toLocaleString()} Avg Likes</span>
                      </span>
                    )}
                    {typeof connectedAccount.averageComments === "number" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60">
                        <ChatBubbleIcon className="w-3.5 h-3.5 text-[#171717] dark:text-neutral-200" />
                        <span>{connectedAccount.averageComments.toLocaleString()} Avg Comments</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Three metrics arranged horizontally */}
                <div className="flex items-center gap-5 sm:gap-8 lg:gap-10 flex-wrap">
                  {/* Followers */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-[#171717] dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-neutral-700">
                      <UsersIcon className="w-5 h-5 text-[#171717] dark:text-neutral-100" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground font-sans tracking-tight leading-none">
                        {formatMetricCount(connectedAccount.followersCount)}
                      </div>
                      <div className="text-xs text-text-secondary font-medium font-sans mt-1">
                        Followers
                      </div>
                    </div>
                  </div>

                  {/* Posts */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-[#171717] dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-neutral-700">
                      <PhotoIcon className="w-5 h-5 text-[#171717] dark:text-neutral-100" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground font-sans tracking-tight leading-none">
                        {formatMetricCount(connectedAccount.mediaCount)}
                      </div>
                      <div className="text-xs text-text-secondary font-medium font-sans mt-1">
                        Posts
                      </div>
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-[#171717] dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200/60 dark:border-neutral-700">
                      <ChartBarIcon className="w-5 h-5 text-[#171717] dark:text-neutral-100" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground font-sans tracking-tight leading-none">
                        {typeof connectedAccount.engagementRate === "number"
                          ? `${connectedAccount.engagementRate}%`
                          : "Unavailable"}
                      </div>
                      <div className="text-xs text-text-secondary font-medium font-sans mt-1">
                        Engagement
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs sm:text-sm font-semibold text-foreground font-sans">
                  Instagram Professional Account
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-lg leading-relaxed font-sans">
                  Connecting your account verifies your follower count, media statistics, and posts directly via official Meta APIs.
                </p>
              </div>
            )}

            {/* Footer: Last synced on left, Sync Metrics & Reconnect on right */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border-theme">
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium font-sans">
                <ClockIcon className="w-4 h-4 text-[#171717] dark:text-neutral-300 shrink-0" />
                <span>
                  {connectedAccount
                    ? formatSyncDateWithTime(connectedAccount.lastSyncedAt || connectedAccount.updatedAt)
                    : "Sync time unavailable"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {connectedAccount && !isExpired && (
                  <button
                    type="button"
                    onClick={handleRefreshMetrics}
                    disabled={isRefreshing || isConnecting}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-900 dark:text-neutral-100 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? (
                      <>
                        <SpinnerIcon className="w-3.5 h-3.5 text-[#171717] dark:text-white" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <SyncArrowsIcon className="w-3.5 h-3.5 text-[#171717] dark:text-neutral-200" />
                        <span>Sync Metrics</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConnectInstagram}
                  disabled={isConnecting || isRefreshing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#ff2d6c] hover:bg-[#e0144c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <SpinnerIcon className="w-3.5 h-3.5 text-white" />
                      <span>Connecting...</span>
                    </>
                  ) : connectedAccount ? (
                    <>
                      <InstagramIcon className="w-3.5 h-3.5 text-white" />
                      <span>Reconnect Instagram</span>
                    </>
                  ) : (
                    <>
                      <InstagramIcon className="w-3.5 h-3.5 text-white" />
                      <span>Connect Instagram</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Security & Authentication Section */}
          <section className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-theme">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff0f4] dark:bg-[#2a171f] text-black dark:text-white flex items-center justify-center shrink-0">
                  <ShieldLockIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground font-sans">
                    Security & Authentication
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Manage your password, account credentials, and session security.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Protected
              </span>
            </div>

            {/* Change Password Form Component */}
            <ChangePasswordForm />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-text-secondary">
              <div className="p-3 rounded-xl bg-surface-muted/30 border border-border-theme">
                <span className="block font-medium text-foreground mb-1">Session Protection</span>
                <span>HttpOnly secure cookies protect your authentication tokens from client-side script tampering.</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-muted/30 border border-border-theme">
                <span className="block font-medium text-foreground mb-1">Account Role</span>
                <span className="capitalize">{authUser?.role || "Creator"} Account</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
