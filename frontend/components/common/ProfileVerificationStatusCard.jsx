"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";
import { socket, registerSocketConsumer, unregisterSocketConsumer } from "@/lib/socket";
import { updateRealtimeCreatorVerification } from "@/redux/creator/profile/profile_slice";
import { updateRealtimeBrandVerification } from "@/redux/brand/profile/profile_slice";

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExclamationTriangleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function ArrowPathIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

/**
 * Professional Verification Status & Feedback Component.
 * Supports Creator & Brand panels: displays current Admin verification status,
 * latest Admin rejection/revocation reason with reviewer & timestamp,
 * and clear re-submission action buttons.
 */
export default function ProfileVerificationStatusCard({
  role = "creator",
  verification = null,
  onRefresh = () => {}
}) {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth || {});

  const [submitting, setSubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState("");
  const [resubmitError, setResubmitError] = useState("");
  const [userNote, setUserNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Real-time listener for live status updates from administrator (Approve, Reject, Revoke)
  useEffect(() => {
    const userId = authUser?._id || authUser?.id;
    if (!userId) return;

    const consumerId = `profile_verification_${role}_${userId}`;
    registerSocketConsumer(consumerId, userId);

    const handleStatusChanged = (payload) => {
      if (!payload) return;
      if (role === "creator") {
        dispatch(updateRealtimeCreatorVerification(payload));
      } else if (role === "brand") {
        dispatch(updateRealtimeBrandVerification(payload));
      }
      if (onRefresh) {
        onRefresh();
      }
    };

    socket.on("verification:status_changed", handleStatusChanged);

    return () => {
      unregisterSocketConsumer(consumerId);
      socket.off("verification:status_changed", handleStatusChanged);
    };
  }, [dispatch, authUser, role, onRefresh]);

  const status = verification?.status || "pending";
  const reason = verification?.reason || "";
  const reviewedAt = verification?.reviewedAt || verification?.current?.reviewedAt || null;
  const reviewerName = verification?.reviewerName || "CreatorLink Administrator";

  const handleResubmit = async () => {
    setSubmitting(true);
    setResubmitSuccess("");
    setResubmitError("");

    try {
      const endpoint = role === "creator"
        ? "/creator/profile/verification"
        : "/brand/profile/verification";

      await axiosInstance.post(endpoint, {
        notes: userNote.trim() || `Re-submitted verification request by user following review.`
      });

      setResubmitSuccess(
        "Verification request successfully re-submitted! Your profile is now pending administrative review."
      );
      setUserNote("");
      setShowNoteInput(false);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to re-submit verification request. Please try again.";
      setResubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="verification-status-section" className="bg-white dark:bg-surface border border-border-theme rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
      {/* Top Header Row with Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-theme">
        <div className="flex items-center gap-2.5">
          {status === "approved" ? (
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          ) : status === "rejected" ? (
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <XCircleIcon className="w-5 h-5" />
            </div>
          ) : status === "revoked" ? (
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <ClockIcon className="w-5 h-5" />
            </div>
          )}

          <div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-foreground font-sans">
              Admin Verification Status
            </h3>
            <p className="text-xs text-text-secondary">
              Official verification badge review for your {role === "creator" ? "creator profile" : "brand business account"}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              status === "approved"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : status === "rejected"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                : status === "revoked"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
            }`}
          >
            {status === "approved" ? (
              <>
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                <span>Verified Active</span>
              </>
            ) : status === "rejected" ? (
              <>
                <XCircleIcon className="w-3.5 h-3.5" />
                <span>Verification Rejected</span>
              </>
            ) : status === "revoked" ? (
              <>
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                <span>Verified Badge Revoked</span>
              </>
            ) : (
              <>
                <ClockIcon className="w-3.5 h-3.5" />
                <span>{verification?.resubmittedAt ? "Resubmitted (Pending Review)" : "Pending Review"}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Body based on Status */}
      {status === "approved" && (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Your {role === "creator" ? "creator profile" : "brand business profile"} has been officially verified by CreatorLink administrators. Your verified badge is actively displayed across public discovery catalogs, search results, and workspace collaborations.
          </p>
          {reviewedAt && (
            <p className="text-[11px] text-text-secondary">
              Verified on {new Date(reviewedAt).toLocaleDateString()} by {reviewerName}.
            </p>
          )}
          {reason && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-text-secondary">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Admin Approval Note: </span>
              {reason}
            </div>
          )}
        </div>
      )}

      {status === "pending" && (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {verification?.resubmittedAt
              ? "Your updated verification request has been successfully re-submitted and is currently in the administrative review queue. Our team will re-evaluate your updated profile details and previous review notes."
              : "Your verification request is currently in the review queue. Our administrative team evaluates profile authenticity, audience demographics, professional portfolio, and brand safety before granting the verified badge."}
          </p>
          <div className="p-3 bg-surface-muted/60 border border-border-theme rounded-xl text-xs text-text-secondary flex items-center justify-between flex-wrap gap-2">
            <span>You will receive an in-app notification as soon as an administrator makes a decision.</span>
            {verification?.resubmittedAt ? (
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                Re-submitted on {new Date(verification.resubmittedAt).toLocaleString()}
              </span>
            ) : reviewedAt ? (
              <span className="text-[11px] font-medium text-foreground">
                Queued on {new Date(reviewedAt).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Your recent verification request was reviewed and rejected by an administrator. Please read the official feedback below to understand why your request was declined and what changes are required before re-submitting.
          </p>

          {/* Official Rejection Reason Box */}
          <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Official Rejection Reason from Administrator:
              </span>
              {reviewedAt && (
                <span className="text-[11px] text-text-secondary">
                  Reviewed on {new Date(reviewedAt).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground bg-surface p-3 rounded-xl border border-border-theme font-medium leading-relaxed whitespace-pre-wrap">
              {reason || "Your verification request did not meet the required platform criteria."}
            </p>
          </div>

          {/* Actionable Next Step Box */}
          <div className="p-4 bg-surface-muted/50 border border-border-theme rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground">
                  Action Required: Update Profile & Re-Submit
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Ensure your profile info, social links, and details address the feedback above, then re-submit for review.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNoteInput((prev) => !prev)}
                  className="px-2.5 py-2 text-[11px] font-medium text-text-secondary hover:text-foreground hover:bg-surface rounded-xl border border-border-theme transition cursor-pointer"
                >
                  {showNoteInput ? "Hide Note" : "+ Add Note"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleResubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${submitting ? "animate-spin" : ""}`} />
                  <span>{submitting ? "Re-Submitting..." : "Re-Submit for Review"}</span>
                </button>
              </div>
            </div>

            {showNoteInput && (
              <input
                type="text"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                maxLength={300}
                placeholder="Optional note for administrator (e.g. Updated profile bio and connected Instagram handle)..."
                className="w-full text-xs px-3.5 py-2 bg-surface border border-border-theme rounded-xl text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition"
              />
            )}
          </div>

          {resubmitSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
              ✓ {resubmitSuccess}
            </p>
          )}
          {resubmitError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
              ✕ {resubmitError}
            </p>
          )}
        </div>
      )}

      {status === "revoked" && (
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Your previously approved verified badge was revoked by an administrator. Please review the official justification below for details regarding this revocation decision.
          </p>

          {/* Official Revocation Reason Box */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Official Revocation Reason from Administrator:
              </span>
              {reviewedAt && (
                <span className="text-[11px] text-text-secondary">
                  Revoked on {new Date(reviewedAt).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground bg-surface p-3 rounded-xl border border-border-theme font-medium leading-relaxed whitespace-pre-wrap">
              {reason || "Your verified status was revoked due to policy compliance or account eligibility updates."}
            </p>
          </div>

          {/* Actionable Next Step Box */}
          <div className="p-4 bg-surface-muted/50 border border-border-theme rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground">
                  Re-Apply for Verification Badge
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Once the issue detailed in the revocation note has been resolved, you may re-apply for verification.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNoteInput((prev) => !prev)}
                  className="px-2.5 py-2 text-[11px] font-medium text-text-secondary hover:text-foreground hover:bg-surface rounded-xl border border-border-theme transition cursor-pointer"
                >
                  {showNoteInput ? "Hide Note" : "+ Add Note"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleResubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${submitting ? "animate-spin" : ""}`} />
                  <span>{submitting ? "Re-Applying..." : "Re-Apply for Badge"}</span>
                </button>
              </div>
            </div>

            {showNoteInput && (
              <input
                type="text"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                maxLength={300}
                placeholder="Optional note for administrator (e.g. Terms compliance addressed and profile refreshed)..."
                className="w-full text-xs px-3.5 py-2 bg-surface border border-border-theme rounded-xl text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition"
              />
            )}
          </div>

          {resubmitSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
              ✓ {resubmitSuccess}
            </p>
          )}
          {resubmitError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
              ✕ {resubmitError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

