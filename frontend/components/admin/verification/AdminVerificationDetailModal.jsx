"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveVerificationRequest,
  rejectVerificationRequest
} from "@/redux/admin/verification/verification_slice";

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

function DocumentIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

export default function AdminVerificationDetailModal({
  request,
  onClose,
  onSuccess
}) {
  const dispatch = useDispatch();
  const { actionLoading, actionError } = useSelector(
    (state) => state.adminVerification || {}
  );

  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  if (!request) return null;

  const {
    _id,
    user,
    role,
    documentType,
    documentNumber,
    documentUrls = [],
    notes,
    status,
    createdAt,
    reviewedAt,
    reviewedBy,
    rejectionReason: existingRejectionReason,
    profile
  } = request;

  const displayName = user?.name || user?.fullName || "Unnamed User";
  const reviewerName = reviewedBy?.name || reviewedBy?.fullName || "Admin";

  const handleApprove = async () => {
    const res = await dispatch(approveVerificationRequest(_id));
    if (res.meta.requestStatus === "fulfilled") {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setRejectError("Rejection reason must be at least 5 characters.");
      return;
    }
    setRejectError("");

    const res = await dispatch(
      rejectVerificationRequest({
        id: _id,
        rejectionReason: rejectionReason.trim()
      })
    );

    if (res.meta.requestStatus === "fulfilled") {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

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
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/80">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">
                Verification Request Review
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  status === "approved"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : status === "rejected"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">ID: {_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Action Error Alert */}
          {actionError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {actionError}
            </div>
          )}

          {/* Applicant Summary */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-lg font-semibold text-white overflow-hidden border border-neutral-700">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {displayName}
                </h3>
                <p className="text-xs text-neutral-400">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                      role === "creator"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {role}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Joined: {new Date(user?.createdAt || createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Context */}
            {profile && (
              <div className="text-right text-xs text-neutral-400 border-t sm:border-t-0 sm:border-l border-neutral-800 pt-3 sm:pt-0 sm:pl-4">
                {role === "creator" ? (
                  <>
                    <p className="text-white font-medium">
                      Category: {profile.category || "Unassigned"}
                    </p>
                    <p>Followers: {profile.followerCount?.toLocaleString() || 0}</p>
                    <p>Location: {profile.location || "Not specified"}</p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-medium">
                      {profile.companyName || "No Company"}
                    </p>
                    <p>Industry: {profile.industry || "Not specified"}</p>
                    <p>Location: {profile.location || "Not specified"}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submission Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4">
              <span className="text-xs text-neutral-500 block mb-1">
                Document Classification
              </span>
              <p className="text-sm font-medium text-white capitalize">
                {documentType ? documentType.replace(/_/g, " ") : "Not specified"}
              </p>
              {documentNumber && (
                <div className="mt-2 pt-2 border-t border-neutral-800/60">
                  <span className="text-xs text-neutral-500 block mb-0.5">
                    Identifier Number
                  </span>
                  <p className="text-xs font-mono text-neutral-300">
                    {documentNumber}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4">
              <span className="text-xs text-neutral-500 block mb-1">
                Submission Date
              </span>
              <p className="text-sm font-medium text-white">
                {new Date(createdAt).toLocaleString()}
              </p>
              {notes && (
                <div className="mt-2 pt-2 border-t border-neutral-800/60">
                  <span className="text-xs text-neutral-500 block mb-0.5">
                    Applicant Remarks
                  </span>
                  <p className="text-xs text-neutral-300 italic">{notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submitted Document Proofs */}
          <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-neutral-300 mb-3 flex items-center gap-1.5">
              <DocumentIcon className="w-4 h-4 text-emerald-400" />
              Attached Proof Documents ({documentUrls.length})
            </h4>

            {documentUrls.length === 0 ? (
              <p className="text-xs text-neutral-500">No documents attached.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documentUrls.map((url, idx) => {
                  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
                  return (
                    <div
                      key={idx}
                      className="group border border-neutral-800 bg-neutral-900 rounded-lg p-2.5 flex items-center justify-between hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {isImage ? (
                          <img
                            src={url}
                            alt={`Doc ${idx + 1}`}
                            className="w-10 h-10 rounded object-cover border border-neutral-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-neutral-400">
                            <DocumentIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-white truncate">
                            Document {idx + 1}
                          </p>
                          <p className="text-[10px] text-neutral-500 truncate">
                            Cloudinary Secure Store
                          </p>
                        </div>
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-400 hover:text-emerald-400 rounded-md hover:bg-neutral-800 transition"
                        title="Open document in new tab"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit / Review History Banner if Already Reviewed */}
          {status !== "pending" && (
            <div
              className={`p-4 rounded-xl border ${
                status === "approved"
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/5 border-rose-500/20 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-sm">
                {status === "approved" ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-rose-400" />
                )}
                Decision: {status.toUpperCase()}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Reviewed on: {new Date(reviewedAt).toLocaleString()}
                {reviewerName && ` by ${reviewerName}`}
              </p>
              {existingRejectionReason && (
                <div className="mt-2 p-2.5 bg-neutral-900/60 rounded-lg text-xs text-rose-400 border border-rose-500/20">
                  <span className="font-semibold block text-neutral-300 mb-0.5">
                    Rejection Justification:
                  </span>
                  {existingRejectionReason}
                </div>
              )}
            </div>
          )}

          {/* Rejection Form Drawer (only when rejecting a pending request) */}
          {showRejectBox && status === "pending" && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-3">
              <label className="block text-xs font-semibold text-rose-300">
                Reason for Rejection (Visible to Applicant):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is rejected (e.g. document expired, illegible image, mismatched names)..."
                rows={3}
                className="w-full text-xs bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
              {rejectError && (
                <p className="text-xs text-rose-400">{rejectError}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectBox(false);
                    setRejectError("");
                  }}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            Close
          </button>

          {status === "pending" && !showRejectBox && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRejectBox(true)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition disabled:opacity-50"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {actionLoading ? "Approving..." : "Approve & Grant Badge"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
