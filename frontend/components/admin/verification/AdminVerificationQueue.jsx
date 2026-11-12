"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVerifications,
  fetchVerificationDetails,
  clearSelectedVerification,
  approveVerificationRequest,
  rejectVerificationRequest,
  revokeVerificationRequest,
  updateRealtimeVerificationItem,
  updateRealtimeApplicantProfile
} from "@/redux/admin/verification/verification_slice";
import { socket, registerSocketConsumer, unregisterSocketConsumer } from "@/lib/socket";
import AdminVerificationDetailModal from "./AdminVerificationDetailModal";
import AdminAvatar from "@/components/admin/AdminAvatar";

// =========================================================
// SVG ICONS
// =========================================================
function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function AdminVerificationQueue() {
  const dispatch = useDispatch();
  const { verifications, pagination, loading, error, selectedVerification } =
    useSelector((state) => state.adminVerification || {});
  const { adminUser } = useSelector((state) => state.adminAuth || {});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce search input by 400ms to prevent network requests on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const loadVerifications = useCallback(() => {
    dispatch(
      fetchVerifications({
        page,
        limit,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        search: debouncedSearch
      })
    );
  }, [dispatch, page, limit, roleFilter, statusFilter, sortBy, debouncedSearch]);

  const loadVerificationsRef = useRef(loadVerifications);
  useEffect(() => {
    loadVerificationsRef.current = loadVerifications;
  }, [loadVerifications]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  // Real-time Socket.IO listener for live queue updates and applicant profile updates
  useEffect(() => {
    const adminId = adminUser?._id || adminUser?.id || "admin_session";
    const consumerId = "admin_verification_queue_consumer";
    registerSocketConsumer(consumerId, adminId);

    const handleQueueUpdated = (payload) => {
      if (!payload) return;
      if (payload.request) {
        dispatch(updateRealtimeVerificationItem(payload.request));
      }
      if (typeof loadVerificationsRef.current === "function") {
        loadVerificationsRef.current();
      }
    };

    const handleApplicantProfileUpdated = (payload) => {
      if (!payload) return;
      dispatch(updateRealtimeApplicantProfile(payload));
    };

    socket.on("verification:queue_updated", handleQueueUpdated);
    socket.on("verification:applicant_profile_updated", handleApplicantProfileUpdated);

    return () => {
      unregisterSocketConsumer(consumerId);
      socket.off("verification:queue_updated", handleQueueUpdated);
      socket.off("verification:applicant_profile_updated", handleApplicantProfileUpdated);
    };
  }, [dispatch, adminUser]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlVerificationId = searchParams?.get("id");
  const lastOpenedIdRef = useRef(null);

  // Close review modal and clean up query parameter (?id=...) from URL
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    lastOpenedIdRef.current = null;
    dispatch(clearSelectedVerification());

    if (searchParams?.has("id")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("id");
      const newQuery = params.toString();
      const targetUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(targetUrl, { scroll: false });
    }
  }, [searchParams, pathname, router, dispatch]);

  // Deep-linking: auto-open review modal when URL query (?id=...) matches an item or direct fetch by ID
  useEffect(() => {
    if (urlVerificationId && /^[a-f\d]{24}$/i.test(urlVerificationId)) {
      if (lastOpenedIdRef.current !== urlVerificationId) {
        lastOpenedIdRef.current = urlVerificationId;
        dispatch(fetchVerificationDetails(urlVerificationId)).then((res) => {
          if (!res.error && res.payload) {
            setModalOpen(true);
          }
        });
      }
    } else {
      // If URL query id was removed (e.g. Browser Back navigation), close modal if opened by URL
      if (lastOpenedIdRef.current) {
        lastOpenedIdRef.current = null;
        setModalOpen(false);
        dispatch(clearSelectedVerification());
      }
    }
  }, [urlVerificationId, dispatch]);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [decisionModal, setDecisionModal] = useState({
    open: false,
    item: null,
    action: null, // "reject" or "revoke"
    reason: "",
    error: "",
    submitting: false
  });

  const handleOpenReview = async (item) => {
    lastOpenedIdRef.current = String(item._id);
    await dispatch(fetchVerificationDetails(item._id));
    setModalOpen(true);
  };

  const handleQuickApprove = async (item) => {
    setActionLoadingId(item._id);
    try {
      await dispatch(approveVerificationRequest(item._id));
      loadVerifications();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDecisionPrompt = (item, action) => {
    setDecisionModal({
      open: true,
      item,
      action,
      reason: "",
      error: "",
      submitting: false
    });
  };

  const handleConfirmDecision = async () => {
    const cleanReason = (decisionModal.reason || "").trim();
    if (!cleanReason || cleanReason.length < 3) {
      setDecisionModal((prev) => ({
        ...prev,
        error: "Please provide a reason of at least 3 characters."
      }));
      return;
    }
    if (cleanReason.length > 1000) {
      setDecisionModal((prev) => ({
        ...prev,
        error: "Reason cannot exceed 1000 characters."
      }));
      return;
    }

    setDecisionModal((prev) => ({ ...prev, submitting: true, error: "" }));

    try {
      if (decisionModal.action === "revoke") {
        await dispatch(
          revokeVerificationRequest({
            id: decisionModal.item._id,
            reason: cleanReason
          })
        ).unwrap();
      } else {
        await dispatch(
          rejectVerificationRequest({
            id: decisionModal.item._id,
            rejectionReason: cleanReason
          })
        ).unwrap();
      }

      setDecisionModal({
        open: false,
        item: null,
        action: null,
        reason: "",
        error: "",
        submitting: false
      });
      loadVerifications();
    } catch (err) {
      setDecisionModal((prev) => ({
        ...prev,
        submitting: false,
        error: typeof err === "string" ? err : "Failed to record decision."
      }));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanSearch = search.trim();
    if (cleanSearch !== debouncedSearch) {
      setDebouncedSearch(cleanSearch);
      setPage(1);
    } else {
      loadVerifications();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
              Verification Requests
            </h1>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Verified Badges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage creator and brand accounts, review profiles, and grant or revoke official verified badges.
          </p>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-surface border border-border-theme rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full xl:max-w-xs 2xl:max-w-sm"
          >
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-surface-muted/60 border border-border-theme rounded-xl text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition"
            />
          </form>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
            {/* Status Tabs with Horizontal Scrolling on Mobile */}
            <div className="flex items-center overflow-x-auto scrollbar-none bg-surface-muted/60 p-1 rounded-xl border border-border-theme text-xs max-w-full">
              {["all", "pending", "resubmitted", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg capitalize transition font-medium whitespace-nowrap cursor-pointer shrink-0 ${
                    statusFilter === st
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Dropdowns Group */}
            <div className="grid grid-cols-3 sm:flex items-center gap-2">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-surface-muted/60 border border-border-theme rounded-xl px-2 sm:px-3 py-2 text-foreground focus:outline-hidden focus:border-secondary cursor-pointer truncate"
              >
                <option value="all">All Roles</option>
                <option value="creator">Creators</option>
                <option value="brand">Brands</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-surface-muted/60 border border-border-theme rounded-xl px-2 sm:px-3 py-2 text-foreground focus:outline-hidden focus:border-secondary cursor-pointer truncate"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* Per Page Limit */}
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="text-xs bg-surface-muted/60 border border-border-theme rounded-xl px-2 sm:px-3 py-2 text-foreground focus:outline-hidden focus:border-secondary cursor-pointer truncate"
                title="Items per page"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadVerifications}
            className="underline hover:no-underline font-semibold ml-4 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Verification Requests Container: Table (Desktop/Tablet) + Cards (Mobile) */}
      <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs">
        {/* Desktop/Tablet Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/50 border-b border-border-theme text-text-secondary uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Applicant</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Registered Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme text-foreground">
              {loading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-muted" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-28 bg-surface-muted rounded" />
                          <div className="h-2 w-36 bg-surface-muted rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 bg-surface-muted rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-3 w-20 bg-surface-muted rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 bg-surface-muted rounded" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-6 w-16 bg-surface-muted rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <ShieldCheckIcon className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-foreground">
                      No verification requests found
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Try adjusting filters or check back when new applications arrive.
                    </p>
                  </td>
                </tr>
              ) : (
                verifications.map((item) => {
                  const applicantName =
                    item.user?.name || item.user?.fullName || "Unnamed User";
                  const initial = applicantName.charAt(0)?.toUpperCase() || "U";
                  const hasReviewHistory = Array.isArray(item.reviewHistory) && item.reviewHistory.length > 0;
                  const isResubmitted = item.status === "pending" && (Boolean(item.resubmittedAt) || hasReviewHistory);
                  const latestResubmission = item.resubmittedAt || (isResubmitted ? item.updatedAt : null);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-surface-muted/30 transition group"
                    >
                      {/* Applicant */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <AdminAvatar
                            src={
                              item.role === "creator"
                                ? (item.profile?.profileImage || item.user?.avatar)
                                : (item.profile?.logo || item.user?.avatar)
                            }
                            name={applicantName}
                            type={item.role || "user"}
                            className="w-8 h-8 rounded-full bg-surface-muted border border-border-theme font-semibold text-xs text-foreground shrink-0 overflow-hidden"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground group-hover:text-secondary transition truncate">
                              {applicantName}
                            </p>
                            <p className="text-[11px] text-text-secondary truncate">
                              {item.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                            item.role === "creator"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="px-5 py-4 text-text-secondary">
                        <p className="font-medium text-foreground">
                          {new Date(item.user?.createdAt || item.createdAt).toLocaleDateString()}
                        </p>
                        {isResubmitted && latestResubmission && (
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                            Re-sub: {new Date(latestResubmission).toLocaleDateString()}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isResubmitted ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                              RESUBMITTED
                            </span>
                            {latestResubmission && (
                              <p className="text-[10px] text-text-secondary">
                                {new Date(latestResubmission).toLocaleDateString()} {new Date(latestResubmission).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                        ) : item.status === "approved" ? (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            APPROVED
                          </span>
                        ) : item.status === "rejected" ? (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            REJECTED
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {item.status === "approved" ? (
                            <button
                              type="button"
                              onClick={() => handleOpenDecisionPrompt(item, "revoke")}
                              disabled={actionLoadingId === item._id}
                              className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                              title="Revoke Verification Badge with Reason"
                            >
                              Revoke
                            </button>
                          ) : item.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickApprove(item)}
                                disabled={actionLoadingId === item._id}
                                className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-emerald-600 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg border border-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                                title="Approve & Grant Badge"
                              >
                                {actionLoadingId === item._id ? "..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDecisionPrompt(item, "reject")}
                                disabled={actionLoadingId === item._id}
                                className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                                title="Reject Verification with Reason"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(item)}
                              disabled={actionLoadingId === item._id}
                              className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-emerald-600 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg border border-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                              title="Re-Approve & Grant Badge"
                            >
                              {actionLoadingId === item._id ? "..." : "Approve"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-white bg-secondary/10 hover:bg-secondary rounded-lg border border-secondary/20 transition cursor-pointer"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean Applicant Cards (< 768px) */}
        <div className="md:hidden divide-y divide-border-theme">
          {loading ? (
            // Mobile Skeleton Cards
            [...Array(4)].map((_, i) => (
              <div key={i} className="p-4 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-muted" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 bg-surface-muted rounded" />
                      <div className="h-2.5 w-36 bg-surface-muted rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-surface-muted rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="h-3 w-24 bg-surface-muted rounded" />
                  <div className="h-5 w-20 bg-surface-muted rounded-full" />
                </div>
                <div className="h-8 w-full bg-surface-muted rounded-xl" />
              </div>
            ))
          ) : verifications.length === 0 ? (
            <div className="p-8 text-center">
              <ShieldCheckIcon className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">
                No verification requests found
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Try adjusting filters or check back when new applications arrive.
              </p>
            </div>
          ) : (
            verifications.map((item) => {
              const applicantName =
                item.user?.name || item.user?.fullName || "Unnamed User";
              const hasReviewHistory = Array.isArray(item.reviewHistory) && item.reviewHistory.length > 0;
              const isResubmitted = item.status === "pending" && (Boolean(item.resubmittedAt) || hasReviewHistory);
              const latestResubmission = item.resubmittedAt || (isResubmitted ? item.updatedAt : null);

              return (
                <div key={item._id} className="p-4 space-y-3 hover:bg-surface-muted/20 transition">
                  {/* Top: Avatar, Name, Email, Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <AdminAvatar
                        src={
                          item.role === "creator"
                            ? (item.profile?.profileImage || item.user?.avatar)
                            : (item.profile?.logo || item.user?.avatar)
                        }
                        name={applicantName}
                        type={item.role || "user"}
                        className="w-10 h-10 rounded-full bg-surface-muted border border-border-theme font-semibold text-xs text-foreground shrink-0 overflow-hidden"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {applicantName}
                        </p>
                        <p className="text-[11px] text-text-secondary truncate">
                          {item.user?.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        item.role === "creator"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {item.role}
                    </span>
                  </div>

                  {/* Middle: Registered Date & Status */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border-theme/40">
                    <div>
                      <span className="text-text-secondary text-[11px]">Registered: </span>
                      <span className="font-medium text-foreground">
                        {new Date(item.user?.createdAt || item.createdAt).toLocaleDateString()}
                      </span>
                      {isResubmitted && latestResubmission && (
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                          Re-sub: {new Date(latestResubmission).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div>
                      {isResubmitted ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                          RESUBMITTED
                        </span>
                      ) : item.status === "approved" ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          APPROVED
                        </span>
                      ) : item.status === "rejected" ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          REJECTED
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 sm:flex items-center gap-2 pt-1">
                    {item.status === "approved" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDecisionPrompt(item, "revoke")}
                        disabled={actionLoadingId === item._id}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    ) : item.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleQuickApprove(item)}
                          disabled={actionLoadingId === item._id}
                          className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-emerald-600 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-xl border border-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === item._id ? "..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDecisionPrompt(item, "reject")}
                          disabled={actionLoadingId === item._id}
                          className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(item)}
                        disabled={actionLoadingId === item._id}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-emerald-600 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-xl border border-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === item._id ? "..." : "Approve"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenReview(item)}
                      className={`inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-secondary hover:text-white bg-secondary/10 hover:bg-secondary rounded-xl border border-secondary/20 transition cursor-pointer ${
                        item.status === "pending" ? "col-span-2 sm:col-span-1" : "w-full"
                      }`}
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      Review
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-surface-muted/40 border-t border-border-theme text-xs text-text-secondary">
            <div>
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalItems)} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} requests
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border-theme hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent text-foreground cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              
              <span className="px-2 font-medium text-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-border-theme hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent text-foreground cursor-pointer"
                title="Next Page"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && (
        <AdminVerificationDetailModal
          request={selectedVerification}
          onClose={handleCloseModal}
          onSuccess={loadVerifications}
        />
      )}

      {/* Action Reason Confirmation Modal (Reject or Revoke) */}
      {decisionModal.open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() =>
              !decisionModal.submitting &&
              setDecisionModal({ open: false, item: null, action: null, reason: "", error: "", submitting: false })
            }
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg bg-surface border border-border-theme rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {decisionModal.action === "revoke" ? "Revoke Verification Status" : "Reject Verification Request"}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Target Account:{" "}
                  <span className="font-semibold text-foreground">
                    {decisionModal.item?.user?.name || decisionModal.item?.user?.email || "User"}
                  </span>{" "}
                  ({decisionModal.item?.role})
                </p>
              </div>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  decisionModal.action === "revoke"
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                }`}
              >
                {decisionModal.action === "revoke" ? "REVOKE BADGE" : "REJECT"}
              </span>
            </div>

            <div className="p-3 bg-surface-muted/50 rounded-xl border border-border-theme text-xs text-text-secondary leading-relaxed">
              <span className="font-medium text-foreground block mb-1">
                {decisionModal.action === "revoke"
                  ? "Verified badge will be removed immediately."
                  : "Verification request will be marked as rejected."}
              </span>
              The reason entered below is permanent, preserved in review audit history, notified in real-time, and displayed on the user&apos;s profile verification center.
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Official Justification Reason (Required):
                </label>
                <span className="text-[10px] text-text-secondary">
                  {decisionModal.reason.trim().length} / 1000
                </span>
              </div>
              <textarea
                value={decisionModal.reason}
                maxLength={1000}
                onChange={(e) =>
                  setDecisionModal((prev) => ({ ...prev, reason: e.target.value, error: "" }))
                }
                placeholder={
                  decisionModal.action === "revoke"
                    ? "Explain why verified status is being revoked (e.g. Terms violation, inaccurate follower count, business inactive)..."
                    : "Explain why this request is rejected (e.g. Incomplete portfolio, missing required business registration, unverified social reach)..."
                }
                rows={4}
                className="w-full text-xs bg-surface border border-border-theme rounded-xl p-3 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-rose-500"
              />
              {decisionModal.error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {decisionModal.error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-theme">
              <button
                type="button"
                disabled={decisionModal.submitting}
                onClick={() =>
                  setDecisionModal({ open: false, item: null, action: null, reason: "", error: "", submitting: false })
                }
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-foreground rounded-xl border border-border-theme hover:bg-surface-muted transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={decisionModal.submitting}
                onClick={handleConfirmDecision}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {decisionModal.submitting
                  ? "Recording Decision..."
                  : decisionModal.action === "revoke"
                  ? "Confirm Revocation"
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
