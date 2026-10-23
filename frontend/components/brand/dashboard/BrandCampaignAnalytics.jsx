"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandPayments } from "@/redux/brand/payments/payments_slice";

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

function formatYAxisINR(amount) {
  if (amount === 0) return "₹0";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

// Safely derive YYYY-M calendar month key from date string or Date object
function getCalendarMonthKey(dateInput) {
  if (!dateInput) return null;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${d.getMonth()}`;
}

// Generate smooth cubic bezier SVG curve across an array of {x, y} coordinate objects
function getSmoothCurvePath(points) {
  if (!Array.isArray(points) || points.length < 2) return "";
  const valid = points.filter(
    (p) => p && typeof p.x === "number" && isFinite(p.x) && typeof p.y === "number" && isFinite(p.y)
  );
  if (valid.length < 2) return "";

  return valid.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const dx = (pt.x - prev.x) / 2;
    const cx1 = (prev.x + dx).toFixed(1);
    const cy1 = prev.y.toFixed(1);
    const cx2 = (pt.x - dx).toFixed(1);
    const cy2 = pt.y.toFixed(1);
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");
}

// Generate closed area SVG path beneath a curve down to baseline
function getAreaCurvePath(pathD, points, baselineY) {
  if (!pathD || !Array.isArray(points) || points.length < 2) return "";
  const valid = points.filter(
    (p) => p && typeof p.x === "number" && isFinite(p.x) && typeof p.y === "number" && isFinite(p.y)
  );
  if (valid.length < 2) return "";
  const first = valid[0];
  const last = valid[valid.length - 1];
  return `${pathD} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}

// =========================================================
// CAMPAIGN STATUS DONUT CHART (Right-side Card)
// =========================================================
const STATUS_CONFIG = [
  { key: "published", label: "Published", color: "#ff4f87" },
  { key: "in_progress", label: "In Progress", color: "#3b82f6" },
  { key: "draft", label: "Draft", color: "#f59e0b" },
  { key: "completed", label: "Completed", color: "#10b981" },
  { key: "paused", label: "Paused", color: "#8b5cf6" },
  { key: "closed", label: "Closed", color: "#64748b" },
];

function CampaignStatusDonut({ statusBreakdown = {}, totalCampaigns = 0 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  // Filter items with count > 0 to construct valid donut segments
  const validSegments = useMemo(() => {
    const segments = [];
    let cumulative = 0;

    STATUS_CONFIG.forEach((cfg) => {
      const count = Number(statusBreakdown?.[cfg.key] || 0);
      if (count > 0 && totalCampaigns > 0) {
        const percentage = (count / totalCampaigns) * 100;
        const strokeLength = (count / totalCampaigns) * circumference;
        segments.push({
          ...cfg,
          count,
          percentage: Math.round(percentage),
          exactPercentage: percentage.toFixed(1),
          offset: cumulative,
          strokeLength,
        });
        cumulative += strokeLength;
      }
    });

    return segments;
  }, [statusBreakdown, totalCampaigns, circumference]);

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-5 w-full">
      {/* SVG Donut */}
      <div className="relative w-40 h-40 sm:w-44 sm:h-44 lg:w-40 lg:h-40 xl:w-44 xl:h-44 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full -rotate-90 transform"
        >
          {/* Background Track Circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="20"
            className="text-surface-muted dark:text-surface-muted/60"
          />

          {/* Slices */}
          {validSegments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <circle
                key={seg.key}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? "24" : "20"}
                strokeDasharray={`${seg.strokeLength} ${circumference - seg.strokeLength}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
          <span className="font-sans text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-foreground leading-none">
            {hoveredIndex !== null ? validSegments[hoveredIndex]?.count : totalCampaigns}
          </span>
          <span className="text-[11px] font-sans font-medium text-text-secondary mt-1">
            {hoveredIndex !== null
              ? validSegments[hoveredIndex]?.label
              : totalCampaigns === 1
                ? "Campaign"
                : "Campaigns"}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="flex-1 w-full space-y-2.5">
        {validSegments.length === 0 ? (
          <div className="text-center py-4 text-xs text-text-secondary font-sans">
            No active campaign statuses recorded yet.
          </div>
        ) : (
          validSegments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={seg.key}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                  isHovered ? "bg-surface-muted shadow-2xs" : "hover:bg-surface-muted/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs font-medium text-foreground truncate font-sans">
                    {seg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-sans">
                  <span className="text-xs font-semibold text-foreground">
                    {seg.count}
                  </span>
                  <span className="text-[11px] text-text-secondary font-medium w-11 text-right">
                    {seg.percentage}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// =========================================================
// CAMPAIGN PERFORMANCE LINE CHART (SVG)
// =========================================================
function CampaignPerformanceChart({
  recentCampaigns = [],
  totalSpending = 0,
  totalRecentBudget = 0,
  totalCampaigns = 0,
  paymentsHistory = [],
  paymentsPagination = null,
  paymentsLoading = false,
  paymentsError = null,
  onRetryPayments = null,
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const lastTouchTimeRef = useRef(0);
  const [monthTimestamp, setMonthTimestamp] = useState(() => Date.now());

  const isRecentTouch = () => Date.now() - lastTouchTimeRef.current < 500;

  // Re-anchor timeline when tab becomes visible or on month boundary without frequent timers
  useEffect(() => {
    let timerId = null;

    const checkMonthTransition = () => {
      const currentDate = new Date();
      const currentKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      setMonthTimestamp((prev) => {
        const memoDate = new Date(prev);
        const memoKey = `${memoDate.getFullYear()}-${memoDate.getMonth()}`;
        if (currentKey !== memoKey) {
          return Date.now();
        }
        return prev;
      });
    };

    const scheduleNextCheck = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
      const delay = Math.max(1000, tomorrow.getTime() - now.getTime());

      timerId = setTimeout(() => {
        checkMonthTransition();
        scheduleNextCheck();
      }, delay);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkMonthTransition();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    scheduleNextCheck();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []);

  // Derive 6 consecutive calendar months ending at current calendar month
  const timelineMonths = useMemo(() => {
    const dNow = new Date(monthTimestamp);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(dNow.getFullYear(), dNow.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        key: `${d.getFullYear()}-${d.getMonth()}`,
      });
    }
    return months;
  }, [monthTimestamp]);

  // Aggregate monthly budget and spending from genuine available records
  const monthlyData = useMemo(() => {
    const budgetMap = {};
    const spendingMap = {};
    const countMap = {};

    // Initialize all 6 timeline slots with confirmed 0
    timelineMonths.forEach((m) => {
      budgetMap[m.key] = 0;
      spendingMap[m.key] = 0;
      countMap[m.key] = 0;
    });

    // 1. Budget Series: aggregate genuine campaign budgets by creation month
    // Every valid campaign with a valid createdAt increments monthly count,
    // distinguishing missing/null budgets from genuine zero budgets
    if (Array.isArray(recentCampaigns)) {
      recentCampaigns.forEach((c) => {
        if (!c || !c.createdAt) return;
        const key = getCalendarMonthKey(c.createdAt);
        if (!key || budgetMap[key] === undefined) return;

        // Increment count independently of budget value
        countMap[key] += 1;

        // Distinguish genuine numeric budgets (including 0) from missing/null/undefined values
        if (c.budget !== null && c.budget !== undefined && c.budget !== "") {
          const b = typeof c.budget === "number" ? c.budget : Number(c.budget);
          if (!isNaN(b) && b >= 0 && isFinite(b)) {
            budgetMap[key] += b;
          }
        }
      });
    }

    // 2. Spends Series: aggregate from actual paid payment transactions
    let hasMappedPayments = false;
    let paidTransactionsCount = 0;

    if (Array.isArray(paymentsHistory) && paymentsHistory.length > 0) {
      paymentsHistory.forEach((p) => {
        if (!p) return;
        const status = typeof p.status === "string" ? p.status.trim().toLowerCase() : "";
        // Backend contract: only "paid" indicates confirmed spending
        if (status !== "paid") return;

        const date = p.paidAt || p.createdAt;
        if (!date) return;
        const key = getCalendarMonthKey(date);
        if (!key || spendingMap[key] === undefined) return;

        const amt = typeof p.amount === "number" ? p.amount : Number(p.amount);
        if (!isNaN(amt) && amt > 0 && isFinite(amt)) {
          spendingMap[key] += amt;
          hasMappedPayments = true;
          paidTransactionsCount += 1;
        }
      });
    }

    return {
      budgetMap,
      spendingMap,
      countMap,
      hasMappedPayments,
      paidTransactionsCount,
    };
  }, [timelineMonths, recentCampaigns, paymentsHistory]);

  // Enhanced chart dimensions giving ample horizontal room for Y-axis currency labels and vertical room for both series
  const svgWidth = 680;
  const svgHeight = 210;
  const paddingLeft = 92;
  const paddingRight = 32;
  const paddingTop = 20;
  const paddingBottom = 28;
  const innerWidth = svgWidth - paddingLeft - paddingRight;
  const innerHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + innerHeight;

  // Dynamic shared Y-axis ceiling, calibrated strictly from plotted values
  const maxVal = useMemo(() => {
    const recordedBudgets = Object.values(monthlyData.budgetMap);
    const recordedSpends = Object.values(monthlyData.spendingMap);
    const maxPlotted = Math.max(0, ...recordedBudgets, ...recordedSpends);

    if (maxPlotted <= 50000) return 50000;
    if (maxPlotted <= 100000) return 100000;
    if (maxPlotted <= 200000) return 200000;
    if (maxPlotted <= 300000) return 300000;
    if (maxPlotted <= 400000) return 400000;
    if (maxPlotted <= 500000) return 500000;
    if (maxPlotted <= 1000000) return 1000000;
    return Math.ceil(maxPlotted / 500000) * 500000;
  }, [monthlyData]);

  // Compute all 6 timeline slots with separate, independent Y coordinates
  const timelineSlots = useMemo(() => {
    return timelineMonths.map((m, idx) => {
      const x = paddingLeft + (idx / (timelineMonths.length - 1)) * innerWidth;
      const budgetVal = monthlyData.budgetMap[m.key] || 0;
      const spendsVal = monthlyData.spendingMap[m.key] || 0;
      const campaignsCount = monthlyData.countMap[m.key] || 0;

      // Independent Y-coordinate calculations directly from zero baseline
      const budgetY = baselineY - (budgetVal / maxVal) * innerHeight;
      const spendsY = baselineY - (spendsVal / maxVal) * innerHeight;

      return {
        key: m.key,
        label: m.label,
        year: m.year,
        x,
        budget: budgetVal,
        budgetY,
        hasBudget: budgetVal > 0,
        spends: spendsVal,
        spendsY,
        hasSpends: spendsVal > 0,
        campaignsCount,
      };
    });
  }, [timelineMonths, monthlyData, innerWidth, innerHeight, maxVal, paddingLeft, baselineY]);

  // Separate Series 1: 6 Budget Points across timeline
  const budgetSeries = useMemo(() => {
    return timelineSlots.map((s) => ({
      key: s.key,
      x: s.x,
      y: s.budgetY,
      value: s.budget,
      label: s.label,
      year: s.year,
      campaignsCount: s.campaignsCount,
      hasData: s.hasBudget,
    }));
  }, [timelineSlots]);

  // Separate Series 2: 6 Spending Points across timeline
  const spendingSeries = useMemo(() => {
    return timelineSlots.map((s) => ({
      key: s.key,
      x: s.x,
      y: s.spendsY,
      value: s.spends,
      label: s.label,
      year: s.year,
      campaignsCount: s.campaignsCount,
      hasData: s.hasSpends,
    }));
  }, [timelineSlots]);

  // Independent SVG paths for each series across all 6 calendar months
  const budgetPathD = useMemo(() => {
    return getSmoothCurvePath(budgetSeries);
  }, [budgetSeries]);

  const spendingPathD = useMemo(() => {
    return getSmoothCurvePath(spendingSeries);
  }, [spendingSeries]);

  const spendingAreaD = useMemo(() => {
    return getAreaCurvePath(spendingPathD, spendingSeries, baselineY);
  }, [spendingPathD, spendingSeries, baselineY]);

  const gridRatios = [1, 0.75, 0.5, 0.25, 0];

  // Active endpoint points in October
  const octoberSlot = timelineSlots[timelineSlots.length - 1];
  const isPartialCampaignList = totalCampaigns > recentCampaigns.length;

  const totalPaymentItems = Number(paymentsPagination?.totalItems);
  const totalPaymentPages = Number(paymentsPagination?.totalPages);
  const currentPaymentPage = Number(paymentsPagination?.page ?? paymentsPagination?.currentPage);

  const hasValidTotalItems =
    paymentsPagination?.totalItems !== undefined &&
    paymentsPagination?.totalItems !== null &&
    !isNaN(totalPaymentItems) &&
    isFinite(totalPaymentItems) &&
    totalPaymentItems >= 0;

  const hasValidTotalCount =
    hasValidTotalItems && totalPaymentItems > paymentsHistory.length;

  const hasValidPages =
    !isNaN(totalPaymentPages) &&
    isFinite(totalPaymentPages) &&
    totalPaymentPages > 0 &&
    !isNaN(currentPaymentPage) &&
    isFinite(currentPaymentPage) &&
    currentPaymentPage > 0;

  // Render notice ONLY when pagination data reliably confirms additional transactions exist
  const hasMorePayments = Boolean(
    paymentsPagination &&
      (hasValidTotalCount ||
        (hasValidPages && totalPaymentPages > 1 && currentPaymentPage < totalPaymentPages) ||
        paymentsPagination.hasNextPage === true)
  );

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-3 min-w-0">
      {/* Responsive SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 lg:h-72 select-none"
          onMouseLeave={() => {
            if (!isRecentTouch()) {
              setActiveTooltip(null);
            }
          }}
          onTouchStart={(e) => {
            const isColumn = Boolean(e.target?.closest?.("[data-chart-column='true']"));
            if (!isColumn) {
              lastTouchTimeRef.current = Date.now();
              setActiveTooltip(null);
            }
          }}
          onClick={(e) => {
            if (isRecentTouch()) {
              return;
            }
            const isColumn = Boolean(e.target?.closest?.("[data-chart-column='true']"));
            if (!isColumn) {
              setActiveTooltip(null);
            }
          }}
        >
          <defs>
            {/* Rich pink gradient area beneath spending curve */}
            <linearGradient id="campaignSpendsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff2d6c" stopOpacity="0.28" />
              <stop offset="65%" stopColor="#ff2d6c" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#ff2d6c" stopOpacity="0.02" />
            </linearGradient>

            {/* Subtle glow filter to accentuate pink spending stroke */}
            <filter id="spendsGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#ff2d6c" floodOpacity="0.32" />
            </filter>

            {/* Soft badge shadow for endpoint chips */}
            <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.10" />
            </filter>
          </defs>

          {/* Horizontal Grid lines and INR Y-axis labels */}
          {gridRatios.map((ratio) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const labelValue = Math.round(maxVal * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-border-theme opacity-60 dark:opacity-40"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[11px] sm:text-[11.5px] fill-slate-400 dark:fill-neutral-500 font-sans font-medium"
                >
                  {formatYAxisINR(labelValue)}
                </text>
              </g>
            );
          })}

          {/* X-axis Month Labels (6 consecutive calendar months) */}
          {timelineSlots.map((slot) => {
            const isHovered = activeTooltip?.key === slot.key;
            const hasActivity = slot.hasBudget || slot.hasSpends;
            return (
              <text
                key={slot.key}
                x={slot.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className={`text-[11px] sm:text-[12px] font-sans font-medium select-none ${
                  isHovered || hasActivity
                    ? "fill-slate-900 dark:fill-foreground font-semibold"
                    : "fill-slate-400 dark:fill-neutral-500"
                }`}
              >
                {slot.label}
              </text>
            );
          })}

          {/* Active column hover guide line */}
          {activeTooltip && (
            <line
              x1={activeTooltip.x}
              y1={paddingTop}
              x2={activeTooltip.x}
              y2={baselineY}
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-border-theme opacity-80"
              strokeWidth="1.25"
            />
          )}

          {/* 1. Spending Series Area Gradient (subtle pink fill beneath spending curve) */}
          {spendingAreaD && (
            <path d={spendingAreaD} fill="url(#campaignSpendsGrad)" />
          )}

          {/* 2. Budget Series Line: Vibrant Light Pink (#f472b6) spanning all 6 months */}
          {budgetPathD && (
            <path
              d={budgetPathD}
              fill="none"
              stroke="#f472b6"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 3. Spending Series Line: Vibrant Pink (#ff2d6c) with soft luminescence */}
          {spendingPathD && (
            <path
              d={spendingPathD}
              fill="none"
              stroke="#ff2d6c"
              strokeWidth="3.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#spendsGlow)"
            />
          )}

          {/* 4. Budget Markers at all 6 months */}
          {budgetSeries.map((pt) => {
            const isHovered = activeTooltip?.key === pt.key;
            const isRaised = pt.value > 0;
            return (
              <circle
                key={`budget-${pt.key}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6.5 : isRaised ? 5.5 : 3.5}
                fill="#ffffff"
                stroke="#f472b6"
                strokeWidth={isRaised ? "2.5" : "2"}
                className="transition-all duration-150 cursor-pointer"
              />
            );
          })}

          {/* 5. Spending Markers at all 6 months (concentric at baseline when zero or equal) */}
          {spendingSeries.map((pt) => {
            const isHovered = activeTooltip?.key === pt.key;
            const isRaised = pt.value > 0;
            return (
              <circle
                key={`spends-${pt.key}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 4.5 : isRaised ? 4 : 2}
                fill="#ff2d6c"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-150 cursor-pointer"
              />
            );
          })}

          {/* 6. Permanent Endpoint Value Annotation Badges at October with Collision Avoidance */}
          {octoberSlot && octoberSlot.hasBudget && (() => {
            const collision =
              octoberSlot.hasSpends && Math.abs(octoberSlot.budgetY - octoberSlot.spendsY) < 24;
            const badgeY = collision
              ? (octoberSlot.budgetY <= octoberSlot.spendsY ? octoberSlot.budgetY - 14 : octoberSlot.budgetY + 4)
              : octoberSlot.budgetY - 10;
            return (
              <g className="select-none pointer-events-none" filter="url(#badgeShadow)">
                <rect
                  x={octoberSlot.x - 78}
                  y={badgeY}
                  width="68"
                  height="20"
                  rx="10"
                  className="fill-surface dark:fill-surface stroke-[#f472b6]"
                  strokeWidth="1.5"
                />
                <text
                  x={octoberSlot.x - 44}
                  y={badgeY + 14}
                  textAnchor="middle"
                  className="fill-[#ec4899] dark:fill-[#f472b6] font-sans font-semibold text-[10px]"
                >
                  {formatCurrency(octoberSlot.budget, "INR")}
                </text>
              </g>
            );
          })()}

          {octoberSlot && octoberSlot.hasSpends && (() => {
            const collision =
              octoberSlot.hasBudget && Math.abs(octoberSlot.budgetY - octoberSlot.spendsY) < 24;
            const badgeY = collision
              ? (octoberSlot.spendsY < octoberSlot.budgetY ? octoberSlot.spendsY - 14 : octoberSlot.spendsY + 4)
              : octoberSlot.spendsY - 10;
            return (
              <g className="select-none pointer-events-none" filter="url(#badgeShadow)">
                <rect
                  x={octoberSlot.x - 68}
                  y={badgeY}
                  width="58"
                  height="20"
                  rx="10"
                  fill="#ff2d6c"
                />
                <text
                  x={octoberSlot.x - 39}
                  y={badgeY + 14}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="font-sans font-semibold text-[10px]"
                >
                  {formatCurrency(octoberSlot.spends, "INR")}
                </text>
              </g>
            );
          })()}

          {/* 7. Transparent interactive touch/hover columns for all 6 months */}
          {timelineSlots.map((slot) => {
            const colWidth = innerWidth / 5;
            return (
              <rect
                key={`col-${slot.key}`}
                data-chart-column="true"
                x={slot.x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={innerHeight + 16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => {
                  if (!isRecentTouch()) {
                    setActiveTooltip(slot);
                  }
                }}
                onMouseLeave={() => {
                  if (!isRecentTouch()) {
                    setActiveTooltip(null);
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  lastTouchTimeRef.current = Date.now();
                  setActiveTooltip((curr) => (curr?.key === slot.key ? null : slot));
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isRecentTouch()) {
                    return;
                  }
                  setActiveTooltip((curr) => (curr?.key === slot.key ? null : slot));
                }}
              />
            );
          })}
        </svg>

        {/* Hover / Tap Tooltip Overlay with safe viewport horizontal clamping and top edge protection */}
        {activeTooltip && (() => {
          const minY = Math.min(activeTooltip.budgetY, activeTooltip.spendsY);
          const isNearTop = minY < 70;
          return (
            <div
              className={`absolute pointer-events-none -translate-x-1/2 ${
                isNearTop ? "translate-y-3" : "-translate-y-full -mt-2"
              } px-3 py-2 rounded-xl bg-surface border border-border-theme shadow-lg text-[11px] font-sans z-20 transition-opacity`}
              style={{
                left: `${Math.max(14, Math.min(86, (activeTooltip.x / svgWidth) * 100))}%`,
                top: `${(minY / svgHeight) * 100}%`,
              }}
            >
              <div className="font-semibold text-foreground mb-1">
                {activeTooltip.label} {activeTooltip.year}
              </div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#ff2d6c] shrink-0" />
                <span className="text-text-secondary font-medium">Spends:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(activeTooltip.spends, "INR")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f472b6] shrink-0" />
                <span className="text-text-secondary font-medium">Budget:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(activeTooltip.budget, "INR")}
                </span>
              </div>
              {activeTooltip.campaignsCount > 0 && (
                <div className="text-[10px] text-text-secondary border-t border-border-theme mt-1 pt-1">
                  {activeTooltip.campaignsCount} campaign{activeTooltip.campaignsCount === 1 ? "" : "s"} launched
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Honest Data Status Bar */}
      {paymentsLoading && (
        <div className="py-2 px-3 rounded-xl bg-surface-muted/50 border border-border-theme/60 text-xs text-text-secondary font-sans flex items-center justify-between">
          <span>Syncing verified payment transactions...</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      )}

      {paymentsError && (
        <div className="py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 font-sans flex items-center justify-between gap-3">
          <span className="truncate">
            Historical payment transactions could not be retrieved. Displaying confirmed all-time total in legend.
          </span>
          {typeof onRetryPayments === "function" && (
            <button
              type="button"
              onClick={onRetryPayments}
              disabled={paymentsLoading}
              className="text-xs font-semibold underline text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 shrink-0 cursor-pointer disabled:opacity-50"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Completeness notice when paginated payments exist */}
      {hasMorePayments && (
        <div className="py-1.5 px-3 rounded-lg bg-surface-muted/30 border border-border-theme/40 text-[10px] text-text-secondary font-sans">
          {hasValidTotalCount
            ? `Displaying latest ${paymentsHistory.length} payments of ${totalPaymentItems} total transactions. Older transactions are not included in monthly buckets.`
            : "More payment history exists; older transactions are not included in monthly buckets."}
        </div>
      )}

      {/* Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-text-secondary pt-2 border-t border-border-theme font-sans">
        <span>
          Confirmed Paid Spend: <strong className="text-foreground font-semibold">{formatCurrency(totalSpending, "INR")}</strong>
        </span>
        <span>
          {isPartialCampaignList
            ? `Recent Campaign Budget (${recentCampaigns.length} listed of ${totalCampaigns} total): `
            : `Recent Campaign Budget (${recentCampaigns.length} listed): `}
          <strong className="text-foreground font-semibold">{formatCurrency(totalRecentBudget, "INR")}</strong>
        </span>
      </div>
    </div>
  );
}

// =========================================================
// MAIN EXPORT: 2-COLUMN CAMPAIGN ANALYTICS
// =========================================================
export default function BrandCampaignAnalytics({ metrics, recentCampaigns = [] }) {
  const dispatch = useDispatch();

  // Access payments history and lifecycle from Redux
  const {
    payments: paymentsHistory = [],
    pagination: paymentsPagination = null,
    loading: paymentsLoading = false,
    error: paymentsError = null,
  } = useSelector((state) => state.brandPayments || {});

  // Ref prevents duplicate concurrent requests during initial mount
  const hasRequestedPaymentsRef = useRef(false);

  // Proactively fetch brand payment transactions history once if not yet loaded
  useEffect(() => {
    if (
      !hasRequestedPaymentsRef.current &&
      !paymentsLoading &&
      !paymentsError &&
      paymentsPagination === null &&
      (!paymentsHistory || paymentsHistory.length === 0)
    ) {
      hasRequestedPaymentsRef.current = true;
      dispatch(fetchBrandPayments({ limit: 100 }));
    }
  }, [dispatch, paymentsLoading, paymentsError, paymentsPagination, paymentsHistory]);

  // If a request failed, reset the mount ref so a legitimate retry is never permanently blocked
  useEffect(() => {
    if (paymentsError) {
      hasRequestedPaymentsRef.current = false;
    }
  }, [paymentsError]);

  const handleRetryPayments = () => {
    if (paymentsLoading) return;
    hasRequestedPaymentsRef.current = true;
    dispatch(fetchBrandPayments({ limit: 100 }));
  };

  const totalCampaigns = metrics?.campaigns?.total ?? 0;
  const statusBreakdown = metrics?.campaigns?.statusBreakdown || {};
  const totalSpending = metrics?.totalSpending?.amount ?? 0;

  // Real aggregate campaign budget calculated from recorded campaigns
  const totalRecentBudget = useMemo(() => {
    if (!Array.isArray(recentCampaigns)) return 0;
    return recentCampaigns.reduce((acc, c) => {
      if (!c || c.budget === null || c.budget === undefined || c.budget === "") return acc;
      const b = typeof c.budget === "number" ? c.budget : Number(c.budget);
      return !isNaN(b) && b >= 0 && isFinite(b) ? acc + b : acc;
    }, 0);
  }, [recentCampaigns]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch min-w-0">
      {/* Left Card: Campaign Performance Line Chart */}
      <div className="lg:col-span-8 bg-surface border border-border-theme rounded-2xl p-3.5 sm:p-4.5 md:p-5 shadow-xs flex flex-col justify-between transition-colors min-w-0 overflow-hidden">
        <div className="mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="font-sans font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground tracking-tight">
                Campaign Performance
              </h2>
            </div>

            {/* Compact Header Legend with Real Amounts & Truthful Budget Label */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 text-xs font-sans">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d6c] shrink-0" />
                <span className="text-text-secondary font-medium">Spends:</span>
                <span className="font-semibold text-slate-900 dark:text-foreground">
                  {formatCurrency(totalSpending, "INR")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] shrink-0" />
                <span className="text-text-secondary font-medium">Budget (Recent):</span>
                <span className="font-semibold text-slate-900 dark:text-foreground">
                  {formatCurrency(totalRecentBudget, "INR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CampaignPerformanceChart
          recentCampaigns={recentCampaigns}
          totalSpending={totalSpending}
          totalRecentBudget={totalRecentBudget}
          totalCampaigns={totalCampaigns}
          paymentsHistory={paymentsHistory}
          paymentsPagination={paymentsPagination}
          paymentsLoading={paymentsLoading}
          paymentsError={paymentsError}
          onRetryPayments={handleRetryPayments}
        />
      </div>

      {/* Right Card: Campaign Status Donut Chart */}
      <div className="lg:col-span-4 bg-surface border border-border-theme rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-colors min-w-0 overflow-hidden">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-semibold text-base sm:text-lg text-slate-900 dark:text-foreground tracking-tight">
              Campaign Status
            </h2>
            <span className="text-xs font-semibold text-text-secondary font-sans">
              {totalCampaigns} Total
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Lifecycle distribution of all brand campaigns
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center my-auto py-2">
          <CampaignStatusDonut
            statusBreakdown={statusBreakdown}
            totalCampaigns={totalCampaigns}
          />
        </div>
      </div>
    </div>
  );
}
