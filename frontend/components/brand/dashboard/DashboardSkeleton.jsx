import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Welcome Banner Skeleton */}
      <div className="bg-surface border border-border-theme rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-3 w-full sm:w-2/3">
          <div className="h-4 w-28 bg-surface-muted rounded-full" />
          <div className="h-8 w-64 bg-surface-muted rounded-xl" />
          <div className="h-4 w-full max-w-md bg-surface-muted rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-surface-muted rounded-xl shrink-0" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border-theme rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-surface-muted rounded-md" />
              <div className="h-8 w-8 bg-surface-muted rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-28 bg-surface-muted rounded-lg" />
              <div className="h-3 w-36 bg-surface-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid for Deadlines & Collaborations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border-theme rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-surface-muted rounded-md" />
              <div className="h-3 w-16 bg-surface-muted rounded-md" />
            </div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-surface-muted rounded-xl w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns Table Skeleton */}
      <div className="bg-surface border border-border-theme rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-surface-muted rounded-md" />
          <div className="h-3 w-16 bg-surface-muted rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-surface-muted rounded-xl w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
