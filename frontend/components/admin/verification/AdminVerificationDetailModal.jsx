"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveVerificationRequest,
  rejectVerificationRequest,
  revokeVerificationRequest
} from "@/redux/admin/verification/verification_slice";
import AdminAvatar from "@/components/admin/AdminAvatar";

// =========================================================
// SVG ICONS
// =========================================================
function XMarkIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowTopRightOnSquareIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function GlobeAltIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
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

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function AdminVerificationDetailModal({
  request,
  onClose,
  onSuccess
}) {
  const dispatch = useDispatch();
  const { actionLoading, actionError } = useSelector(
    (state) => state.adminVerification || {}
  );

  // activeAction: null | "reject" | "revoke"
  const [activeAction, setActiveAction] = useState(null);
  const [reasonText, setReasonText] = useState("");
  const [reasonError, setReasonError] = useState("");

  if (!request) return null;

  const {
    _id,
    user,
    role,
    notes,
    status,
    createdAt,
    resubmittedAt,
    resubmissionHistory = [],
    reviewedAt,
    reviewedBy,
    rejectionReason: existingRejectionReason,
    reviewHistory = [],
    profile
  } = request;

  const displayName = user?.name || user?.fullName || "Unnamed User";
  const reviewerName = reviewedBy?.name || reviewedBy?.fullName || reviewedBy?.email || "Administrator";
  const hasHistory = Array.isArray(reviewHistory) && reviewHistory.length > 0;
  const isResubmitted = status === "pending" && (Boolean(resubmittedAt) || hasHistory);
  const latestResubmissionDate = resubmittedAt || (isResubmitted ? request.updatedAt : null);
  const latestPriorReview = hasHistory ? reviewHistory[reviewHistory.length - 1] : null;

  const handleApprove = async () => {
    const res = await dispatch(approveVerificationRequest(_id));
    if (res.meta.requestStatus === "fulfilled") {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleConfirmAction = async () => {
    const cleanReason = (reasonText || "").trim();
    if (!cleanReason || cleanReason.length < 3) {
      setReasonError("Please provide a reason (minimum 3 characters).");
      return;
    }
    if (cleanReason.length > 1000) {
      setReasonError("Reason cannot exceed 1000 characters.");
      return;
    }
    setReasonError("");

    let res;
    if (activeAction === "revoke") {
      res = await dispatch(
        revokeVerificationRequest({
          id: _id,
          reason: cleanReason
        })
      );
    } else {
      res = await dispatch(
        rejectVerificationRequest({
          id: _id,
          rejectionReason: cleanReason
        })
      );
    }

    if (res?.meta?.requestStatus === "fulfilled") {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  // Helper to extract active social links
  const socialLinksObj = profile?.socialLinks || {};
  const activeSocials = Object.entries(socialLinksObj).filter(
    ([, val]) => typeof val === "string" && val.trim() !== ""
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-surface border border-border-theme rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-theme bg-surface">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-serif font-bold text-foreground">
                Verification Details & Profile Review
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  status === "approved"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : status === "rejected"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">Applicant ID: {user?._id || _id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-foreground rounded-xl hover:bg-surface-muted transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Action Error Alert */}
        {actionError && (
          <div className="px-6 py-3 bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md z-30 sticky top-0">
            <span>{actionError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top User Overview Card */}
          <div className="bg-surface-muted/50 border border-border-theme rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AdminAvatar
                src={
                  role === "creator"
                    ? (profile?.profileImage || user?.avatar)
                    : (profile?.logo || user?.avatar)
                }
                name={displayName}
                type={role || "user"}
                className="w-14 h-14 rounded-full bg-surface border border-border-theme font-semibold text-lg text-foreground shrink-0 overflow-hidden"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {displayName}
                  </h3>
                  {(status === "approved" || profile?.isVerifiedBadge || profile?.isVerifiedBusiness) && (
                    <span className="text-blue-500" title="Verified Badge Active">
                      <ShieldCheckIcon className="w-4 h-4 inline" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                      role === "creator"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {role}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Registered: {new Date(user?.createdAt || createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status Pill */}
            <div className="text-right sm:border-l border-border-theme sm:pl-4 pt-2 sm:pt-0">
              <span className="text-[11px] text-text-secondary block mb-1">Badge Status</span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold inline-block ${
                  status === "approved"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : status === "rejected"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    : isResubmitted
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
              >
                {status === "approved"
                  ? "Verified Active"
                  : status === "rejected"
                  ? "Unverified / Revoked"
                  : isResubmitted
                  ? "Resubmitted (Pending Review)"
                  : "Pending Review"}
              </span>
            </div>
          </div>

          {/* Resubmission & Prior Decision Banner */}
          {isResubmitted && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                  <span className="font-semibold text-sm text-purple-700 dark:text-purple-300">
                    Resubmitted Verification Request
                  </span>
                </div>
                {latestResubmissionDate && (
                  <span className="text-xs text-text-secondary font-medium">
                    Resubmitted: <span className="text-foreground font-semibold">{new Date(latestResubmissionDate).toLocaleString()}</span>
                  </span>
                )}
              </div>

              {latestPriorReview && (
                <div className="bg-surface/80 rounded-xl p-3 border border-border-theme text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase text-[11px]">
                      Previous Decision: {latestPriorReview.action.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {new Date(latestPriorReview.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                  {latestPriorReview.reason && (
                    <p className="text-text-secondary">
                      <span className="font-medium text-foreground">Previous Feedback / Reason: </span>
                      {latestPriorReview.reason}
                    </p>
                  )}
                </div>
              )}

              {notes && (
                <p className="text-xs text-text-secondary">
                  <span className="font-medium text-foreground">Applicant Notes with Resubmission: </span>
                  {notes}
                </p>
              )}
            </div>
          )}

          {/* Profile Details Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Profile & Signup Information
            </h4>

            {role === "creator" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Headline / Title & Category */}
                <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-4 space-y-2">
                  <span className="text-[11px] text-text-secondary block">Professional Headline</span>
                  <p className="text-xs font-medium text-foreground">
                    {profile?.title || "No headline provided yet"}
                  </p>

                  <div className="pt-2 border-t border-border-theme flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-text-secondary block">Category</span>
                      <p className="text-xs font-semibold text-foreground capitalize">
                        {profile?.category || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-secondary block text-right">Location</span>
                      <p className="text-xs font-medium text-foreground text-right">
                        {profile?.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audience & Demographics */}
                <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-4 space-y-2">
                  <span className="text-[11px] text-text-secondary block">Follower Reach & Demographics</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-text-secondary">Followers</span>
                      <p className="text-sm font-bold text-foreground">
                        {profile?.followerCount ? Number(profile.followerCount).toLocaleString() : "0"}
                      </p>
                    </div>
                    {profile?.gender && (
                      <div>
                        <span className="text-xs text-text-secondary">Gender</span>
                        <p className="text-xs font-medium text-foreground capitalize">
                          {profile.gender.replace(/_/g, " ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {Array.isArray(profile?.languages) && profile.languages.length > 0 && (
                    <div className="pt-2 border-t border-border-theme">
                      <span className="text-[11px] text-text-secondary block mb-1">Languages</span>
                      <div className="flex flex-wrap gap-1">
                        {profile.languages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-surface px-2 py-0.5 rounded-md border border-border-theme text-foreground"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-4 md:col-span-2">
                  <span className="text-[11px] text-text-secondary block mb-1">Creator Bio</span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {profile?.bio || "No bio entered by user."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Company Name & Industry */}
                <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-4 space-y-2">
                  <span className="text-[11px] text-text-secondary block">Company & Industry</span>
                  <p className="text-sm font-semibold text-foreground">
                    {profile?.companyName || displayName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Industry: {profile?.industry || "Not specified"}
                  </p>

                  <div className="pt-2 border-t border-border-theme flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-text-secondary block">Location</span>
                      <p className="text-xs font-medium text-foreground">
                        {profile?.location || "Not specified"}
                      </p>
                    </div>
                    {profile?.website && (
                      <div>
                        <span className="text-[11px] text-text-secondary block text-right">Website</span>
                        <a
                          href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-secondary hover:underline inline-flex items-center gap-1"
                        >
                          Visit <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Contact Details */}
                <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-4 space-y-2">
                  <span className="text-[11px] text-text-secondary block">Contact Person Information</span>
                  <p className="text-xs font-medium text-foreground">
                    {profile?.contactInformation?.name || "No contact person specified"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Email: {profile?.contactInformation?.email || user?.email || "N/A"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Phone: {profile?.contactInformation?.phone || "Not specified"}
                  </p>
                </div>

                {/* Company Description */}
                <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-4 md:col-span-2">
                  <span className="text-[11px] text-text-secondary block mb-1">Company Description</span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {profile?.description || "No company description entered."}
                  </p>
                </div>
              </div>
            )}

            {/* Social Media Links */}
            {activeSocials.length > 0 && (
              <div className="bg-surface-muted/40 border border-border-theme rounded-xl p-4">
                <span className="text-[11px] text-text-secondary block mb-2 font-medium">
                  Connected Social Links & Web Presence
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeSocials.map(([platform, link]) => {
                    const fullHref = link.startsWith("http") ? link : `https://${link}`;
                    return (
                      <a
                        key={platform}
                        href={fullHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border-theme hover:border-secondary/40 rounded-lg text-xs font-medium text-foreground hover:text-secondary transition"
                      >
                        <GlobeAltIcon className="w-3.5 h-3.5 text-text-secondary" />
                        <span className="capitalize">{platform}</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 text-text-secondary ml-0.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Decision & Review Audit History Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-secondary" />
              Administrative Review & Decision History
            </h4>

            {reviewHistory.length === 0 ? (
              <div className="bg-surface-muted/30 border border-border-theme rounded-xl p-4 text-xs text-text-secondary">
                {reviewedAt ? (
                  <div>
                    <p className="font-medium text-foreground">
                      Decision: {status.toUpperCase()} by {reviewerName} on {new Date(reviewedAt).toLocaleString()}
                    </p>
                    {existingRejectionReason && (
                      <p className="text-rose-500 mt-1">Reason: {existingRejectionReason}</p>
                    )}
                    {notes && <p className="text-text-secondary mt-1">Notes: {notes}</p>}
                  </div>
                ) : (
                  <p>No administrative review decisions have been recorded for this account yet.</p>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {reviewHistory.map((entry, idx) => {
                  const entryReviewer = entry.reviewedBy?.name || entry.reviewedBy?.email || "Admin";
                  const isApproved = entry.action === "approved";
                  const isRevoked = entry.action === "revoked";

                  return (
                    <div
                      key={entry._id || idx}
                      className="bg-surface-muted/40 border border-border-theme rounded-xl p-3.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              isApproved
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : isRevoked
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {entry.action.toUpperCase()}
                          </span>
                          <span className="font-semibold text-foreground">
                            {entryReviewer}
                          </span>
                          <span className="text-[11px] text-text-secondary">
                            ({entry.previousStatus} → {entry.newStatus})
                          </span>
                        </div>
                        <span className="text-[11px] text-text-secondary">
                          {new Date(entry.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                      {entry.reason && (
                        <p className="text-text-secondary pt-1 border-t border-border-theme">
                          <span className="font-medium text-foreground">Notes/Reason: </span>
                          {entry.reason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Drawer for Reject or Revoke */}
          {activeAction && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-rose-600 dark:text-rose-300">
                  {activeAction === "revoke"
                    ? "Reason for Revoking Verification (Required, notified to user):"
                    : "Reason for Rejection (Required, notified to user):"}
                </label>
                <span className="text-[10px] text-text-secondary">
                  {reasonText.trim().length} / 1000
                </span>
              </div>
              <textarea
                value={reasonText}
                maxLength={1000}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={
                  activeAction === "revoke"
                    ? "Explain why verified status is being revoked (e.g. Terms violation, unverified account activity)..."
                    : "Explain why this request is rejected (e.g. Incomplete profile, invalid links, guideline mismatch)..."
                }
                rows={3}
                className="w-full text-xs bg-surface border border-border-theme rounded-xl p-2.5 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-rose-500"
              />
              {reasonError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{reasonError}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction(null);
                    setReasonText("");
                    setReasonError("");
                  }}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-foreground rounded-xl hover:bg-surface-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmAction}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {actionLoading
                    ? "Submitting..."
                    : activeAction === "revoke"
                    ? "Confirm Revoke"
                    : "Confirm Rejection"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-theme bg-surface flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-foreground rounded-xl border border-border-theme hover:bg-surface-muted transition cursor-pointer"
          >
            Close
          </button>

          {!activeAction && (
            <div className="flex items-center gap-2.5">
              {status === "approved" ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction("revoke");
                    setReasonText("");
                    setReasonError("");
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  Revoke Verified Badge
                </button>
              ) : status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction("reject");
                      setReasonText("");
                      setReasonError("");
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {actionLoading ? "Processing..." : "Approve & Grant Badge"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  {actionLoading ? "Processing..." : "Re-Approve & Grant Badge"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
