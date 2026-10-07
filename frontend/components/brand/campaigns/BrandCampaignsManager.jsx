"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import {
  getBrandCampaigns,
  createCampaign,
  getCampaignById,
  updateCampaign,
  clearSelectedCampaign,
} from "@/redux/brand/campaigns/campaigns_slice";

// =========================================================
// HELPER FORMATTERS & BADGES
// =========================================================
function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
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

function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
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
    case "paused":
      return {
        label: "Paused",
        color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-secondary/10 text-secondary border-secondary/20",
      };
    case "closed":
      return {
        label: "Closed",
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      };
    default:
      return {
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown",
        color: "bg-surface-muted text-text-secondary border-border-theme",
      };
  }
}

// Backend-enforced status transition rules
function getValidNextStatuses(currentStatus) {
  switch (currentStatus?.toLowerCase()) {
    case "draft":
      return ["published", "closed"];
    case "published":
      return ["paused", "in_progress", "closed"];
    case "paused":
      return ["published", "closed"];
    case "in_progress":
      return ["completed", "closed"];
    case "completed":
    case "closed":
    default:
      return [];
  }
}

// =========================================================
// SVG ICONS
// =========================================================
function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function EyeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PencilIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
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

function ArrowPathIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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

function XMarkIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function BrandCampaignsManager() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Feedback Notification & Modal States
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "",
    platform: "instagram",
    budget: "",
    deadline: "",
    requiredCreators: "1",
  });
  const [createDeliverables, setCreateDeliverables] = useState([]);
  const [createDeliverableInput, setCreateDeliverableInput] = useState("");

  // Edit Form State
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    platform: "instagram",
    budget: "",
    deadline: "",
    requiredCreators: "1",
    status: "draft",
  });
  const [editDeliverables, setEditDeliverables] = useState([]);
  const [editDeliverableInput, setEditDeliverableInput] = useState("");

  const dispatch = useDispatch();

  const { campaigns, pagination, selectedCampaign, loading, error } = useSelector(
    (state) => state.brandCampaigns || {}
  );

  // Helper to trigger API dispatch with current filters + overrides
  const fetchCampaignsWithFilters = useCallback(
    (overrides = {}) => {
      const targetPage = overrides.page !== undefined ? overrides.page : page;
      const targetSearch = overrides.search !== undefined ? overrides.search : search;
      const targetCategory = overrides.category !== undefined ? overrides.category : category;
      const targetPlatform = overrides.platform !== undefined ? overrides.platform : platform;
      const targetStatus = overrides.status !== undefined ? overrides.status : status;

      const queryParams = {
        page: targetPage,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (targetSearch.trim()) queryParams.search = targetSearch.trim();
      if (targetCategory) queryParams.category = targetCategory;
      if (targetPlatform) queryParams.platform = targetPlatform;
      if (targetStatus) queryParams.status = targetStatus;

      dispatch(getBrandCampaigns(queryParams));
    },
    [dispatch, page, search, category, platform, status]
  );

  // Initial API Call on Mount
  useEffect(() => {
    dispatch(
      getBrandCampaigns({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  }, [dispatch]);

  // Sync Edit Form whenever selectedCampaign updates in Redux
  useEffect(() => {
    if (isEditOpen && selectedCampaign) {
      queueMicrotask(() => {
        setEditForm({
          title: selectedCampaign.title || "",
          description: selectedCampaign.description || "",
          category: selectedCampaign.category || "",
          platform: selectedCampaign.platform || "instagram",
          budget: selectedCampaign.budget !== undefined ? String(selectedCampaign.budget) : "",
          deadline: formatDateForInput(selectedCampaign.deadline),
          requiredCreators: selectedCampaign.requiredCreators !== undefined ? String(selectedCampaign.requiredCreators) : "1",
          status: selectedCampaign.status || "draft",
        });
        setEditDeliverables(
          Array.isArray(selectedCampaign.deliverables) ? [...selectedCampaign.deliverables] : []
        );
      });
    }
  }, [isEditOpen, selectedCampaign]);

  // Handlers for Toolbar Controls
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCampaignsWithFilters({ page: 1 });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    setPage(1);
    fetchCampaignsWithFilters({ category: val, page: 1 });
  };

  const handlePlatformChange = (e) => {
    const val = e.target.value;
    setPlatform(val);
    setPage(1);
    fetchCampaignsWithFilters({ platform: val, page: 1 });
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    setPage(1);
    fetchCampaignsWithFilters({ status: val, page: 1 });
  };

  const handleRetry = () => {
    fetchCampaignsWithFilters();
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
    setPage(newPage);
    fetchCampaignsWithFilters({ page: newPage });
  };

  // Deliverables Handlers for Create Form
  const addCreateDeliverable = () => {
    if (createDeliverableInput.trim()) {
      setCreateDeliverables((prev) => [...prev, createDeliverableInput.trim()]);
      setCreateDeliverableInput("");
    }
  };

  const removeCreateDeliverable = (index) => {
    setCreateDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  // Deliverables Handlers for Edit Form
  const addEditDeliverable = () => {
    if (editDeliverableInput.trim()) {
      setEditDeliverables((prev) => [...prev, editDeliverableInput.trim()]);
      setEditDeliverableInput("");
    }
  };

  const removeEditDeliverable = (index) => {
    setEditDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  // Frontend Validation Helper
  const validateCampaignForm = (data, deliverablesList) => {
    if (!data.title || !data.title.trim()) return "Campaign Title is required.";
    if (!data.description || !data.description.trim()) return "Description is required.";
    if (!data.category || !data.category.trim()) return "Category is required.";
    if (!data.platform) return "Platform is required.";
    if (data.budget === "" || isNaN(Number(data.budget)) || Number(data.budget) < 0) {
      return "Budget must be a number greater than or equal to 0.";
    }
    if (!data.deadline) return "Deadline date is required.";
    if (
      data.requiredCreators === "" ||
      isNaN(Number(data.requiredCreators)) ||
      Number(data.requiredCreators) < 1
    ) {
      return "Required Creators must be at least 1.";
    }
    if (!deliverablesList || deliverablesList.length === 0) {
      return "At least one deliverable item is required.";
    }
    return null;
  };

  // Handle Create Submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const valError = validateCampaignForm(createForm, createDeliverables);
    if (valError) {
      setFormError(valError);
      return;
    }

    setSubmitting(true);
    const payload = {
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      category: createForm.category.trim(),
      platform: createForm.platform,
      budget: Number(createForm.budget),
      deadline: createForm.deadline,
      requiredCreators: Number(createForm.requiredCreators),
      deliverables: createDeliverables,
    };

    const actionResult = await dispatch(createCampaign(payload));
    setSubmitting(false);

    if (createCampaign.fulfilled.match(actionResult)) {
      setIsCreateOpen(false);
      setCreateForm({
        title: "",
        description: "",
        category: "",
        platform: "instagram",
        budget: "",
        deadline: "",
        requiredCreators: "1",
      });
      setCreateDeliverables([]);
      setSuccessMsg("Campaign created successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setFormError(
        typeof actionResult.payload === "string"
          ? actionResult.payload
          : "Campaign creation failed."
      );
    }
  };

  // Handle View Action Click
  const handleViewClick = (campaign) => {
    setFormError("");
    const campaignId = campaign._id || campaign.id;
    if (campaignId) {
      dispatch(getCampaignById(campaignId));
    }
    setIsViewOpen(true);
  };

  // Handle Edit Action Click
  const handleEditClick = (campaign) => {
    setFormError("");
    const campaignId = campaign._id || campaign.id;
    if (campaignId) {
      dispatch(getCampaignById(campaignId));
    }
    setIsEditOpen(true);
  };

  // Handle Edit Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const valError = validateCampaignForm(editForm, editDeliverables);
    if (valError) {
      setFormError(valError);
      return;
    }

    const campaignId = selectedCampaign?._id || selectedCampaign?.id;
    if (!campaignId) {
      setFormError("Campaign ID missing.");
      return;
    }

    setSubmitting(true);
    const payload = {
      campaignId,
      campaignData: {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        platform: editForm.platform,
        budget: Number(editForm.budget),
        deadline: editForm.deadline,
        requiredCreators: Number(editForm.requiredCreators),
        deliverables: editDeliverables,
        status: editForm.status,
      },
    };

    const actionResult = await dispatch(updateCampaign(payload));
    setSubmitting(false);

    if (updateCampaign.fulfilled.match(actionResult)) {
      setIsEditOpen(false);
      dispatch(clearSelectedCampaign());
      setSuccessMsg("Campaign updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setFormError(
        typeof actionResult.payload === "string"
          ? actionResult.payload
          : "Campaign update failed."
      );
    }
  };

  // Modal Closing Handlers
  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setFormError("");
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    dispatch(clearSelectedCampaign());
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setFormError("");
    dispatch(clearSelectedCampaign());
  };

  const currentPage = pagination?.page || page;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems ?? campaigns.length;
  const hasPrevPage = pagination?.hasPrevPage ?? (currentPage > 1);
  const hasNextPage = pagination?.hasNextPage ?? (currentPage < totalPages);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar Component */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Campaigns Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Success Notification Alert */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl p-4 text-xs font-sans flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/20 mb-2">
                Brand Workspace
              </span>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                Campaigns
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Create and manage your brand collaboration campaigns.
              </p>
            </div>

            {/* Create Campaign Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
            >
              <PlusIcon />
              <span>Create Campaign</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
            
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-secondary transition-colors"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                <SearchIcon />
              </span>
            </form>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3 shrink-0">
              
              {/* Category Filter */}
              <select
                value={category}
                onChange={handleCategoryChange}
                className="bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Tech">Tech</option>
                <option value="Fitness">Fitness</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Travel">Travel</option>
                <option value="Gaming">Gaming</option>
              </select>

              {/* Platform Filter */}
              <select
                value={platform}
                onChange={handlePlatformChange}
                className="bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="website">Website</option>
              </select>

              {/* Status Filter */}
              <select
                value={status}
                onChange={handleStatusChange}
                className="bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>

            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-xs font-sans flex items-center justify-between gap-4">
              <span>{typeof error === "string" ? error : "Failed to load campaigns. Please try again."}</span>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowPathIcon />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Main Campaign List Section */}
          <div className="bg-surface border border-border-theme rounded-2xl shadow-xs overflow-hidden">
            
            {/* Loading State Skeleton */}
            {loading && !isViewOpen && !isEditOpen && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-surface-muted rounded-xl animate-pulse w-full" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && campaigns.length === 0 && (
              <div className="text-center py-16 px-4 border-dashed border-border-theme space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <MegaPhoneIcon />
                </div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  No campaigns found
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {search || category || platform || status
                    ? "No campaigns match your selected search criteria or filters. Try adjusting your search parameters."
                    : "You haven't created any campaigns yet. Click the 'Create Campaign' button above to get started."}
                </p>
              </div>
            )}

            {/* Campaign Table (Responsive Desktop / Tablet) */}
            {!loading && !error && campaigns.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-theme bg-surface-muted/40 text-text-secondary uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3.5 px-5">Campaign Title</th>
                      <th className="py-3.5 px-4">Platform</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Budget</th>
                      <th className="py-3.5 px-4">Creators</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Deadline</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {campaigns.map((c) => {
                      const badge = getStatusBadge(c.status);
                      const reqCreators = typeof c.requiredCreators === "number"
                        ? c.requiredCreators
                        : Array.isArray(c.requiredCreators)
                        ? c.requiredCreators.length
                        : c.requiredCreators || 1;

                      return (
                        <tr key={c._id || c.id || c.title} className="hover:bg-surface-muted/30 transition-colors">
                          <td className="py-4 px-5 font-semibold text-foreground text-sm font-sans">
                            {c.title}
                          </td>
                          <td className="py-4 px-4 text-text-secondary font-medium capitalize">
                            {c.platform || "Multi-Platform"}
                          </td>
                          <td className="py-4 px-4 text-text-secondary font-medium">
                            {c.category || "General"}
                          </td>
                          <td className="py-4 px-4 font-semibold text-foreground">
                            {formatCurrency(c.budget)}
                          </td>
                          <td className="py-4 px-4 text-text-secondary font-medium">
                            {reqCreators}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-text-secondary font-medium">
                            {formatDate(c.deadline)}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleViewClick(c)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                                title="View Campaign Details"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditClick(c)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                                title="Edit Campaign"
                              >
                                <PencilIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && campaigns.length > 0 && (
              <div className="border-t border-border-theme px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-text-secondary">
                  Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems} total campaigns)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeftIcon />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface text-xs font-medium text-foreground hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* ========================================================= */}
      {/* 1. CREATE CAMPAIGN MODAL */}
      {/* ========================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface border border-border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-theme flex items-center justify-between">
              <div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  Create Campaign
                </h3>
                <p className="text-xs text-text-secondary">
                  Fill in the campaign details for content creators
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <XMarkIcon />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              {/* Form Validation Error Banner */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Collection Launch"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your brand brief, content expectations, and guidelines..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors resize-y"
                />
              </div>

              {/* Category & Platform Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fashion, Tech, Beauty"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Platform */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Target Platform *
                  </label>
                  <select
                    value={createForm.platform}
                    onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="website">Website</option>
                  </select>
                </div>

              </div>

              {/* Budget, Deadline, Required Creators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Budget */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Budget (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="50000"
                    value={createForm.budget}
                    onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                  />
                </div>

                {/* Required Creators */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Creators Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="2"
                    value={createForm.requiredCreators}
                    onChange={(e) => setCreateForm({ ...createForm, requiredCreators: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

              </div>

              {/* Deliverables List Builder */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Deliverables *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 1 Reel Video, 2 Instagram Stories"
                    value={createDeliverableInput}
                    onChange={(e) => setCreateDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCreateDeliverable();
                      }
                    }}
                    className="flex-1 bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-secondary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addCreateDeliverable}
                    className="px-4 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground text-xs font-semibold hover:border-secondary transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Tags list */}
                {createDeliverables.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {createDeliverables.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeCreateDeliverable(idx)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border-theme flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-border-theme text-foreground text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Campaign"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VIEW CAMPAIGN DETAILS MODAL */}
      {/* ========================================================= */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface border border-border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-theme flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Campaign Details
                </span>
                <h3 className="font-serif font-medium text-lg text-foreground truncate max-w-md">
                  {selectedCampaign?.title || "Campaign"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeViewModal}
                className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <XMarkIcon />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {loading && !selectedCampaign ? (
                <div className="space-y-4 p-4 animate-pulse">
                  <div className="h-6 bg-surface-muted rounded-md w-2/3" />
                  <div className="h-20 bg-surface-muted rounded-xl w-full" />
                  <div className="h-10 bg-surface-muted rounded-xl w-full" />
                </div>
              ) : selectedCampaign ? (
                <>
                  {/* Status & Category Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface-muted/50 border border-border-theme">
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                        Status
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border mt-1 ${
                          getStatusBadge(selectedCampaign.status).color
                        }`}
                      >
                        {getStatusBadge(selectedCampaign.status).label}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                        Platform
                      </span>
                      <span className="font-semibold text-foreground capitalize mt-0.5 block">
                        {selectedCampaign.platform || "Multi-Platform"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                        Category
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {selectedCampaign.category || "General"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                        Created On
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {formatDate(selectedCampaign.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Overview / Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                      Description & Brief
                    </h4>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-line bg-surface-muted/30 p-4 rounded-xl border border-border-theme">
                      {selectedCampaign.description || "No description provided."}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                        Budget
                      </span>
                      <span className="font-serif font-semibold text-base text-foreground mt-0.5 block">
                        {formatCurrency(selectedCampaign.budget)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                        Creators Needed
                      </span>
                      <span className="font-serif font-semibold text-base text-foreground mt-0.5 block">
                        {selectedCampaign.requiredCreators || 1}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-semibold">
                        Deadline
                      </span>
                      <span className="font-serif font-semibold text-base text-foreground mt-0.5 block">
                        {formatDate(selectedCampaign.deadline)}
                      </span>
                    </div>
                  </div>

                  {/* Deliverables List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                      Required Deliverables
                    </h4>
                    {Array.isArray(selectedCampaign.deliverables) && selectedCampaign.deliverables.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCampaign.deliverables.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-surface-muted border border-border-theme text-foreground font-medium"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary">No deliverables specified.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-text-secondary py-4 text-center">Unable to load campaign details.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-theme flex items-center justify-end">
              <button
                type="button"
                onClick={closeViewModal}
                className="px-5 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground text-xs font-semibold hover:border-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EDIT CAMPAIGN MODAL */}
      {/* ========================================================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface border border-border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-theme flex items-center justify-between">
              <div>
                <h3 className="font-serif font-medium text-lg text-foreground">
                  Edit Campaign
                </h3>
                <p className="text-xs text-text-secondary">
                  Update campaign details and valid status transitions
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <XMarkIcon />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              {/* Form Validation Error Banner */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campaign Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors resize-y"
                />
              </div>

              {/* Category, Platform & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Platform */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Target Platform *
                  </label>
                  <select
                    value={editForm.platform}
                    onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="website">Website</option>
                  </select>
                </div>

                {/* Status Transition dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status Transition
                  </label>
                  {(() => {
                    const currentStatus = selectedCampaign?.status || editForm.status;
                    const validNext = getValidNextStatuses(currentStatus);

                    if (validNext.length === 0) {
                      return (
                        <div className="py-2.5">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
                              getStatusBadge(currentStatus).color
                            }`}
                          >
                            {getStatusBadge(currentStatus).label} (Locked)
                          </span>
                        </div>
                      );
                    }

                    return (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer capitalize"
                      >
                        <option value={currentStatus}>
                          Current: {getStatusBadge(currentStatus).label}
                        </option>
                        {validNext.map((st) => (
                          <option key={st} value={st}>
                            Move to: {getStatusBadge(st).label}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

              </div>

              {/* Budget, Deadline, Required Creators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Budget */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Budget (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.budget}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                  />
                </div>

                {/* Required Creators */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Creators Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.requiredCreators}
                    onChange={(e) => setEditForm({ ...editForm, requiredCreators: e.target.value })}
                    className="w-full bg-surface-muted/60 border border-border-theme text-foreground text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

              </div>

              {/* Deliverables List Builder */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Deliverables *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add deliverable..."
                    value={editDeliverableInput}
                    onChange={(e) => setEditDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEditDeliverable();
                      }
                    }}
                    className="flex-1 bg-surface-muted/60 border border-border-theme text-foreground text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-secondary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addEditDeliverable}
                    className="px-4 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground text-xs font-semibold hover:border-secondary transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Tags list */}
                {editDeliverables.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {editDeliverables.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeEditDeliverable(idx)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border-theme flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-border-theme text-foreground text-xs font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
