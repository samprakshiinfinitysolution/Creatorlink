"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import AdminAvatar from "@/components/admin/AdminAvatar";

export default function AdminSubscriptionsManager() {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "plans" | "subscribers"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Tab 1 Data
  const [analytics, setAnalytics] = useState(null);

  // Tab 2 Data
  const [plans, setPlans] = useState([]);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    slug: "",
    description: "",
    priceMonthly: "",
    priceYearly: "",
    currency: "INR",
    monthlyContactQuota: "",
    features: "",
    trialAllowed: true,
  });

  // Tab 3 Data
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberPagination, setSubscriberPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [subFilter, setSubFilter] = useState({ status: "all", billingCycle: "all", search: "" });
  const [selectedSubDetail, setSelectedSubDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Action Modals State
  const [actionType, setActionType] = useState(null); // "extend_trial" | "complimentary" | "suspend" | "reinstate" | "cancel"
  const [actionSub, setActionSub] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [actionExtraDays, setActionExtraDays] = useState(7);
  const [actionPlanId, setActionPlanId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Fetch data on tab change
  useEffect(() => {
    let isMounted = true;
    const fetchTabData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === "dashboard") {
          const res = await axiosInstance.get("/admin/subscriptions/analytics");
          if (res.data?.success && isMounted) setAnalytics(res.data.data);
        } else if (activeTab === "plans") {
          const res = await axiosInstance.get("/admin/subscriptions/plans");
          if (res.data?.success && isMounted) setPlans(res.data.data || []);
        } else if (activeTab === "subscribers") {
          const params = new URLSearchParams({
            page: subscriberPagination.page,
            limit: subscriberPagination.limit,
            status: subFilter.status,
            billingCycle: subFilter.billingCycle,
            search: subFilter.search,
          });
          const res = await axiosInstance.get(`/admin/subscriptions/subscribers?${params.toString()}`);
          if (res.data?.success && isMounted) {
            setSubscribers(res.data.data?.subscribers || []);
            setSubscriberPagination(res.data.data?.pagination || { page: 1, limit: 10, totalPages: 1 });
          }
        }
      } catch (err) {
        console.error("Admin subscriptions fetch error:", err);
        if (isMounted) setError(err.response?.data?.message || "Failed to load subscription data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTabData();
    return () => {
      isMounted = false;
    };
  }, [activeTab, subscriberPagination.page, subFilter.status, subFilter.billingCycle]);

  // Handle plan create submit
  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...planForm,
        priceMonthly: Number(planForm.priceMonthly),
        priceYearly: Number(planForm.priceYearly),
        monthlyContactQuota: Number(planForm.monthlyContactQuota),
        features: (planForm.features || "").split("\n").map((f) => f.trim()).filter(Boolean),
      };
      const res = await axiosInstance.post("/admin/subscriptions/plans", payload);
      if (res.data?.success) {
        showSuccess("Plan created successfully!");
        setIsCreatePlanOpen(false);
        setPlanForm({
          name: "",
          slug: "",
          description: "",
          priceMonthly: "",
          priceYearly: "",
          currency: "INR",
          monthlyContactQuota: "",
          features: "",
          trialAllowed: true,
        });
        const refetched = await axiosInstance.get("/admin/subscriptions/plans");
        setPlans(refetched.data?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create plan");
    }
  };

  // Handle plan update submit
  const handleUpdatePlanSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      const payload = {
        ...planForm,
        priceMonthly: Number(planForm.priceMonthly),
        priceYearly: Number(planForm.priceYearly),
        monthlyContactQuota: Number(planForm.monthlyContactQuota),
        features: (planForm.features || "").split("\n").map((f) => f.trim()).filter(Boolean),
        reason: "Admin updated plan parameters",
      };
      const res = await axiosInstance.patch(`/admin/subscriptions/plans/${editingPlan._id}`, payload);
      if (res.data?.success) {
        showSuccess("Plan updated and version bumped successfully!");
        setIsEditPlanOpen(false);
        setEditingPlan(null);
        const refetched = await axiosInstance.get("/admin/subscriptions/plans");
        setPlans(refetched.data?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update plan");
    }
  };

  // Toggle Plan Status
  const handleTogglePlan = async (plan) => {
    try {
      const nextActive = !plan.isActive;
      await axiosInstance.patch(`/admin/subscriptions/plans/${plan._id}/status`, {
        isActive: nextActive,
        reason: nextActive ? "Plan reactivated" : "Plan deactivated by admin",
      });
      showSuccess(`Plan ${nextActive ? "activated" : "deactivated"} successfully!`);
      const refetched = await axiosInstance.get("/admin/subscriptions/plans");
      setPlans(refetched.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle plan status");
    }
  };

  // Open Subscriber Detail
  const handleOpenSubscriberDetail = async (subId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/admin/subscriptions/subscribers/${subId}`);
      if (res.data?.success) {
        setSelectedSubDetail(res.data.data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      setError("Failed to load subscriber details");
    } finally {
      setLoading(false);
    }
  };

  // Execute Privileged Action
  const handleExecuteAction = async () => {
    if (!actionReason.trim()) {
      setError("A detailed reason is required for administrative actions");
      return;
    }
    setActionLoading(true);
    setError(null);

    try {
      if (actionType === "extend_trial") {
        await axiosInstance.post("/admin/subscriptions/actions/extend-trial", {
          brandId: actionSub.brand?._id || actionSub.brand,
          extraDays: Number(actionExtraDays),
          reason: actionReason.trim(),
        });
        showSuccess(`Trial extended by ${actionExtraDays} days!`);
      } else if (actionType === "complimentary") {
        await axiosInstance.post("/admin/subscriptions/actions/complimentary", {
          brandId: actionSub.brand?._id || actionSub.brand,
          planId: actionPlanId,
          durationDays: Number(actionExtraDays) || 30,
          reason: actionReason.trim(),
        });
        showSuccess("Complimentary subscription granted!");
      } else if (actionType === "suspend") {
        await axiosInstance.post("/admin/subscriptions/actions/suspend", {
          brandId: actionSub.brand?._id || actionSub.brand,
          reason: actionReason.trim(),
        });
        showSuccess("Subscription suspended and campaigns paused!");
      } else if (actionType === "reinstate") {
        await axiosInstance.post("/admin/subscriptions/actions/reinstate", {
          brandId: actionSub.brand?._id || actionSub.brand,
          reason: actionReason.trim(),
        });
        showSuccess("Subscription reinstated!");
      } else if (actionType === "cancel") {
        await axiosInstance.post("/admin/subscriptions/actions/cancel", {
          brandId: actionSub.brand?._id || actionSub.brand,
          immediately: true,
          reason: actionReason.trim(),
        });
        showSuccess("Subscription canceled!");
      }

      setActionType(null);
      setActionReason("");
      setDetailModalOpen(false);

      // Refresh current tab
      if (activeTab === "subscribers") {
        const params = new URLSearchParams({
          page: subscriberPagination.page,
          limit: subscriberPagination.limit,
          status: subFilter.status,
          billingCycle: subFilter.billingCycle,
          search: subFilter.search,
        });
        const res = await axiosInstance.get(`/admin/subscriptions/subscribers?${params.toString()}`);
        setSubscribers(res.data?.data?.subscribers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to execute administrative action");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            <span>Platform Administration</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Subscription Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Configure membership tiers, oversee subscriber lifecycles, and audit privileged subscription overrides.
          </p>
        </div>

        {activeTab === "plans" && (
          <button
            type="button"
            onClick={() => setIsCreatePlanOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs self-start sm:self-auto"
          >
            + Create Subscription Plan
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border-theme pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "dashboard"
              ? "bg-foreground text-background shadow-xs"
              : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          Dashboard & Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "plans"
              ? "bg-foreground text-background shadow-xs"
              : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          Plan Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscribers")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "subscribers"
              ? "bg-foreground text-background shadow-xs"
              : "text-text-secondary hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          Subscribers Roster
        </button>
      </div>

      {/* TAB 1: DASHBOARD TELEMETRY */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {analytics && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="p-4 rounded-2xl bg-surface border border-border-theme text-center shadow-xs hover:border-secondary/30 transition-all">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Subscribers</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground block mt-1.5">
                    {analytics.telemetry.totalSubscribers}
                  </span>
                  <span className="text-[10px] text-text-secondary mt-1 block">Total brands</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border-theme text-center shadow-xs hover:border-purple-500/30 transition-all">
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Active Trials</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground block mt-1.5">
                    {analytics.telemetry.activeTrials}
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 block font-medium">Free evaluation</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border-theme text-center shadow-xs hover:border-emerald-500/30 transition-all">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Active Paid</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground block mt-1.5">
                    {analytics.telemetry.activePaid}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">Paid members</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border-theme text-center shadow-xs hover:border-rose-500/30 transition-all">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">Expired</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground block mt-1.5">
                    {analytics.telemetry.expiredCount}
                  </span>
                  <span className="text-[10px] text-text-secondary mt-1 block">Locked out</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border-theme text-center shadow-xs hover:border-amber-500/30 transition-all">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Past Due</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground block mt-1.5">
                    {analytics.telemetry.pastDueCount}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">Grace period</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border-theme text-center shadow-xs hover:border-blue-500/30 transition-all">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Complimentary</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground block mt-1.5">
                    {analytics.telemetry.complimentaryCount}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 block font-medium">VIP / Admin grant</span>
                </div>
              </div>

              {/* Revenue Card (Grouped by Currency) */}
              <div className="p-6 rounded-2xl bg-surface border border-border-theme shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-theme pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Verified Subscription Revenue
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Direct Razorpay captured membership transactions (excludes campaign escrow and free trials).
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                    Live Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {analytics.revenue.map((rev) => (
                    <div key={rev.currency} className="p-4 rounded-xl bg-surface-muted/60 border border-border-theme">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary font-medium">Currency: {rev.currency}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Captured</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold font-serif text-foreground mt-2 block">
                        ₹ {rev.totalRevenue.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-text-secondary mt-1 block font-medium">
                        {rev.transactionCount} Successful Transaction{rev.transactionCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  ))}
                  {analytics.revenue.length === 0 && (
                    <div className="text-xs text-text-secondary italic col-span-3 py-4">
                      No captured subscription payments yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

          {/* TAB 2: PLAN MANAGEMENT */}
          {activeTab === "plans" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div
                  key={p._id}
                  className={`p-6 rounded-2xl bg-surface border flex flex-col justify-between space-y-4 ${
                    p.isActive ? "border-border-theme" : "border-border-theme opacity-60 bg-surface-muted/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-foreground">{p.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        v{p.version || 1}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-text-secondary block mt-0.5">{p.slug}</span>
                    <p className="text-xs text-text-secondary mt-2 min-h-[32px]">{p.description}</p>

                    <div className="mt-4 pt-3 border-t border-border-theme space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Monthly:</span>
                        <span className="font-bold text-foreground">{p.currency} {p.priceMonthly.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Yearly:</span>
                        <span className="font-bold text-foreground">{p.currency} {p.priceYearly.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Monthly Quota:</span>
                        <span className="font-bold text-purple-600">{p.monthlyContactQuota} Unlocks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Active Subscribers:</span>
                        <span className="font-semibold text-foreground">{p.activeSubscribersCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-theme flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(p);
                        setPlanForm({
                          name: p.name || "",
                          slug: p.slug || "",
                          description: p.description || "",
                          priceMonthly: p.priceMonthly !== undefined ? p.priceMonthly : "",
                          priceYearly: p.priceYearly !== undefined ? p.priceYearly : "",
                          currency: p.currency || "INR",
                          monthlyContactQuota: p.monthlyContactQuota !== undefined ? p.monthlyContactQuota : "",
                          features: Array.isArray(p.features) ? p.features.join("\n") : (p.features || ""),
                          trialAllowed: p.trialAllowed !== undefined ? p.trialAllowed : true,
                        });
                        setIsEditPlanOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border-theme text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
                    >
                      Edit & Bump Version
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePlan(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        p.isActive ? "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40"
                      }`}
                    >
                      {p.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SUBSCRIBERS ROSTER */}
          {activeTab === "subscribers" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="p-4 rounded-2xl bg-surface border border-border-theme shadow-xs flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search brand name, email, company..."
                  value={subFilter.search}
                  onChange={(e) => setSubFilter((prev) => ({ ...prev, search: e.target.value }))}
                  className="px-3.5 py-2 rounded-xl border border-border-theme text-xs bg-surface-muted/60 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary flex-1 min-w-[200px]"
                />
                <select
                  value={subFilter.status}
                  onChange={(e) => setSubFilter((prev) => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 rounded-xl border border-border-theme text-xs bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="trialing">Trialing</option>
                  <option value="active">Active</option>
                  <option value="past_due">Past Due</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={subFilter.billingCycle}
                  onChange={(e) => setSubFilter((prev) => ({ ...prev, billingCycle: e.target.value }))}
                  className="px-3 py-2 rounded-xl border border-border-theme text-xs bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary cursor-pointer"
                >
                  <option value="all">All Cycles</option>
                  <option value="trial">Trial</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted/40 border-b border-border-theme text-text-secondary font-medium">
                    <tr>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Cycle</th>
                      <th className="py-3 px-4">Quota Used</th>
                      <th className="py-3 px-4">Valid Until</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {subscribers.map((s) => (
                      <tr key={s._id} className="hover:bg-surface-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <AdminAvatar
                              src={s.brand?.logo || s.brand?.avatar}
                              name={s.brand?.companyName || s.brand?.name}
                              type="brand"
                              size="w-8 h-8"
                              shape="rounded-lg"
                              className="shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-foreground block truncate">{s.brand?.companyName || s.brand?.name || "Brand"}</span>
                              <span className="text-[11px] text-text-secondary truncate block">{s.brand?.email}</span>
                              {s.trialEligibility?.isFlagged && (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mt-0.5">
                                  ⚠️ Flagged
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {s.planSnapshot?.name || (s.billingCycle === "trial" ? "Free Trial" : "Custom")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-muted text-foreground border border-border-theme">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize">{s.billingCycle}</td>
                        <td className="py-3 px-4 font-mono">
                          {s.billingCycle === "trial"
                            ? `${s.quotaState?.trialQuotaUsed || 0} / 5`
                            : `${s.quotaState?.monthlyQuotaUsed || 0} / ${s.quotaState?.monthlyQuotaLimit || s.planSnapshot?.monthlyContactQuota || 0}`}
                        </td>
                        <td className="py-3 px-4">
                          {s.billingCycle === "trial"
                            ? new Date(s.trialEndDate).toLocaleDateString()
                            : new Date(s.currentPeriodEnd).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenSubscriberDetail(s._id)}
                            className="px-3 py-1 rounded-lg bg-surface border border-border-theme hover:bg-surface-muted text-foreground font-semibold cursor-pointer"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subscribers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-text-secondary">
                          No subscribers matched the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create Plan Modal */}
          {isCreatePlanOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-surface border border-border-theme rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-bold text-foreground">Create Subscription Plan</h3>
                <form onSubmit={handleCreatePlanSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      placeholder="e.g. Growth Pro"
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Slug</label>
                    <input
                      type="text"
                      required
                      value={planForm.slug}
                      onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                      placeholder="e.g. growth-pro"
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-secondary font-medium mb-1">Monthly Price (INR)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={planForm.priceMonthly}
                        onChange={(e) => setPlanForm({ ...planForm, priceMonthly: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary font-medium mb-1">Yearly Price (INR)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={planForm.priceYearly}
                        onChange={(e) => setPlanForm({ ...planForm, priceYearly: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Monthly Creator Unlocks Quota</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planForm.monthlyContactQuota}
                      onChange={(e) => setPlanForm({ ...planForm, monthlyContactQuota: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Features (One per line)</label>
                    <textarea
                      rows={3}
                      value={planForm.features}
                      onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                      placeholder="Unlimited Campaigns&#10;Workspace Collaborations&#10;Priority Support"
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={planForm.trialAllowed}
                      onChange={(e) => setPlanForm({ ...planForm, trialAllowed: e.target.checked })}
                      className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-foreground font-medium">Eligible for 5-Day Free Trial</span>
                  </label>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatePlanOpen(false)}
                      className="px-4 py-2 rounded-xl border border-border-theme text-xs font-semibold hover:bg-surface-muted cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Save Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Plan Modal */}
          {isEditPlanOpen && editingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-surface border border-border-theme rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">Edit Plan (Version Bump)</h3>
                  <span className="text-xs text-text-secondary">Current Version: v{editingPlan.version || 1}</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Updating prices or contact quotas will increment the plan version. Active brand subscriptions retain their purchased planSnapshot.
                </p>
                <form onSubmit={handleUpdatePlanSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      placeholder="Brief description of the plan..."
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-secondary font-medium mb-1">Monthly Price</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={planForm.priceMonthly}
                        onChange={(e) => setPlanForm({ ...planForm, priceMonthly: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary font-medium mb-1">Yearly Price</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={planForm.priceYearly}
                        onChange={(e) => setPlanForm({ ...planForm, priceYearly: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Monthly Quota</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planForm.monthlyContactQuota}
                      onChange={(e) => setPlanForm({ ...planForm, monthlyContactQuota: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary font-medium mb-1">Features (One per line)</label>
                    <textarea
                      rows={4}
                      value={planForm.features}
                      onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                      placeholder="Unlimited Campaigns&#10;Workspace Collaborations&#10;Priority Support"
                      className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={planForm.trialAllowed}
                      onChange={(e) => setPlanForm({ ...planForm, trialAllowed: e.target.checked })}
                      className="rounded border-border-theme text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-foreground font-medium">Eligible for 5-Day Free Trial</span>
                  </label>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditPlanOpen(false)}
                      className="px-4 py-2 rounded-xl border border-border-theme text-xs font-semibold hover:bg-surface-muted cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Update & Bump Version
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Subscriber Dossier & Action Modal */}
          {detailModalOpen && selectedSubDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-surface border border-border-theme rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-border-theme pb-3">
                  <div className="flex items-center gap-3">
                    <AdminAvatar
                      src={selectedSubDetail.brand?.profile?.logo || selectedSubDetail.brand?.user?.avatar}
                      name={selectedSubDetail.brand?.profile?.companyName || selectedSubDetail.brand?.user?.name}
                      type="brand"
                      size="w-10 h-10"
                      shape="rounded-xl"
                      className="shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {selectedSubDetail.brand?.profile?.companyName || selectedSubDetail.brand?.user?.name || "Brand Subscriber"}
                      </h3>
                      <span className="text-xs text-text-secondary">{selectedSubDetail.brand?.user?.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailModalOpen(false)}
                    className="text-text-secondary hover:text-foreground text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Privileged Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType("extend_trial");
                      setActionSub(selectedSubDetail.subscription);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 cursor-pointer"
                  >
                    Extend Trial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionType("complimentary");
                      setActionSub(selectedSubDetail.subscription);
                      if (plans.length > 0) setActionPlanId(plans[0]._id);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 cursor-pointer"
                  >
                    Grant Complimentary Plan
                  </button>
                  {selectedSubDetail.subscription.status === "suspended" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActionType("reinstate");
                        setActionSub(selectedSubDetail.subscription);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer"
                    >
                      Reinstate Subscription
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActionType("suspend");
                        setActionSub(selectedSubDetail.subscription);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 cursor-pointer"
                    >
                      Suspend Access
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActionType("cancel");
                      setActionSub(selectedSubDetail.subscription);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                </div>

                {/* Audit Action Sub-Form */}
                {actionType && (
                  <div className="p-4 rounded-xl border border-border-theme bg-surface-muted/30 space-y-3 text-xs">
                    <span className="font-bold text-foreground block uppercase tracking-wider">
                      Execute {actionType.replace("_", " ")}
                    </span>
                    {actionType === "extend_trial" && (
                      <div>
                        <label className="block text-text-secondary mb-1">Additional Trial Days</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={actionExtraDays}
                          onChange={(e) => setActionExtraDays(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground text-xs w-32 focus:outline-hidden focus:border-secondary"
                        />
                      </div>
                    )}
                    {actionType === "complimentary" && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-text-secondary mb-1">Select Membership Plan</label>
                          <select
                            value={actionPlanId}
                            onChange={(e) => setActionPlanId(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground text-xs focus:outline-hidden focus:border-secondary"
                          >
                            {plans.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} ({p.currency} {p.priceMonthly}/mo)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-text-secondary mb-1">Duration (Days)</label>
                          <input
                            type="number"
                            value={actionExtraDays}
                            onChange={(e) => setActionExtraDays(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground text-xs w-32 focus:outline-hidden focus:border-secondary"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Mandatory Administrative Audit Reason *
                      </label>
                      <input
                        type="text"
                        required
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="State why this override is being applied..."
                        className="w-full px-3 py-2 rounded-xl border border-border-theme bg-surface-muted/60 text-foreground text-xs placeholder:text-text-secondary focus:outline-hidden focus:border-secondary"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="px-3 py-1.5 rounded-xl border border-border-theme text-xs font-semibold hover:bg-surface-muted cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteAction}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {actionLoading ? "Executing..." : "Confirm & Save Audit Log"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Audit History Log */}
                <div className="space-y-2 pt-2 border-t border-border-theme text-xs">
                  <span className="font-bold text-foreground uppercase tracking-wider block">
                    Administrative Audit Trail
                  </span>
                  {selectedSubDetail.auditLogs?.length === 0 ? (
                    <p className="text-text-secondary italic">No administrative actions logged for this subscription.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedSubDetail.auditLogs?.map((log) => (
                        <div key={log._id} className="p-2.5 rounded-lg bg-surface-muted/40 border border-border-theme">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-foreground">{log.action}</span>
                            <span className="text-text-secondary">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-text-secondary mt-1">
                            Reason: <span className="text-foreground">{log.reason || "None stated"}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

