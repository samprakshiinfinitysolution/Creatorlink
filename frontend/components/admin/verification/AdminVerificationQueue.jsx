"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVerifications,
  fetchVerificationDetails
} from "@/redux/admin/verification/verification_slice";
import AdminVerificationDetailModal from "./AdminVerificationDetailModal";

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

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const loadVerifications = useCallback(() => {
    dispatch(
      fetchVerifications({
        page,
        limit: 10,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        search: search.trim()
      })
    );
  }, [dispatch, page, roleFilter, statusFilter, sortBy, search]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  const handleOpenReview = async (item) => {
    await dispatch(fetchVerificationDetails(item._id));
    setModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadVerifications();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
              Verification Requests
            </h1>
            <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Verified Badges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review identity proofs and business credentials to grant official verified status.
          </p>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md"
          >
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or doc number..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-surface-muted/60 border border-border-theme rounded-xl text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary transition"
            />
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Tabs */}
            <div className="flex items-center bg-surface-muted/60 p-1 rounded-xl border border-border-theme text-xs">
              {["all", "pending", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg capitalize transition font-medium cursor-pointer ${
                    statusFilter === st
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-surface-muted/60 border border-border-theme rounded-xl px-3 py-2 text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
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
              className="text-xs bg-surface-muted/60 border border-border-theme rounded-xl px-3 py-2 text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Verification Requests Table */}
      <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/50 border-b border-border-theme text-text-secondary uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Applicant</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Document Type</th>
                <th className="px-5 py-3.5">Submitted</th>
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
                      <div className="h-4 w-24 bg-surface-muted rounded" />
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
                  <td colSpan={6} className="px-5 py-12 text-center">
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

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-surface-muted/30 transition group"
                    >
                      {/* Applicant */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-xs font-semibold text-foreground overflow-hidden border border-border-theme">
                            {item.user?.avatar ? (
                              <img
                                src={item.user.avatar}
                                alt={applicantName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initial
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-secondary transition">
                              {applicantName}
                            </p>
                            <p className="text-[11px] text-text-secondary">
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

                      {/* Document Type */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground capitalize">
                          {item.documentType
                            ? item.documentType.replace(/_/g, " ")
                            : "General"}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {item.documentUrls?.length || 0} file(s) attached
                        </p>
                      </td>

                      {/* Submitted */}
                      <td className="px-5 py-4 text-text-secondary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                            item.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : item.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-white bg-secondary/10 hover:bg-secondary rounded-xl border border-secondary/20 transition cursor-pointer"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-surface-muted/40 border-t border-border-theme text-xs text-text-secondary">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} requests)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border-theme hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent text-foreground cursor-pointer"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-border-theme hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent text-foreground cursor-pointer"
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
          onClose={() => setModalOpen(false)}
          onSuccess={loadVerifications}
        />
      )}
    </div>
  );
}
