"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  fetchAdminUserById
} from "@/redux/admin/users/users_slice";
import AdminUserDetailModal from "./AdminUserDetailModal";

// =========================================================
// SVG ICONS
// =========================================================
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

export default function AdminUsersManager() {
  const dispatch = useDispatch();
  const { users, pagination, loading, error } = useSelector(
    (state) => state.adminUsers || {}
  );

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Debounced search handler
  const loadUsers = useCallback(() => {
    const params = {
      page,
      limit: 10,
      sortBy
    };

    if (search.trim()) params.search = search.trim();
    if (selectedRole !== "all") params.role = selectedRole;
    if (selectedVerification !== "all") params.isVerified = selectedVerification;

    dispatch(fetchAdminUsers(params));
  }, [dispatch, page, search, selectedRole, selectedVerification, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers();
    }, 250);

    return () => clearTimeout(timeout);
  }, [loadUsers]);

  const handleInspectUser = (userId) => {
    dispatch(fetchAdminUserById(userId));
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setPage(1);
  };

  const roleTabs = [
    { label: "All Users", value: "all" },
    { label: "Creators", value: "creator" },
    { label: "Brands", value: "brand" },
    { label: "Administrators", value: "admin" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Browse, inspect dossiers, and review credentials for all platform creators, brands, and admins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-surface border border-border-theme text-xs font-semibold text-foreground shadow-xs">
            {pagination.totalItems ?? 0} Total Records
          </span>
        </div>
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border-theme pb-2 overflow-x-auto custom-scrollbar">
        {roleTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleRoleChange(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedRole === tab.value
                ? "bg-foreground text-background shadow-xs"
                : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-surface border border-border-theme shadow-xs">
        {/* Search input */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 rounded-xl bg-surface-muted/60 border border-border-theme text-foreground placeholder:text-text-secondary text-xs focus:outline-hidden focus:border-secondary transition-colors"
          />
        </div>

        {/* Verification status dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedVerification}
            onChange={(e) => {
              setSelectedVerification(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-surface-muted/60 border border-border-theme text-foreground text-xs focus:outline-hidden focus:border-secondary cursor-pointer"
          >
            <option value="all">All Verification Statuses</option>
            <option value="true">Verified Accounts</option>
            <option value="false">Unverified Accounts</option>
          </select>
        </div>

        {/* Sort order dropdown */}
        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-surface-muted/60 border border-border-theme text-foreground text-xs focus:outline-hidden focus:border-secondary cursor-pointer"
          >
            <option value="newest">Newest Registered</option>
            <option value="oldest">Oldest Registered</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl bg-surface border border-border-theme overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-theme bg-surface-muted/50 text-text-secondary uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3.5 px-4 sm:px-6">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Profile Info</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      <span>Loading platform users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    No users found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : "US";
                  const formattedDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "—";

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-surface-muted/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{user.name}</p>
                            <p className="text-[11px] text-text-secondary truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === "creator"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                              : user.role === "brand"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-secondary/15 text-secondary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Profile Snapshot */}
                      <td className="py-3.5 px-4 text-text-secondary truncate max-w-[180px]">
                        {user.role === "creator"
                          ? user.profile?.category || "Creator"
                          : user.role === "brand"
                          ? user.profile?.companyName || user.profile?.industry || "Brand"
                          : "Administrator"}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            user.isVerified
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {user.isVerified && <ShieldCheckIcon />}
                          <span>{user.isVerified ? "Verified" : "Unverified"}</span>
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleInspectUser(user._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-foreground hover:text-background text-foreground text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <EyeIcon />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border-theme flex items-center justify-between gap-4 text-xs">
            <span className="text-text-secondary">
              Page <span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-surface-muted border border-border-theme text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeftIcon />
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                className="p-2 rounded-xl bg-surface-muted border border-border-theme text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Dossier Inspector Modal */}
      <AdminUserDetailModal />
    </div>
  );
}

