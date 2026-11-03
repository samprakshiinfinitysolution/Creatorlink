"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  overrideStatus,
  extendDeadline
} from "@/redux/admin/collaborations/collaborations_slice";

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

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  submitted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  revision_requested: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
};

const deliverableStatusStyles = {
  pending: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  submitted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  revision_requested: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
};

export default function AdminCollaborationDetailModal({
  data,
  onClose,
  onUpdated
}) {
  const dispatch = useDispatch();
  const { actionLoading, actionError } = useSelector(
    (state) => state.adminCollaborations || {}
  );

  const [overrideStatusVal, setOverrideStatusVal] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideBox, setShowOverrideBox] = useState(false);

  const [extendDate, setExtendDate] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [showExtendBox, setShowExtendBox] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState("");

  if (!data || !data.workspace) return null;

  const {
    workspace,
    brandProfile,
    creatorProfile,
    review,
    deliverablesSummary = {},
    isOverdue
  } = data;

  const handleApplyOverride = async () => {
    if (!overrideStatusVal) return;
    const result = await dispatch(
      overrideStatus({
        id: workspace._id,
        status: overrideStatusVal,
        reason: overrideReason.trim()
      })
    );
    if (!result.error) {
      setFeedbackMsg(`Collaboration status set to ${overrideStatusVal.toUpperCase()}`);
      setShowOverrideBox(false);
      setOverrideReason("");
      if (onUpdated) onUpdated();
    }
  };

  const handleApplyExtension = async () => {
    if (!extendDate) return;
    const result = await dispatch(
      extendDeadline({
        id: workspace._id,
        newDeadline: extendDate,
        reason: extendReason.trim()
      })
    );
    if (!result.error) {
      setFeedbackMsg("Deadline extended successfully");
      setShowExtendBox(false);
      setExtendReason("");
      if (onUpdated) onUpdated();
    }
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: workspace.currency || "INR",
    maximumFractionDigits: 0
  }).format(workspace.agreedPrice || 0);

  const formattedDeadline = workspace.deadline
    ? new Date(workspace.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

  const formattedCreated = workspace.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface border border-border-theme rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme bg-surface">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-foreground">Collaboration Dossier</h2>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                statusBadgeStyles[workspace.status] || statusBadgeStyles.in_progress
              }`}
            >
              {workspace.status.replace("_", " ")}
            </span>
            {isOverdue && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase">
                OVERDUE
              </span>
            )}
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
        {feedbackMsg && (
          <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ {feedbackMsg}
          </div>
        )}

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TOP OVERVIEW CARD */}
          <div className="bg-surface-muted/50 border border-border-theme rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-secondary tracking-wider">
                  {workspace.campaign?.category || "Direct Hire Collaboration"}
                </span>
                <h1 className="text-xl font-serif font-bold text-foreground mt-1">
                  {workspace.campaign?.title || workspace.service?.title || "Active Collaboration"}
                </h1>
                <p className="text-xs text-text-secondary mt-1">
                  Workspace ID: <span className="font-mono text-foreground">{workspace._id}</span> • Started {formattedCreated}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-border-theme sm:pl-6">
                <span className="text-xs text-text-secondary block">Agreed Compensation</span>
                <span className="text-2xl font-bold font-serif text-foreground">{formattedPrice}</span>
                <span className="text-xs text-text-secondary block mt-0.5">
                  Deadline: <span className={isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-foreground"}>{formattedDeadline}</span>
                </span>
              </div>
            </div>
          </div>

          {/* TWO-PARTY SUMMARY: BRAND & CREATOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BRAND */}
            <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Hiring Brand
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {brandProfile?.companyName ? brandProfile.companyName[0].toUpperCase() : workspace.brand?.name?.[0] || "B"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                    <span className="truncate">{brandProfile?.companyName || workspace.brand?.name}</span>
                    {(brandProfile?.isVerifiedBusiness || workspace.brand?.isVerified) && (
                      <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-text-secondary truncate">{workspace.brand?.email}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-text-secondary flex items-center justify-between border-t border-border-theme pt-2">
                <span>Industry: {brandProfile?.industry || "Marketing"}</span>
                {brandProfile?.website && (
                  <a
                    href={brandProfile.website.startsWith("http") ? brandProfile.website : `https://${brandProfile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-secondary hover:underline flex items-center gap-1 font-medium"
                  >
                    Site <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* CREATOR */}
            <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Contracted Creator
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {creatorProfile?.displayName ? creatorProfile.displayName[0].toUpperCase() : workspace.creator?.name?.[0] || "C"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                    <span className="truncate">{creatorProfile?.displayName || workspace.creator?.name}</span>
                    {(creatorProfile?.isVerifiedBadge || workspace.creator?.isVerified) && (
                      <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-text-secondary truncate">{workspace.creator?.email}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-text-secondary flex items-center justify-between border-t border-border-theme pt-2">
                <span>Niche: {creatorProfile?.primaryNiche || "Lifestyle & Media"}</span>
                <span>Service: {workspace.service?.title || "Custom Hire"}</span>
              </div>
            </div>
          </div>

          {/* DELIVERABLES & MILESTONES */}
          <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">
                Deliverables & Submissions ({deliverablesSummary.completed || 0}/{deliverablesSummary.total || 0})
              </h3>
              <span className="text-xs text-secondary font-semibold font-mono">
                {deliverablesSummary.percentage || 0}% Complete
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden mb-4 border border-border-theme">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-300"
                style={{ width: `${deliverablesSummary.percentage || 0}%` }}
              />
            </div>

            {/* DELIVERABLES LIST */}
            <div className="space-y-3">
              {workspace.deliverables?.length === 0 ? (
                <p className="text-xs text-text-secondary">No specific deliverables logged for this workspace.</p>
              ) : (
                workspace.deliverables?.map((del, idx) => (
                  <div
                    key={del._id || idx}
                    className="p-3.5 bg-surface-muted/40 border border-border-theme rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-surface-muted text-foreground flex items-center justify-center text-[10px] font-bold border border-border-theme">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-foreground">{del.title}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] rounded-full uppercase font-semibold ${
                          deliverableStatusStyles[del.status] || deliverableStatusStyles.pending
                        }`}
                      >
                        {del.status?.replace("_", " ")}
                      </span>
                    </div>

                    {del.description && (
                      <p className="text-xs text-text-secondary pl-7">{del.description}</p>
                    )}

                    {del.submission?.link && (
                      <div className="pl-7 pt-1 flex items-center gap-2 text-xs">
                        <span className="text-text-secondary">Submitted Asset:</span>
                        <a
                          href={del.submission.link.startsWith("http") ? del.submission.link : `https://${del.submission.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-secondary hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          View Link <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* REVISIONS & REVIEW SECTION */}
          {workspace.revisions?.length > 0 && (
            <div className="bg-surface border border-border-theme rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-3">
                Revision History ({workspace.revisions.length})
              </h3>
              <div className="space-y-2">
                {workspace.revisions.map((rev, idx) => (
                  <div key={idx} className="p-3 bg-surface-muted/40 border border-border-theme rounded-xl text-xs">
                    <span className="text-[10px] text-text-secondary block mb-1">
                      Revision requested on {new Date(rev.requestedAt).toLocaleDateString()}
                    </span>
                    <p className="text-foreground">{rev.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {review && (
            <div className="bg-surface border border-emerald-500/20 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">Collaboration Review & Rating</h3>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-sm">{"★".repeat(review.rating || 5)}</span>
                <span className="text-xs text-foreground font-bold">{review.rating} / 5</span>
              </div>
              <p className="text-xs text-text-secondary italic">&ldquo;{review.comment}&rdquo;</p>
            </div>
          )}

          {/* OVERRIDE STATUS ACCORDION */}
          {showOverrideBox && (
            <div className="bg-surface-muted/50 border border-secondary/30 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                  Administrative Status Override
                </span>
                <button
                  onClick={() => setShowOverrideBox(false)}
                  className="text-xs text-text-secondary hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Target Status</label>
                  <select
                    value={overrideStatusVal}
                    onChange={(e) => setOverrideStatusVal(e.target.value)}
                    className="w-full bg-surface border border-border-theme rounded-xl p-2 text-xs text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
                  >
                    <option value="">Select new status...</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="revision_requested">Revision Requested</option>
                    <option value="completed">Completed (Force Release)</option>
                    <option value="cancelled">Cancelled (Force Cancel)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Reason / Admin Note</label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Deliverable accepted by brand off-platform..."
                    className="w-full bg-surface border border-border-theme rounded-xl p-2 text-xs text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!overrideStatusVal || actionLoading}
                  onClick={handleApplyOverride}
                  className="px-3.5 py-1.5 bg-foreground text-background rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {actionLoading ? "Applying..." : "Confirm Status Override"}
                </button>
              </div>
            </div>
          )}

          {/* EXTEND DEADLINE ACCORDION */}
          {showExtendBox && (
            <div className="bg-surface-muted/50 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Extend Collaboration Deadline
                </span>
                <button
                  onClick={() => setShowExtendBox(false)}
                  className="text-xs text-text-secondary hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">New Completion Deadline</label>
                  <input
                    type="date"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                    className="w-full bg-surface border border-border-theme rounded-xl p-2 text-xs text-foreground focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-secondary block mb-1">Extension Note / Justification</label>
                  <input
                    type="text"
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    placeholder="e.g. Extended by 1 week as agreed by brand & creator..."
                    className="w-full bg-surface border border-border-theme rounded-xl p-2 text-xs text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!extendDate || actionLoading}
                  onClick={handleApplyExtension}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {actionLoading ? "Saving..." : "Confirm Extension"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t border-border-theme bg-surface flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowOverrideBox(!showOverrideBox);
                setShowExtendBox(false);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors cursor-pointer"
            >
              Override Status
            </button>

            <button
              onClick={() => {
                setShowExtendBox(!showExtendBox);
                setShowOverrideBox(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Extend Deadline
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-text-secondary hover:text-foreground border border-border-theme hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

