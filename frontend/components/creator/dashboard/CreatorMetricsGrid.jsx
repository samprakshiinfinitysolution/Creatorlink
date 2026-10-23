import React from "react";

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

function CurrencyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LayersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.142 4.5l-4.179 2.25 9.75 5.25 9.75-5.25-4.179-2.25M12 2.25L2.25 7.5l9.75 5.25 9.75-5.25L12 2.25z" />
    </svg>
  );
}

function StarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

export default function CreatorMetricsGrid({ metrics }) {
  // 1. Total Received Earnings (Paid settlements)
  const totalEarnings = metrics?.totalEarnings?.amount ?? 0;
  const earningsCurrency = metrics?.totalEarnings?.currency || "INR";
  const paidCount = metrics?.totalEarnings?.paidTransactionsCount ?? 0;

  // 2. Estimated Pending / Outstanding Payments
  const pendingEst =
    metrics?.pendingPayments?.totalOutstandingEstimated ??
    metrics?.pendingPayments?.amount ??
    0;
  const pendingCurrency = metrics?.pendingPayments?.currency || "INR";
  const directPendingCount = metrics?.pendingPayments?.directPendingCount ?? 0;
  const unpaidWorkspacesCount = metrics?.pendingPayments?.unpaidWorkspacesCount ?? 0;

  // 3. Active Collaborations
  const activeWorkspaces = metrics?.activeCollaborations?.total ?? 0;
  const inProgress = metrics?.activeCollaborations?.breakdown?.inProgress ?? 0;
  const submitted = metrics?.activeCollaborations?.breakdown?.submitted ?? 0;
  const revisionRequested = metrics?.activeCollaborations?.breakdown?.revisionRequested ?? 0;
  const completedWorkspaces = metrics?.completedCollaborations?.total ?? 0;

  // 4. Reviews & Rating
  const avgRating = metrics?.reviews?.averageRating ?? 0;
  const totalReviews = metrics?.reviews?.totalReviews ?? 0;

  const cards = [
    {
      id: "paid-earnings",
      title: "Paid Earnings",
      badge: "Settled",
      value: formatCurrency(totalEarnings, earningsCurrency),
      subtitle: `${paidCount} settled payment${paidCount === 1 ? "" : "s"}`,
      secondaryNote: pendingEst > 0 ? `+${formatCurrency(pendingEst, pendingCurrency)} in pipeline` : null,
      icon: CurrencyIcon,
      accentBg: "bg-black/10 text-black dark:text-white dark:bg-white/10 border border-black/20 dark:border-white/20",
      badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "pending-payments",
      title: "Estimated Pending",
      badge: "Pipeline",
      value: formatCurrency(pendingEst, pendingCurrency),
      subtitle:
        directPendingCount > 0
          ? `${directPendingCount} active order${directPendingCount > 1 ? "s" : ""} pending`
          : unpaidWorkspacesCount > 0
          ? `${unpaidWorkspacesCount} workspace${unpaidWorkspacesCount > 1 ? "s" : ""} in clearance`
          : "Awaiting milestone clearance",
      secondaryNote: "Disbursed upon completion",
      icon: ClockIcon,
      accentBg: "bg-black/10 text-black dark:text-white dark:bg-white/10 border border-black/20 dark:border-white/20",
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: "active-collaborations",
      title: "Active Collaborations",
      badge: activeWorkspaces > 0 ? "Active" : "Ready",
      value: activeWorkspaces.toString(),
      subtitle: `${inProgress} in progress · ${submitted} under review`,
      secondaryNote:
        revisionRequested > 0
          ? `${revisionRequested} revision requested`
          : completedWorkspaces > 0
          ? `${completedWorkspaces} completed total`
          : null,
      icon: LayersIcon,
      accentBg: "bg-black/10 text-black dark:text-white dark:bg-white/10 border border-black/20 dark:border-white/20",
      badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    },
    {
      id: "client-reputation",
      title: "Client Reputation",
      badge: totalReviews > 0 ? "Reviews" : "Rating",
      value:
        totalReviews > 0 && avgRating > 0
          ? `${avgRating.toFixed(1)} ★`
          : "No reviews yet",
      subtitle:
        totalReviews > 0
          ? `${totalReviews} brand review${totalReviews === 1 ? "" : "s"}`
          : "No reviews yet",
      secondaryNote:
        totalReviews > 0
          ? "Average rating from brand partners"
          : "Reviews appear after workspace completion",
      icon: StarIcon,
      accentBg: "bg-black/10 text-black dark:text-white dark:bg-white/10 border border-black/20 dark:border-white/20",
      badgeBg: "bg-[#ff2d6c]/10 text-[#ff2d6c] border-[#ff2d6c]/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="relative bg-surface border border-border-theme hover:border-pink-200/90 dark:hover:border-pink-500/30 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-full group"
          >
            {/* Top row: Card Title & Badge + Accent Icon */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="font-heading font-medium text-sm sm:text-base text-foreground tracking-tight truncate">
                  {c.title}
                </h3>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border uppercase tracking-wider ${c.badgeBg}`}
                >
                  {c.badge}
                </span>
              </div>
              <div className={`p-2.5 rounded-2xl shrink-0 ${c.accentBg}`}>
                <Icon />
              </div>
            </div>

            {/* Bottom block: Prominent Metric Value & Supporting Text */}
            <div className="space-y-1.5 mt-auto pt-2">
              <div
                className="font-heading font-medium text-2xl sm:text-3xl lg:text-[26px] xl:text-3xl text-foreground tracking-tight tabular-nums truncate group-hover:text-secondary transition-colors"
                title={c.value}
              >
                {c.value}
              </div>
              <p className="text-xs text-text-secondary font-sans font-medium leading-relaxed truncate">
                {c.subtitle}
              </p>
              <p className="text-[11px] text-text-secondary/70 font-sans truncate min-h-[16px]">
                {c.secondaryNote || "\u00A0"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
