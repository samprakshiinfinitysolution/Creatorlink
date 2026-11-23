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
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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

function formatSyncDate(dateValue) {
  if (!dateValue) return "Sync time unavailable";
  const date = new Date(dateValue);
  const time = date.getTime();
  if (!Number.isFinite(time) || isNaN(time) || time <= 0) {
    return "Sync time unavailable";
  }

  try {
    return `Last synced: ${new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)}`;
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

function formatAccountType(accountType) {
  if (!accountType || typeof accountType !== "string") return null;
  const normalized = accountType.trim().toUpperCase();
  if (normalized === "CREATOR") return "Creator Account";
  if (normalized === "BUSINESS") return "Business Account";
  return null;
}

export default function CreatorSettingsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [failedImageUrl, setFailedImageUrl] = useState("");
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

  const showProfileImage =
    Boolean(connectedAccount?.profilePictureUrl) &&
    failedImageUrl !== connectedAccount?.profilePictureUrl;

  const accountTypeBadge = formatAccountType(connectedAccount?.accountType);
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
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 max-w-4xl w-full mx-auto min-w-0">
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
          <section className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-theme">
              <div className="flex items-center gap-3">
                {showProfileImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={connectedAccount.profilePictureUrl}
                    alt={connectedAccount.username ? `@${connectedAccount.username}` : "Instagram profile"}
                    width={40}
                    height={40}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImageUrl(connectedAccount.profilePictureUrl)}
                    className="w-10 h-10 rounded-full object-cover shrink-0 shadow-xs border border-border-theme"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-semibold text-foreground font-sans">
                    Instagram Integration
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Connect your Instagram Professional account to sync verified metrics and portfolio content.
                  </p>
                </div>
              </div>

              {isLoadingAccount ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/10 animate-pulse shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400/50" />
                  <span className="h-3 w-16 bg-neutral-400/20 rounded" />
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Connection Expired
                </span>
              ) : isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  Ready to Connect
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

            {/* Action Box */}
            {isLoadingAccount ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-surface-muted/30 border border-border-theme animate-pulse">
                <div className="space-y-2">
                  <div className="h-3.5 w-44 bg-foreground/10 rounded" />
                  <div className="h-2.5 w-64 sm:w-80 bg-foreground/10 rounded" />
                </div>
                <div className="h-9 w-36 bg-foreground/10 rounded-xl shrink-0" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-surface-muted/30 border border-border-theme">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-semibold text-foreground">
                      Instagram Professional Account
                    </h3>
                    {connectedAccount && (
                      <span className="text-[11px] font-medium text-[#ff2d6c] dark:text-[#ff4f87]">
                        @{connectedAccount.username}
                      </span>
                    )}
                    {accountTypeBadge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-500/10 text-neutral-600 dark:text-neutral-300 border border-neutral-500/20">
                        {accountTypeBadge}
                      </span>
                    )}
                  </div>
                  {connectedAccount ? (
                    <div className="space-y-2 pt-0.5">
                      {isExpired && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {connectedAccount.disconnectionReason ||
                              "Instagram connection expired. Please reconnect."}
                          </span>
                        </div>
                      )}
                      {/* Metric Cards / Pills */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Followers Pill */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-theme shadow-2xs">
                          <span className="font-semibold text-foreground text-xs sm:text-[13px] font-sans">
                            {formatMetricCount(connectedAccount.followersCount)}
                          </span>
                          <span className="text-[11px] text-text-secondary font-medium font-sans">
                            Followers
                          </span>
                        </div>

                        {/* Posts Pill */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-theme shadow-2xs">
                          <span className="font-semibold text-foreground text-xs sm:text-[13px] font-sans">
                            {formatMetricCount(connectedAccount.mediaCount)}
                          </span>
                          <span className="text-[11px] text-text-secondary font-medium font-sans">
                            Posts
                          </span>
                        </div>
                      </div>

                      {/* Last Synced Date */}
                      <p className="text-[10px] text-text-secondary flex items-center gap-1.5">
                        <ClockIcon className="w-3 h-3 text-text-secondary/70 shrink-0" />
                        <span>{formatSyncDate(connectedAccount.lastSyncedAt)}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-text-secondary max-w-md leading-relaxed">
                      Connecting your account verifies your follower count, media statistics, and posts directly via official Meta APIs.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConnectInstagram}
                  disabled={isConnecting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d6c] to-[#e0144c] hover:opacity-95 text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isConnecting ? (
                    <>
                      <SpinnerIcon className="w-4 h-4" />
                      <span>Connecting...</span>
                    </>
                  ) : connectedAccount ? (
                    <>
                      <InstagramIcon className="w-4 h-4" />
                      <span>Reconnect Instagram</span>
                    </>
                  ) : (
                    <>
                      <InstagramIcon className="w-4 h-4" />
                      <span>Connect Instagram</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
