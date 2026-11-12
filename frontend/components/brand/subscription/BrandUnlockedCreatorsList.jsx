"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";

export default function BrandUnlockedCreatorsList() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlockedCreators, setUnlockedCreators] = useState([]);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUnlocked = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/subscriptions/unlocks");
        if (res.data?.success && isMounted) {
          setUnlockedCreators(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch unlocked creators:", err);
        if (isMounted) setError("Failed to load unlocked creators roster.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUnlocked();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <BrandHeader setMobileOpen={setMobileOpen} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Link
                  href="/brand/subscription"
                  className="text-xs font-semibold text-text-secondary hover:text-foreground transition-colors"
                >
                  ← Subscription Dashboard
                </Link>
              </div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-wide">
                Unlocked Creators Roster
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Directory of creators whose direct contact details you have unlocked. Permanent access with live consent protection.
              </p>
            </div>

            <Link
              href="/brand/creators"
              className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer shadow-xs"
            >
              Discover More Creators ↗
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-2xl bg-surface border border-border-theme animate-pulse space-y-3">
                  <div className="h-10 w-10 rounded-full bg-border-theme"></div>
                  <div className="h-4 bg-border-theme rounded w-1/2"></div>
                  <div className="h-3 bg-border-theme rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : unlockedCreators.length === 0 ? (
            <div className="text-center p-12 rounded-2xl bg-surface border border-border-theme space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-xl">
                🔓
              </div>
              <h3 className="text-base font-semibold text-foreground">No Creators Unlocked Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Explore our creator marketplace to unlock direct contact numbers, WhatsApp, and emails using your available quota.
              </p>
              <div className="pt-2">
                <Link
                  href="/brand/creators"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors inline-block"
                >
                  Explore Creator Marketplace
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedCreators.map((item) => {
                const creator = item.creator || {};
                const details = item.contactDetails;
                const isConsentGiven = item.isConsentGiven;

                return (
                  <div
                    key={item.unlockId}
                    className="p-5 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Creator Info Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-surface-muted border border-border-theme overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm text-foreground">
                            {creator.profileImage ? (
                              <img src={creator.profileImage} alt={creator.name} className="w-full h-full object-cover object-center" />
                            ) : (
                              creator.name?.charAt(0) || "C"
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-sm text-foreground">{creator.name || "Creator"}</span>
                              {creator.isVerifiedBadge && (
                                <span className="text-blue-500 text-xs font-bold" title="Verified Badge">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-text-secondary block">
                              {creator.title || creator.category || "Content Creator"}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          Unlocked
                        </span>
                      </div>

                      {/* Contact Channels Card */}
                      <div className="mt-4 pt-3 border-t border-border-theme space-y-2">
                        {isConsentGiven && details ? (
                          <div className="space-y-2 text-xs">
                            {details.whatsappNumber && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/40">
                                <span className="text-text-secondary font-medium">WhatsApp:</span>
                                <div className="flex items-center gap-2 font-mono text-[11px]">
                                  <a
                                    href={`https://wa.me/${details.whatsappNumber.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                                  >
                                    {details.whatsappNumber} ↗
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(details.whatsappNumber, `wa_${item.unlockId}`)}
                                    className="text-text-secondary hover:text-foreground cursor-pointer"
                                  >
                                    {copiedText === `wa_${item.unlockId}` ? "Copied" : "Copy"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {details.businessPhone && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/40">
                                <span className="text-text-secondary font-medium">Phone:</span>
                                <div className="flex items-center gap-2 font-mono text-[11px]">
                                  <a
                                    href={`tel:${details.businessPhone}`}
                                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                  >
                                    {details.businessPhone} ↗
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(details.businessPhone, `ph_${item.unlockId}`)}
                                    className="text-text-secondary hover:text-foreground cursor-pointer"
                                  >
                                    {copiedText === `ph_${item.unlockId}` ? "Copied" : "Copy"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {details.businessEmail && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/40">
                                <span className="text-text-secondary font-medium">Email:</span>
                                <div className="flex items-center gap-2 text-[11px] truncate max-w-[170px]">
                                  <a
                                    href={`mailto:${details.businessEmail}`}
                                    className="text-purple-600 dark:text-purple-400 font-semibold hover:underline truncate"
                                  >
                                    {details.businessEmail}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(details.businessEmail, `em_${item.unlockId}`)}
                                    className="text-text-secondary hover:text-foreground cursor-pointer"
                                  >
                                    {copiedText === `em_${item.unlockId}` ? "Copied" : "Copy"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {!details.whatsappNumber && !details.businessPhone && !details.businessEmail && (
                              <div className="text-[11px] text-text-secondary italic p-2">
                                Creator has not published any channels currently.
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                            Creator has temporarily paused direct contact sharing or revoked consent.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border-theme flex items-center justify-between text-[11px] text-text-secondary">
                      <span>Unlocked {new Date(item.unlockedAt).toLocaleDateString()}</span>
                      <span className="capitalize">{item.quotaPeriodKey} Cycle</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

