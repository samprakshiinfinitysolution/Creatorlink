"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCollaborations,
  fetchCollaborationStats,
  fetchCollaborationDetails,
  clearSelectedCollaboration
} from "@/redux/admin/collaborations/collaborations_slice";
import AdminCollaborationDetailModal from "./AdminCollaborationDetailModal";
import AdminAvatar from "@/components/admin/AdminAvatar";
import { socket, registerSocketConsumer, unregisterSocketConsumer } from "@/lib/socket";

// =========================================================
// SVG ICONS
// =========================================================
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

function CheckBadgeIcon({ className = "w-3.5 h-3.5 text-emerald-400" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
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

export default function AdminCollaborationsManager() {
  const dispatch = useDispatch();
  const {
    collaborations = [],
    stats = {},
    pagination = {},
    loading,
    error,
    selectedCollaboration
  } = useSelector((state) => state.adminCollaborations || {});
  const { adminUser } = useSelector((state) => state.adminAuth || {});

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOverdue, setSelectedOverdue] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const loadData = useCallback(() => {
    dispatch(
      fetchCollaborations({
        page,
        limit: 10,
        status: selectedStatus,
        isOverdue: selectedOverdue,
        sortBy,
        search: search.trim() || undefined
      })
    );
  }, [dispatch, page, selectedStatus, selectedOverdue, sortBy, search]);

  // Real-time synchronization for collaborations lifecycle (submissions, revisions, approvals)
  useEffect(() => {
    const adminId = adminUser?._id || adminUser?.id || "admin_session";
    const consumerId = "admin_collaborations_consumer";
    registerSocketConsumer(consumerId, adminId);

    const handleRealtimeWorkspaceEvent = (data) => {
      loadData();
      dispatch(fetchCollaborationStats());
      if (selectedCollaboration?._id && data?.workspaceId && String(selectedCollaboration._id) === String(data.workspaceId)) {
        dispatch(fetchCollaborationDetails(selectedCollaboration._id));
      }
    };

    socket.on("workspace:deliverable_submitted", handleRealtimeWorkspaceEvent);
    socket.on("workspace:revision_requested", handleRealtimeWorkspaceEvent);
    socket.on("workspace:approved", handleRealtimeWorkspaceEvent);

    return () => {
      unregisterSocketConsumer(consumerId);
      socket.off("workspace:deliverable_submitted", handleRealtimeWorkspaceEvent);
      socket.off("workspace:revision_requested", handleRealtimeWorkspaceEvent);
      socket.off("workspace:approved", handleRealtimeWorkspaceEvent);
    };
  }, [adminUser, loadData, dispatch, selectedCollaboration]);

  useEffect(() => {
    dispatch(fetchCollaborationStats());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadData]);

  const handleOpenModal = (workspaceId) => {
    dispatch(fetchCollaborationDetails(workspaceId));
  };

  const handleCloseModal = () => {
    dispatch(clearSelectedCollaboration());
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedOverdue("all");
    setSortBy("newest");
    setPage(1);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
          Collaboration & Workspace Monitoring
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Real-time oversight over active brand-creator workspaces, submissions, milestones, and deadlines.
        </p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-secondary/30 transition-all">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
            Total Workspaces
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground mt-1.5 block">
            {stats.totalCollaborations || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-blue-500/30 transition-all">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-blue-600 dark:text-blue-400 mt-1.5 block">
            {stats.statusCounts?.in_progress || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-amber-500/30 transition-all">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Submitted Review
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1.5 block">
            {stats.statusCounts?.submitted || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-emerald-500/30 transition-all">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1.5 block">
            {stats.statusCounts?.completed || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs hover:border-rose-500/30 transition-all">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
            Overdue Deadlines
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-serif text-rose-600 dark:text-rose-400 mt-1.5 block">
            {stats.overdueCount || 0}
          </span>
        </div>

        <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1 hover:border-secondary/30 transition-all">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
            Active Volume
          </span>
          <span className="text-xl sm:text-2xl font-bold font-serif text-foreground mt-1.5 block truncate">
            {formatCurrency(stats.totalVolume)}
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Campaign, brand, creator..."
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* OVERDUE */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Timeline Status
            </label>
            <select
              value={selectedOverdue}
              onChange={(e) => {
                setSelectedOverdue(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
            >
              <option value="all">All Timelines</option>
              <option value="true">Overdue Only</option>
              <option value="false">On Track / Finished</option>
            </select>
          </div>

          {/* SORT */}
          <div>
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-muted/60 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="deadline_near">Upcoming Deadline</option>
              <option value="price_high">Value: High to Low</option>
              <option value="price_low">Value: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/50 text-text-secondary uppercase text-[11px] tracking-wider border-b border-border-theme font-semibold">
              <tr>
                <th className="px-5 py-3">Campaign / Service</th>
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Creator</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Deliverables Progress</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Deadline</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme text-foreground">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-32 mb-1.5" />
                      <div className="h-3 bg-surface-muted rounded w-20" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-28 mb-1.5" />
                      <div className="h-3 bg-surface-muted rounded w-24" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-28 mb-1.5" />
                      <div className="h-3 bg-surface-muted rounded w-24" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-16" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-3 bg-surface-muted rounded w-24" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-16" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-muted rounded w-20" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-7 bg-surface-muted rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : collaborations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-text-secondary">
                    <p className="text-sm font-semibold text-foreground">No collaborations found</p>
                    <p className="text-xs text-text-secondary mt-1">
                      No collaborations match your current filter settings.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-3.5 py-1.5 bg-foreground text-background rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                collaborations.map((collab) => (
                  <tr key={collab._id} className="hover:bg-surface-muted/30 transition-colors">
                    {/* CAMPAIGN / SERVICE */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <AdminAvatar
                          src={collab.campaign?.coverImage}
                          name={collab.campaign?.title || collab.service?.title || "Direct Collaboration"}
                          type="campaign"
                          className="w-8 h-8 rounded-lg bg-surface-muted border border-border-theme font-bold text-[10px] text-secondary shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-xs">
                            {collab.campaign?.title || collab.service?.title || "Direct Collaboration"}
                          </div>
                          <div className="text-[10px] text-text-secondary capitalize mt-0.5">
                            {collab.campaign?.platform || "Direct"} • {collab.campaign?.category || "Services"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* BRAND */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <AdminAvatar
                          src={collab.brandProfile?.logo || collab.brand?.avatar}
                          name={collab.brandProfile?.companyName || collab.brand?.name || "Brand"}
                          type="brand"
                          className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[10px] uppercase shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-foreground font-medium truncate max-w-[130px]">
                            <span className="truncate">
                              {collab.brandProfile?.companyName || collab.brand?.name || "Brand"}
                            </span>
                            {Boolean(collab.brandProfile?.isVerifiedBusiness) && (
                              <CheckBadgeIcon className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-text-secondary truncate max-w-[130px]">
                            {collab.brand?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CREATOR */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <AdminAvatar
                          src={collab.creatorProfile?.profileImage || collab.creator?.avatar}
                          name={collab.creatorProfile?.displayName || collab.creator?.name || "Creator"}
                          type="creator"
                          className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-[10px] uppercase shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-foreground font-medium truncate max-w-[130px]">
                            <span className="truncate">
                              {collab.creatorProfile?.displayName || collab.creator?.name || "Creator"}
                            </span>
                            {Boolean(collab.creatorProfile?.isVerifiedBadge) && (
                              <CheckBadgeIcon className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-text-secondary truncate max-w-[130px]">
                            {collab.creator?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* PRICE */}
                    <td className="px-5 py-3.5 font-mono text-foreground font-medium">
                      {formatCurrency(collab.agreedPrice)}
                    </td>

                    {/* PROGRESS */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-text-secondary">
                          {collab.deliverablesSummary?.completed || 0}/{collab.deliverablesSummary?.total || 0}
                        </span>
                        <span className="font-mono text-secondary font-semibold">
                          {collab.deliverablesSummary?.percentage || 0}%
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-surface-muted rounded-full overflow-hidden border border-border-theme">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${collab.deliverablesSummary?.percentage || 0}%` }}
                        />
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                            statusBadgeStyles[collab.status] || statusBadgeStyles.in_progress
                          }`}
                        >
                          {collab.status?.replace("_", " ")}
                        </span>
                        {collab.isOverdue && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    {/* DEADLINE */}
                    <td className="px-5 py-3.5 text-text-secondary text-[11px]">
                      <span className={collab.isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : ""}>
                        {collab.deadline ? new Date(collab.deadline).toLocaleDateString() : "N/A"}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenModal(collab._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border-theme hover:bg-surface-muted text-foreground transition-colors text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-5 py-3.5 bg-surface-muted/40 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <span>
            Showing{" "}
            <strong className="text-foreground">
              {collaborations.length > 0 ? (page - 1) * 10 + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-foreground">
              {Math.min(page * 10, pagination.totalItems || 0)}
            </strong>{" "}
            of <strong className="text-foreground">{pagination.totalItems || 0}</strong> workspaces
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border-theme text-xs text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-text-secondary px-2 font-mono">
              Page {page} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border-theme text-xs text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedCollaboration && (
        <AdminCollaborationDetailModal
          data={selectedCollaboration}
          onClose={handleCloseModal}
          onUpdated={() => {
            loadData();
            dispatch(fetchCollaborationStats());
          }}
        />
      )}
    </div>
  );
}

