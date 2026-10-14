import React from "react";
import Link from "next/link";

function formatCurrency(amount, currency = "INR") {
  const numericAmount =
    amount === undefined || amount === null || isNaN(Number(amount))
      ? 0
      : Number(amount);
  const currCode =
    (currency && typeof currency === "string" ? currency.trim().toUpperCase() : "INR") || "INR";

  try {
    if (currCode === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(numericAmount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currCode,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${currCode} ${numericAmount.toLocaleString()}`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  switch (normalized) {
    case "published":
    case "active":
      return {
        label: "Published",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    case "draft":
      return {
        label: "Draft",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-secondary/10 text-secondary border-secondary/20",
      };
    case "closed":
      return {
        label: "Closed",
        color: "bg-secondary/10 text-secondary border-secondary/20",
      };
    default:
      return {
        label: status ? String(status).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function MegaPhoneIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

export default function BrandRecentCampaigns({ campaigns = [] }) {
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-lg sm:text-xl text-foreground">
            Recent Campaigns
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Latest brand campaign briefs, budgets, and lifecycle statuses
          </p>
        </div>
        <Link
          href="/brand/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
        >
          <span>View All</span>
          <ArrowRightIcon />
        </Link>
      </div>

      {safeCampaigns.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-border-theme rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <MegaPhoneIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-lg text-foreground">
            No campaigns yet
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Create your first brand campaign to start receiving creator applications and launch collaborations.
          </p>
          <div className="pt-2">
            <Link
              href="/brand/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold transition-all hover:bg-secondary-dark"
            >
              <PlusIcon />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-theme text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Creators</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {safeCampaigns.map((c, idx) => {
                const badge = getStatusBadge(c.status);
                const reqCreators =
                  typeof c.requiredCreators === "number"
                    ? c.requiredCreators
                    : Array.isArray(c.requiredCreators)
                    ? c.requiredCreators.length
                    : c.requiredCreators || 1;

                return (
                  <tr
                    key={c.id || c._id || idx}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-foreground text-sm font-sans">
                      <Link
                        href={`/brand/campaigns`}
                        className="hover:text-secondary transition-colors"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-medium capitalize">
                      {c.platform || "Multi-Platform"}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-medium">
                      {c.category || "General"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {formatCurrency(c.budget, c.currency || "INR")}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-medium">
                      {reqCreators}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-text-secondary font-medium">
                      {formatDate(c.deadline)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
