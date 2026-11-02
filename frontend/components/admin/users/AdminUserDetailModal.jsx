"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSelectedUser } from "@/redux/admin/users/users_slice";

// =========================================================
// SVG ICONS
// =========================================================
function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

function GlobeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

export default function AdminUserDetailModal() {
  const dispatch = useDispatch();
  const { selectedUserDossier, detailLoading, detailError } = useSelector(
    (state) => state.adminUsers || {}
  );

  if (!selectedUserDossier && !detailLoading && !detailError) {
    return null;
  }

  const handleClose = () => {
    dispatch(clearSelectedUser());
  };

  const user = selectedUserDossier?.user || {};
  const profile = selectedUserDossier?.profile || {};
  const stats = selectedUserDossier?.stats || {};
  const recentActivity = selectedUserDossier?.recentActivity || {};

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : "US";
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl bg-surface border border-border-theme shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-border-theme pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold text-base uppercase shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground">
                  {user.name || "User Details"}
                </h3>
                {user.isVerified && (
                  <span className="p-0.5 rounded-full bg-blue-500/15 text-blue-500" title="Email Verified">
                    <ShieldCheckIcon className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary">{user.email || ""}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Loading Spinner */}
        {detailLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium uppercase tracking-wider">Loading user profile dossier...</p>
          </div>
        )}

        {/* Error Alert */}
        {detailError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-medium">
            {detailError}
          </div>
        )}

        {/* Content Body */}
        {!detailLoading && !detailError && selectedUserDossier && (
          <div className="space-y-6">
            {/* Meta Tags Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-wider">
                Role: {user.role}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  user.isVerified
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {user.isVerified ? "Verified Account" : "Unverified"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted text-text-secondary text-xs">
                <CalendarIcon className="w-3.5 h-3.5" />
                Joined {joinedDate}
              </span>
            </div>

            {/* Profile Summary Card */}
            {user.role === "creator" && (
              <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-theme space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Creator Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-text-secondary block">Category</span>
                    <span className="font-semibold text-foreground">{profile?.category || "Uncategorized"}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Location</span>
                    <span className="font-semibold text-foreground">{profile?.location || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Followers</span>
                    <span className="font-semibold text-foreground">
                      {profile?.followerCount ? profile.followerCount.toLocaleString() : "0"}
                    </span>
                  </div>
                </div>
                {profile?.bio && (
                  <p className="text-xs text-text-secondary pt-2 border-t border-border-theme">
                    {profile.bio}
                  </p>
                )}
              </div>
            )}

            {user.role === "brand" && (
              <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-theme space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Brand Company Dossier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-text-secondary block">Company Name</span>
                    <span className="font-semibold text-foreground">{profile?.companyName || user.name}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Industry</span>
                    <span className="font-semibold text-foreground">{profile?.industry || "General"}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Website</span>
                    {profile?.website ? (
                      <a
                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline truncate"
                      >
                        <GlobeIcon className="w-3.5 h-3.5" />
                        <span>Visit</span>
                      </a>
                    ) : (
                      <span className="text-text-secondary">Not set</span>
                    )}
                  </div>
                </div>
                {profile?.description && (
                  <p className="text-xs text-text-secondary pt-2 border-t border-border-theme">
                    {profile.description}
                  </p>
                )}
              </div>
            )}

            {/* Statistics Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                Platform Activity & Financial Telemetry
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {user.role === "creator" ? (
                  <>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Total Bookings</span>
                      <span className="text-lg font-bold text-foreground">{stats.totalBookings ?? 0}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Active Workspaces</span>
                      <span className="text-lg font-bold text-amber-500">{stats.activeWorkspaces ?? 0}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Completed</span>
                      <span className="text-lg font-bold text-emerald-500">{stats.completedWorkspaces ?? 0}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Total Earnings</span>
                      <span className="text-lg font-bold text-foreground">
                        ₹{Number(stats.totalEarnings || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </>
                ) : user.role === "brand" ? (
                  <>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Total Campaigns</span>
                      <span className="text-lg font-bold text-foreground">{stats.totalCampaigns ?? 0}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Live Campaigns</span>
                      <span className="text-lg font-bold text-purple-500">{stats.activeCampaigns ?? 0}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Creator Hires</span>
                      <span className="text-lg font-bold text-foreground">{stats.totalBookings ?? 0}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border-theme">
                      <span className="text-[11px] text-text-secondary block">Total Spent</span>
                      <span className="text-lg font-bold text-foreground">
                        ₹{Number(stats.totalSpent || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-4 p-4 rounded-xl bg-surface border border-border-theme text-xs text-text-secondary">
                    {stats.accountType}: {stats.permissions}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Campaigns or Bookings Section */}
            {user.role === "brand" && recentActivity.campaigns?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                  Recent Campaigns ({recentActivity.campaigns.length})
                </h4>
                <div className="space-y-2">
                  {recentActivity.campaigns.map((camp) => (
                    <div
                      key={camp._id}
                      className="p-3 rounded-xl bg-surface-muted/60 border border-border-theme flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{camp.title}</p>
                        <p className="text-[11px] text-text-secondary">
                          ₹{Number(camp.budget || 0).toLocaleString("en-IN")} • Status: {camp.status}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase">
                        {camp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentActivity.bookings?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                  Recent Collaborations / Bookings ({recentActivity.bookings.length})
                </h4>
                <div className="space-y-2">
                  {recentActivity.bookings.map((b) => (
                    <div
                      key={b._id}
                      className="p-3 rounded-xl bg-surface-muted/60 border border-border-theme flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {user.role === "creator" ? b.brand?.name : b.creator?.name || "Direct Proposal"}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          Agreed: ₹{Number(b.agreedPrice || 0).toLocaleString("en-IN")} • {b.status}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-foreground/10 text-foreground text-[10px] font-bold uppercase">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border-theme flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all cursor-pointer shadow-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

