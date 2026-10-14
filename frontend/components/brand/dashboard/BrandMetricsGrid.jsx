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

function MegaPhoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function CurrencyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function ClockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function BrandMetricsGrid({ metrics }) {
  const activeCampaigns = metrics?.campaigns?.active ?? 0;
  const totalCampaigns = metrics?.campaigns?.total ?? 0;
  const draftCampaigns = metrics?.campaigns?.statusBreakdown?.draft ?? 0;

  const totalSpending = metrics?.totalSpending?.amount ?? 0;
  const spendingCurrency = metrics?.totalSpending?.currency || "INR";
  const paidCount = metrics?.totalSpending?.paidTransactionsCount ?? 0;
  const outstandingEst = metrics?.pendingPayments?.totalOutstandingEstimated ?? 0;
  const pendingCurrency = metrics?.pendingPayments?.currency || "INR";

  const activeWorkspaces = metrics?.collaborations?.active ?? 0;
  const submittedCount = metrics?.collaborations?.activeStatusBreakdown?.submitted ?? 0;
  const inProgressCount = metrics?.collaborations?.activeStatusBreakdown?.in_progress ?? 0;
  const completedWorkspaces = metrics?.collaborations?.completed ?? 0;

  const pendingBookings = metrics?.pendingBookings?.total ?? 0;
  const creatorApps = metrics?.pendingBookings?.creatorApplications ?? 0;
  const brandProps = metrics?.pendingBookings?.brandProposals ?? 0;

  const cards = [
    {
      title: "Active Campaigns",
      value: activeCampaigns.toString(),
      subtitle: `${totalCampaigns} total · ${draftCampaigns} draft`,
      icon: MegaPhoneIcon,
      accent: "text-emerald-500 bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/40",
    },
    {
      title: "Total Paid Spending",
      value: formatCurrency(totalSpending, spendingCurrency),
      subtitle: `${paidCount} paid${outstandingEst > 0 ? ` · Est. ${formatCurrency(outstandingEst, pendingCurrency)} outstanding` : ""}`,
      icon: CurrencyIcon,
      accent: "text-secondary bg-secondary/10",
      borderHover: "hover:border-secondary/40",
    },
    {
      title: "Active Workspaces",
      value: activeWorkspaces.toString(),
      subtitle: `${submittedCount} submitted · ${inProgressCount} in progress · ${completedWorkspaces} done`,
      icon: LayersIcon,
      accent: "text-blue-500 bg-blue-500/10",
      borderHover: "hover:border-blue-500/40",
    },
    {
      title: "Pending Proposals",
      value: pendingBookings.toString(),
      subtitle: `${creatorApps} to review · ${brandProps} sent`,
      icon: ClockIcon,
      accent: "text-amber-500 bg-amber-500/10",
      borderHover: "hover:border-amber-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`bg-surface border border-border-theme rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${c.borderHover}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2.5 rounded-xl ${c.accent}`}>
                <Icon />
              </div>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-medium text-foreground block tracking-tight">
                {c.value}
              </span>
              <span className="text-[11px] text-text-secondary mt-1 block truncate font-medium">
                {c.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
