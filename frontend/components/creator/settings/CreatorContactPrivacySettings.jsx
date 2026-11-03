"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function CreatorContactPrivacySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    isConsentGiven: false,
    allowWhatsApp: false,
    allowPhoneCall: false,
    allowBusinessEmail: false,
    whatsappNumber: "",
    businessPhone: "",
    businessEmail: "",
  });

  // Fetch creator's existing contact privacy settings
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/creator/profile/contact-privacy");
        if (res.data?.success && res.data?.data && isMounted) {
          const d = res.data.data;
          setFormData({
            isConsentGiven: Boolean(d.isConsentGiven),
            allowWhatsApp: Boolean(d.allowWhatsApp),
            allowPhoneCall: Boolean(d.allowPhoneCall),
            allowBusinessEmail: Boolean(d.allowBusinessEmail),
            whatsappNumber: d.whatsappNumber || "",
            businessPhone: d.businessPhone || "",
            businessEmail: d.businessEmail || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch contact privacy settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMessage(null);
    setError(null);
  };

  const handleToggleMasterConsent = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      isConsentGiven: isChecked,
    }));
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await axiosInstance.put("/creator/profile/contact-privacy", formData);
      if (res.data?.success) {
        setMessage(
          formData.isConsentGiven
            ? "Contact privacy preferences updated successfully! Verified brands with an active plan can now unlock your permitted channels."
            : "Contact sharing disabled. All direct contact details are now hidden from brands."
        );
      }
    } catch (err) {
      console.error("Failed to update contact privacy:", err);
      setError(err.response?.data?.message || "Failed to update contact privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-5 bg-border-theme rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-border-theme rounded w-2/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-border-theme rounded"></div>
          <div className="h-10 bg-border-theme rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground font-sans">
              Direct Contact & Privacy Controls
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Control whether subscribed brands can unlock your direct contact details or request collaborations.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Master Consent Toggle Card */}
        <div className="p-4 rounded-xl border border-border-theme bg-background/50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <label htmlFor="masterConsentToggle" className="text-sm font-semibold text-foreground cursor-pointer">
              Master Contact Sharing Consent
            </label>
            <p className="text-xs text-text-secondary leading-relaxed">
              When enabled, eligible brands with an active paid plan or trial can spend a quota unlock to view your authorized channels below.
              You can revoke this at any time, immediately masking your details from all brands.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              id="masterConsentToggle"
              type="checkbox"
              name="isConsentGiven"
              checked={formData.isConsentGiven}
              onChange={handleToggleMasterConsent}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Channel Details & Controls (Active only if Master Consent is ON) */}
        <div className={`space-y-4 transition-opacity ${formData.isConsentGiven ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Authorized Contact Channels
          </div>

          {/* 1. WhatsApp Channel */}
          <div className="p-4 rounded-xl border border-border-theme bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  WA
                </span>
                <div>
                  <span className="text-xs font-semibold text-foreground">WhatsApp Direct Messaging</span>
                  <p className="text-[11px] text-text-secondary">Allow brands to contact you via WhatsApp for fast campaign deals</p>
                </div>
              </div>
              <input
                type="checkbox"
                name="allowWhatsApp"
                checked={formData.allowWhatsApp}
                onChange={handleChange}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-neutral-300"
              />
            </div>
            {formData.allowWhatsApp && (
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border-theme bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            )}
          </div>

          {/* 2. Direct Phone Call Channel */}
          <div className="p-4 rounded-xl border border-border-theme bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  PH
                </span>
                <div>
                  <span className="text-xs font-semibold text-foreground">Phone Calls</span>
                  <p className="text-[11px] text-text-secondary">Allow brands to call your business phone directly</p>
                </div>
              </div>
              <input
                type="checkbox"
                name="allowPhoneCall"
                checked={formData.allowPhoneCall}
                onChange={handleChange}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-neutral-300"
              />
            </div>
            {formData.allowPhoneCall && (
              <input
                type="text"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border-theme bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            )}
          </div>

          {/* 3. Business Email Channel */}
          <div className="p-4 rounded-xl border border-border-theme bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                  @
                </span>
                <div>
                  <span className="text-xs font-semibold text-foreground">Business Inquiries Email</span>
                  <p className="text-[11px] text-text-secondary">Allow brands to send sponsorship briefs to your designated business email</p>
                </div>
              </div>
              <input
                type="checkbox"
                name="allowBusinessEmail"
                checked={formData.allowBusinessEmail}
                onChange={handleChange}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-neutral-300"
              />
            </div>
            {formData.allowBusinessEmail && (
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                placeholder="e.g. partnerships@mybrandname.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border-theme bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Preferences..." : "Save Privacy Preferences"}
          </button>
        </div>
      </form>
    </section>
  );
}

