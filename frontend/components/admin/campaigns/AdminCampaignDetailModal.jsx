"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  pauseForModeration,
  resumeFromModeration,
  closeForModeration,
  removeCampaign
} from "@/redux/admin/campaigns/campaigns_slice";

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

function CheckBadgeIcon({ className = "w-4 h-4 text-emerald-400" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function PauseIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  );
}

function PlayIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

const statusBadgeStyles = {
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  draft: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20",
  paused: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  completed: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  closed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
};

const bookingStatusStyles = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  completed: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20"
};

export default function AdminCampaignDetailModal({
  data,
  onClose,
  onStatusChanged
}) {
  const dispatch = useDispatch();
  const { actionLoading, actionError } = useSelector(
    (state) => state.adminCampaigns || {}
  );

  const [moderationReason, setModerationReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'pause', 'resume', 'close', 'delete'
  const [successMessage, setSuccessMessage] = useState("");

  if (!data || !data.campaign) return null;

  const { campaign, brandProfile, bookings = [], bookingStats = {}, auditLogs = [] } = data;
  const isRestricted = Boolean(campaign.moderation?.isRestricted);

  const handleActionClick = (targetAction) => {
    setPendingAction(targetAction);
    setShowReasonInput(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    let result;
    if (pendingAction === "pause") {
      result = await dispatch(
        pauseForModeration({
          id: campaign._id,
          reason: moderationReason.trim()
        })
      );
    } else if (pendingAction === "resume") {
      result = await dispatch(
        resumeFromModeration({
          id: campaign._id,
          reason: moderationReason.trim()
        })
      );
    } else if (pendingAction === "close") {
      result = await dispatch(
        closeForModeration({
          id: campaign._id,
          reason: moderationReason.trim()
        })
      );
    } else if (pendingAction === "delete") {
      result = await dispatch(
        removeCampaign({
          id: campaign._id,
          moderationReason: moderationReason.trim()
        })
      );
      if (!result.error) {
        setSuccessMessage("Campaign safely removed");
        if (onStatusChanged) onStatusChanged();
        setTimeout(() => onClose(), 1200);
        return;
      }
    }

    if (result && !result.error) {
      setSuccessMessage(`Moderation action completed: ${pendingAction.toUpperCase()}`);
      setShowReasonInput(false);
      setModerationReason("");
      setPendingAction(null);
      if (onStatusChanged) onStatusChanged();
    }
  };

  const formattedBudget = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: campaign.currency || "INR",
    maximumFractionDigits: 0
  }).format(campaign.budget || 0);

  const formattedDeadline = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

  const formattedCreated = campaign.createdAt
    ? new Date(campaign.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface border border-border-theme rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme bg-surface">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-foreground">Campaign Dossier</h2>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                statusBadgeStyles[campaign.status] || statusBadgeStyles.draft
              }`}
            >
              {campaign.status}
            </span>
            {isRestricted && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase">
                Moderation Restricted
              </span>
            )}
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 capitalize">
              {campaign.platform}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-foreground rounded-xl hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {actionError && (
          <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {actionError}
          </div>
        )}
        {successMessage && (
          <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ {successMessage}
          </div>
        )}

        {/* MODERATION RESTRICTION NOTICE */}
        {isRestricted && (
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <span className="font-bold">ADMIN RESTRICTION ACTIVE:</span>
            <span>
              &ldquo;{campaign.moderation?.restrictionReason}&rdquo; &bull; Brand cannot resume until resolved.
            </span>
          </div>
        )}

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TOP SUMMARY CARD */}
          <div className="bg-surface-muted/50 border border-border-theme rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-secondary tracking-wider">
                  {campaign.category}
                </span>
                <h1 className="text-xl font-serif font-bold text-foreground mt-1">
                  {campaign.title}
                </h1>
                <p className="text-xs text-text-secondary mt-1">
                  Campaign ID: <span className="font-mono text-foreground">{campaign._id}</span> • Created {formattedCreated}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-border-theme sm:pl-6">
                <span className="text-xs text-text-secondary block">Budget</span>
                <span className="text-2xl font-bold font-serif text-foreground">{formattedBudget}</span>
                <span className="text-xs text-text-secondary block mt-0.5">
                  Deadline: <span className="text-foreground">{formattedDeadline}</span>
                </span>
              </div>
            </div>
          </div>

          {/* GRID LAYOUT: LEFT = CAMPAIGN DETAILS, RIGHT = BRAND & APPLICANTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLUMNS: DESCRIPTION & DELIVERABLES & AUDIT */}
            <div className="lg:col-span-2 space-y-6">
              {/* DESCRIPTION */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-foreground mb-2">Campaign Brief</h3>
                <p className="text-xs leading-relaxed text-text-secondary whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              {/* DELIVERABLES */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-foreground mb-3">
                  Required Deliverables ({campaign.deliverables?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.deliverables?.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs rounded-xl bg-surface-muted text-foreground border border-border-theme flex items-center gap-1.5 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* APPLIED CREATOR BOOKINGS TABLE */}
              <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground">
                    Creator Proposals & Bookings ({bookings.length})
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span>Accepted: <strong className="text-emerald-600 dark:text-emerald-400">{bookingStats.accepted || 0}</strong></span>
                    <span>•</span>
                    <span>Pending: <strong className="text-amber-600 dark:text-amber-400">{bookingStats.pending || 0}</strong></span>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-6 text-xs text-text-secondary">
                    No creators have applied or booked for this campaign yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-border-theme rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-muted/50 text-text-secondary uppercase text-[10px] tracking-wider border-b border-border-theme font-semibold">
                        <tr>
                          <th className="px-3 py-2.5">Creator</th>
                          <th className="px-3 py-2.5">Agreed Price</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-theme text-foreground">
                        {bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-surface-muted/30 transition-colors">
                            <td className="px-3 py-2.5 font-medium">
                              <div>{b.creator?.name || "Anonymous Creator"}</div>
                              <div className="text-[10px] text-text-secondary">{b.creator?.email}</div>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-foreground">
                              ₹{b.agreedPrice?.toLocaleString("en-IN")}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                                  bookingStatusStyles[b.status] || bookingStatusStyles.pending
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-text-secondary text-[10px]">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* AUDIT LOG HISTORY */}
              {auditLogs?.length > 0 && (
                <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground mb-3">Moderation Audit Trail</h3>
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div
                        key={log._id}
                        className="p-3 rounded-xl bg-surface-muted/40 border border-border-theme text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-secondary uppercase">
                            {log.action}
                          </span>
                          <span className="text-text-secondary">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-foreground">
                          {log.reason || "Action performed by administrator"}
                        </p>
                        <p className="text-[10px] text-text-secondary">
                          Admin: {log.admin?.name || log.admin?.email || "System"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: BRAND DOSSIER */}
            <div className="space-y-6">
              <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-foreground mb-4">Brand Information</h3>

                <div className="flex items-center gap-3 pb-4 border-b border-border-theme">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-secondary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {brandProfile?.companyName
                      ? brandProfile.companyName[0].toUpperCase()
                      : campaign.brand?.name
                      ? campaign.brand.name[0].toUpperCase()
                      : "B"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                      <span className="truncate">
                        {brandProfile?.companyName || campaign.brand?.name || "Brand User"}
                      </span>
                      {(brandProfile?.isVerifiedBusiness || campaign.brand?.isVerified) && (
                        <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate">{campaign.brand?.email}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-text-secondary block text-[11px]">Industry</span>
                    <span className="text-foreground font-medium">
                      {brandProfile?.industry || "Not specified"}
                    </span>
                  </div>

                  {brandProfile?.website && (
                    <div>
                      <span className="text-text-secondary block text-[11px]">Website</span>
                      <a
                        href={brandProfile.website.startsWith("http") ? brandProfile.website : `https://${brandProfile.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-secondary hover:underline flex items-center gap-1 truncate font-medium"
                      >
                        {brandProfile.website}
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="text-text-secondary block text-[11px]">Location</span>
                    <span className="text-foreground">
                      {brandProfile?.location || "India"}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-secondary block text-[11px]">Required Creators</span>
                    <span className="text-foreground font-medium">
                      {campaign.requiredCreators || 1} creators
                    </span>
                  </div>
                </div>
              </div>

              {/* MODERATION REASON INPUT ACCORDION */}
              {showReasonInput && (
                <div className="bg-surface-muted/50 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      Confirm Action: {pendingAction?.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        setShowReasonInput(false);
                        setPendingAction(null);
                      }}
                      className="text-xs text-text-secondary hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-text-secondary">
                    {pendingAction === "pause"
                      ? "Mandatory moderation reason (recorded in audit log and notified to brand):"
                      : "Optional note or justification for this moderation action:"}
                  </p>

                  <textarea
                    rows={2}
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder={
                      pendingAction === "pause"
                        ? "e.g. Inappropriate deliverables claim or pending brand KYC verification..."
                        : "e.g. Issues resolved by brand..."
                    }
                    className="w-full bg-surface border border-border-theme rounded-xl p-2.5 text-xs text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-amber-500"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      disabled={actionLoading || (pendingAction === "pause" && !moderationReason.trim())}
                      onClick={handleConfirmAction}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs ${
                        pendingAction === "delete"
                          ? "bg-rose-600 hover:bg-rose-700"
                          : pendingAction === "resume"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      {actionLoading ? "Processing..." : `Confirm ${pendingAction}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER: MODERATION ACTIONS */}
        <div className="px-6 py-4 border-t border-border-theme bg-surface flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isRestricted ? (
              <button
                disabled={actionLoading}
                onClick={() => handleActionClick("resume")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <PlayIcon className="w-3.5 h-3.5" />
                Resolve Restriction & Resume
              </button>
            ) : (
              <button
                disabled={actionLoading || campaign.status === "closed"}
                onClick={() => handleActionClick("pause")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <PauseIcon className="w-3.5 h-3.5" />
                Pause for Moderation
              </button>
            )}

            {campaign.status !== "closed" && (
              <button
                disabled={actionLoading}
                onClick={() => handleActionClick("close")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface border border-border-theme text-foreground hover:bg-surface-muted transition-colors cursor-pointer shadow-xs"
              >
                Close Campaign
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={actionLoading}
              onClick={() => handleActionClick("delete")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Safe Remove
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-text-secondary hover:text-foreground border border-border-theme hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
