"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

export default function BrandContactUnlockSection({ creatorId, creatorName }) {
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Check unlock status on mount / creatorId change
  useEffect(() => {
    let isMounted = true;
    if (!creatorId) return;

    const checkStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(`/subscriptions/unlocks/check/${creatorId}`);
        if (res.data?.success && isMounted) {
          setStatusData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to check creator unlock status:", err);
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to check contact status");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [creatorId]);

  const handleConfirmUnlock = async () => {
    setUnlocking(true);
    setError(null);
    try {
      const res = await axiosInstance.post(`/subscriptions/unlocks/${creatorId}`);
      if (res.data?.success) {
        setStatusData({
          ...res.data.data,
          isUnlocked: true,
        });
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error("Failed to unlock creator contact:", err);
      setError(err.response?.data?.message || "Failed to unlock creator contact");
      setShowConfirmModal(false);
    } finally {
      setUnlocking(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-surface-muted/40 border border-border-theme animate-pulse space-y-2">
        <div className="h-4 bg-border-theme rounded w-1/3"></div>
        <div className="h-8 bg-border-theme rounded w-full"></div>
      </div>
    );
  }

  // State A: Already Unlocked
  if (statusData?.isUnlocked) {
    const isConsentGiven = statusData.isConsentGiven;
    const details = statusData.contactDetails;

    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-surface to-emerald-500/10 border border-emerald-500/20 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
              ✓
            </span>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              Direct Contact Details Unlocked
            </span>
          </div>
          <span className="text-[11px] text-text-secondary">Permanent Unlock</span>
        </div>

        {isConsentGiven && details ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* WhatsApp */}
            {details.whatsappNumber ? (
              <div className="p-3 rounded-xl bg-surface border border-border-theme flex flex-col justify-between gap-1.5">
                <span className="text-[11px] font-medium text-text-secondary uppercase">WhatsApp</span>
                <span className="text-xs font-semibold text-foreground truncate">{details.whatsappNumber}</span>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/${details.whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-emerald-600 hover:underline"
                  >
                    Open Chat ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.whatsappNumber, "wa")}
                    className="text-[11px] text-text-secondary hover:text-foreground cursor-pointer"
                  >
                    {copiedField === "wa" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface/50 border border-border-theme text-[11px] text-text-secondary flex items-center">
                WhatsApp: Not shared by creator
              </div>
            )}

            {/* Direct Phone */}
            {details.businessPhone ? (
              <div className="p-3 rounded-xl bg-surface border border-border-theme flex flex-col justify-between gap-1.5">
                <span className="text-[11px] font-medium text-text-secondary uppercase">Direct Phone</span>
                <span className="text-xs font-semibold text-foreground truncate">{details.businessPhone}</span>
                <div className="flex items-center gap-2 pt-1">
                  <a href={`tel:${details.businessPhone}`} className="text-[11px] font-semibold text-blue-600 hover:underline">
                    Call ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.businessPhone, "phone")}
                    className="text-[11px] text-text-secondary hover:text-foreground cursor-pointer"
                  >
                    {copiedField === "phone" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface/50 border border-border-theme text-[11px] text-text-secondary flex items-center">
                Phone: Not shared by creator
              </div>
            )}

            {/* Business Email */}
            {details.businessEmail ? (
              <div className="p-3 rounded-xl bg-surface border border-border-theme flex flex-col justify-between gap-1.5">
                <span className="text-[11px] font-medium text-text-secondary uppercase">Business Email</span>
                <span className="text-xs font-semibold text-foreground truncate">{details.businessEmail}</span>
                <div className="flex items-center gap-2 pt-1">
                  <a href={`mailto:${details.businessEmail}`} className="text-[11px] font-semibold text-purple-600 hover:underline">
                    Email ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.businessEmail, "email")}
                    className="text-[11px] text-text-secondary hover:text-foreground cursor-pointer"
                  >
                    {copiedField === "email" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface/50 border border-border-theme text-[11px] text-text-secondary flex items-center">
                Email: Not shared by creator
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            Creator has paused direct contact sharing or revoked consent. Direct contact details remain masked until consent is updated.
            You can still propose collaborations through platform Bookings.
          </div>
        )}
      </div>
    );
  }

  // State B: Locked
  const canUnlock = Boolean(statusData?.canUnlock);
  const remainingQuota = statusData?.remainingQuota || 0;

  return (
    <div className="p-4 rounded-2xl bg-surface-muted/30 border border-border-theme space-y-3">
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 text-foreground flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Direct Contact Information</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                {remainingQuota} Unlocks Available
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Unlock verified WhatsApp, direct phone, and business email for this creator.
            </p>
          </div>
        </div>

        {canUnlock && remainingQuota > 0 ? (
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shadow-xs"
          >
            Unlock Contact Details
          </button>
        ) : (
          <Link
            href="/brand/subscription/plans"
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors whitespace-nowrap text-center shadow-xs"
          >
            Upgrade Plan to Unlock
          </Link>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border-theme rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Unlock Contact for {creatorName || "this Creator"}?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This action will consume <strong className="text-foreground">1 contact unlock</strong> from your available quota
              (<strong className="text-foreground">{remainingQuota} remaining</strong>).
              Once unlocked, you will permanently retain access to this Creator's permitted contact channels.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={unlocking}
                className="px-4 py-2 rounded-xl border border-border-theme text-xs font-medium hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                disabled={unlocking}
                className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {unlocking ? "Unlocking..." : "Confirm & Unlock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

