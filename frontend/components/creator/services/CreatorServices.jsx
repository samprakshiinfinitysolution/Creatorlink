"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getServices,
  createCreatorService,
  updateCreatorService,
  deleteCreatorService,
} from "@/redux/creator/services/services_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

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

function PencilIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

function LockClosedIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function BriefcaseIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387M3.75 14.15a2.18 2.18 0 01-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m4.5 8.006h4.5m-4.5 0a2.25 2.25 0 01-2.25-2.25v-.903c0-.496.186-.975.52-1.341l.228-.25a2.25 2.25 0 011.692-.756h3.64c.642 0 1.25.26 1.692.756l.228.25c.334.366.52.845.52 1.341v.903a2.25 2.25 0 01-2.25 2.25m-4.5 0h4.5M12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3z" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

// =========================================================
// ENUM OPTIONS & CONSTANTS
// =========================================================
const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
  { value: "multiple", label: "Multiple Platforms" },
  { value: "other", label: "Other" },
];

const PRICING_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "starting_from", label: "Starting From" },
  { value: "custom", label: "Custom Quote" },
];

const initialFormState = {
  title: "",
  description: "",
  category: "Social Media Campaign",
  platform: "instagram",
  pricingType: "fixed",
  price: 0,
  currency: "INR",
  deliveryTime: 7,
  revisions: 1,
  deliverables: [],
  isActive: true,
};

export default function CreatorServices() {
  const dispatch = useDispatch();
  const { services, pagination, loading, error } = useSelector((state) => state.services);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [deliverableInput, setDeliverableInput] = useState("");
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmService, setDeleteConfirmService] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Active Toggle Loading State per ID
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  // Fetch Services via Redux Query API
  useEffect(() => {
    const query = {
      page: currentPage,
      limit: 9,
      sortBy,
      sortOrder,
    };

    if (searchQuery.trim()) {
      query.search = searchQuery.trim();
    }
    if (selectedCategory && selectedCategory !== "All") {
      query.category = selectedCategory;
    }
    if (selectedPlatform && selectedPlatform !== "All") {
      query.platform = selectedPlatform;
    }
    if (selectedStatus && selectedStatus !== "All") {
      query.isActive = selectedStatus;
    }

    dispatch(getServices(query));
  }, [
    dispatch,
    currentPage,
    searchQuery,
    selectedCategory,
    selectedPlatform,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const serviceItems = Array.isArray(services) ? services : [];

  // Extract categories dynamically from current services
  const defaultCategories = [
    "Social Media Campaign",
    "Content Creation",
    "Brand Ambassador",
    "Product Review",
    "UGC Video",
  ];
  const dynamicCategories = Array.from(
    new Set([...defaultCategories, ...serviceItems.map((item) => item.category).filter(Boolean)])
  );
  const categoryOptions = ["All", ...dynamicCategories];

  // Open Modal Handlers
  const handleOpenAddModal = () => {
    setEditingServiceId(null);
    setFormData(initialFormState);
    setDeliverableInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingServiceId(service._id || service.id);
    setFormData({
      title: service.title || "",
      description: service.description || "",
      category: service.category || "Social Media Campaign",
      platform: service.platform || "instagram",
      pricingType: service.pricingType || "fixed",
      price: typeof service.price === "number" ? service.price : 0,
      currency: service.currency || "INR",
      deliveryTime: typeof service.deliveryTime === "number" ? service.deliveryTime : 7,
      revisions: typeof service.revisions === "number" ? service.revisions : 1,
      deliverables: Array.isArray(service.deliverables) ? [...service.deliverables] : [],
      isActive: typeof service.isActive === "boolean" ? service.isActive : true,
    });
    setDeliverableInput("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
      setEditingServiceId(null);
      setFormError(null);
    }
  };

  // Input Change Handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (type === "checkbox") {
      val = checked;
    } else if (name === "price" || name === "deliveryTime" || name === "revisions") {
      val = value === "" ? "" : Number(value);
    } else if (name === "currency") {
      val = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // Deliverables Handlers
  const handleAddDeliverable = () => {
    if (!deliverableInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, deliverableInput.trim()],
    }));
    setDeliverableInput("");
  };

  const handleRemoveDeliverable = (index) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler for Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation matching backend rules
    if (!formData.title || !formData.title.trim()) {
      setFormError("Service title is required.");
      return;
    }
    if (formData.title.trim().length > 150) {
      setFormError("Service title must not exceed 150 characters.");
      return;
    }
    if (formData.description && formData.description.length > 2000) {
      setFormError("Description must not exceed 2000 characters.");
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      setFormError("Service category is required.");
      return;
    }
    if (formData.category.trim().length > 100) {
      setFormError("Category must not exceed 100 characters.");
      return;
    }
    if (!formData.platform || !PLATFORM_OPTIONS.some((p) => p.value === formData.platform)) {
      setFormError("Valid service platform is required.");
      return;
    }
    if (formData.pricingType && !PRICING_TYPE_OPTIONS.some((p) => p.value === formData.pricingType)) {
      setFormError("Valid pricing type is required.");
      return;
    }
    if (typeof formData.price !== "number" || formData.price < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }
    if (formData.currency && (typeof formData.currency !== "string" || formData.currency.length !== 3)) {
      setFormError("Currency must be a valid 3-letter uppercase code (e.g. INR, USD).");
      return;
    }
    if (typeof formData.deliveryTime !== "number" || formData.deliveryTime < 1) {
      setFormError("Delivery time must be at least 1 day.");
      return;
    }
    if (typeof formData.revisions !== "number" || formData.revisions < 0) {
      setFormError("Revisions must be a valid non-negative number.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description ? formData.description.trim() : "",
      category: formData.category.trim(),
      platform: formData.platform,
      pricingType: formData.pricingType,
      price: Number(formData.price) || 0,
      currency: (formData.currency || "INR").toUpperCase(),
      deliveryTime: Number(formData.deliveryTime) || 7,
      revisions: Number(formData.revisions) || 0,
      deliverables: formData.deliverables.map((d) => d.trim()).filter(Boolean),
      isActive: Boolean(formData.isActive),
    };

    setSubmitting(true);
    let resultAction;

    if (editingServiceId) {
      resultAction = await dispatch(
        updateCreatorService({
          serviceId: editingServiceId,
          serviceData: payload,
        })
      );
    } else {
      resultAction = await dispatch(createCreatorService(payload));
    }

    setSubmitting(false);

    const isSuccess = editingServiceId
      ? updateCreatorService.fulfilled.match(resultAction)
      : createCreatorService.fulfilled.match(resultAction);

    if (isSuccess) {
      setIsModalOpen(false);
      setEditingServiceId(null);
      setFormData(initialFormState);
    } else {
      setFormError(
        resultAction.payload ||
          (editingServiceId ? "Failed to update service." : "Failed to create service.")
      );
    }
  };

  // Active / Inactive Status Toggle Handler
  const handleToggleActive = async (service) => {
    const serviceId = service._id || service.id;
    if (!serviceId) return;

    setTogglingStatusId(serviceId);
    await dispatch(
      updateCreatorService({
        serviceId,
        serviceData: {
          isActive: !service.isActive,
        },
      })
    );
    setTogglingStatusId(null);
  };

  // Delete Confirm Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmService) return;
    const serviceId = deleteConfirmService._id || deleteConfirmService.id;
    if (!serviceId) return;

    setDeleting(true);
    setDeleteError(null);

    const resultAction = await dispatch(deleteCreatorService(serviceId));
    setDeleting(false);

    if (deleteCreatorService.fulfilled.match(resultAction)) {
      setDeleteConfirmService(null);
    } else {
      setDeleteError(resultAction.payload || "Failed to delete service.");
    }
  };

  // Helper for Formatting Price
  const formatPrice = (service) => {
    const { pricingType, price, currency = "INR" } = service;
    if (pricingType === "custom") {
      return "Custom Quote";
    }
    const formattedNum = new Intl.NumberFormat("en-IN").format(price || 0);
    const symbol = currency === "INR" ? "₹" : `${currency} `;
    if (pricingType === "starting_from") {
      return `Starting at ${symbol}${formattedNum}`;
    }
    return `${symbol}${formattedNum}`;
  };

  // Helper for Formatting Platform Label
  const getPlatformLabel = (val) => {
    const match = PLATFORM_OPTIONS.find((p) => p.value === val);
    return match ? match.label : val;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container Offset by Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* 1. PAGE HEADER */}
          <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
                My Services
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Manage your service packages, pricing, and deliverables.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer shrink-0"
              >
                <PlusIcon />
                <span>Add Service</span>
              </button>
            </div>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-xs font-medium">
              <span>{error}</span>
            </div>
          )}

          {/* 2. SEARCH & FILTER BAR */}
          <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search services by title, description, or category..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors"
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-3 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              {/* Platform Filter */}
              <select
                value={selectedPlatform}
                onChange={(e) => {
                  setSelectedPlatform(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-3 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="All">Platform: All</option>
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-3 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="All">Status: All</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-3 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="createdAt">Sort: Date</option>
                <option value="title">Sort: Title</option>
                <option value="price">Sort: Price</option>
                <option value="deliveryTime">Sort: Delivery Time</option>
              </select>
            </div>
          </div>

          {/* 3. LOADING SKELETON STATE */}
          {loading && serviceItems.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs animate-pulse p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-surface-muted rounded-full w-24" />
                    <div className="h-5 bg-surface-muted rounded-full w-16" />
                  </div>
                  <div className="h-6 bg-surface-muted rounded-md w-3/4" />
                  <div className="h-4 bg-surface-muted rounded-md w-full" />
                  <div className="h-8 bg-surface-muted rounded-xl w-1/2" />
                  <div className="h-10 bg-surface-muted rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : serviceItems.length > 0 ? (
            /* SERVICES GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceItems.map((service) => {
                const serviceId = service._id || service.id;
                const isToggling = togglingStatusId === serviceId;

                return (
                  <div
                    key={serviceId}
                    className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs hover:border-secondary/40 transition-all duration-200 flex flex-col justify-between p-5 group"
                  >
                    <div className="space-y-3.5">
                      {/* Top Badges: Platform & Active/Inactive */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wide">
                          {getPlatformLabel(service.platform)}
                        </span>

                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleActive(service)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
                            service.isActive
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                          }`}
                          title="Click to toggle active status"
                        >
                          {service.isActive ? (
                            <>
                              <EyeIcon className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <LockClosedIcon className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </button>
                      </div>

                      {/* Title & Category */}
                      <div>
                        <h3 className="font-serif font-medium text-lg text-foreground line-clamp-1 group-hover:text-secondary transition-colors">
                          {service.title}
                        </h3>
                        <span className="text-[11px] font-medium text-text-secondary block mt-0.5">
                          {service.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {service.description || "No description provided."}
                      </p>

                      {/* Pricing Display Banner */}
                      <div className="p-3 rounded-xl bg-surface-muted/60 border border-border-theme flex items-baseline justify-between">
                        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                          Pricing
                        </span>
                        <span className="font-serif font-semibold text-base text-foreground">
                          {formatPrice(service)}
                        </span>
                      </div>

                      {/* Specs: Delivery Time & Revisions */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary pt-1">
                        <div className="flex items-center gap-1.5 bg-surface-muted/30 p-2 rounded-lg border border-border-theme/50">
                          <ClockIcon className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">{service.deliveryTime || 7} Days Delivery</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-surface-muted/30 p-2 rounded-lg border border-border-theme/50">
                          <RefreshIcon className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">
                            {service.revisions === 0 ? "No Revisions" : `${service.revisions} Revision${service.revisions > 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </div>

                      {/* Deliverables List */}
                      {Array.isArray(service.deliverables) && service.deliverables.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary block">
                            Deliverables ({service.deliverables.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {service.deliverables.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-surface-muted text-foreground border border-border-theme/80 truncate max-w-[180px]"
                              >
                                <CheckIcon className="text-emerald-500 shrink-0" />
                                <span className="truncate">{item}</span>
                              </span>
                            ))}
                            {service.deliverables.length > 3 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] bg-surface-muted text-text-secondary border border-border-theme/80">
                                +{service.deliverables.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-border-theme flex items-center justify-between">
                      <span className="text-[10px] text-text-secondary">
                        ID: {serviceId ? serviceId.slice(-6) : ""}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Edit Service"
                          onClick={() => handleOpenEditModal(service)}
                          className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted border border-border-theme transition-colors cursor-pointer"
                        >
                          <PencilIcon />
                        </button>

                        <button
                          type="button"
                          title="Delete Service"
                          onClick={() => {
                            setDeleteConfirmService(service);
                            setDeleteError(null);
                          }}
                          className="p-2 rounded-xl text-text-secondary hover:text-red-500 hover:bg-red-500/10 border border-border-theme transition-colors cursor-pointer"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="bg-surface border border-border-theme rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <BriefcaseIcon />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-medium text-xl text-foreground">
                  No services found
                </h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                  Start offering your creative packages by creating your first service offering.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                >
                  <PlusIcon />
                  <span>Add Service</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. PAGINATION BAR */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs flex items-center justify-between text-xs text-text-secondary">
              <div>
                Showing Page <span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
                <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.totalItems} Total Services)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon /> Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-theme bg-surface-muted hover:bg-surface text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 5. CREATE / EDIT SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={handleCloseModal} />
          <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-border-theme flex items-center justify-between">
              <div>
                <h2 className="font-serif font-medium text-xl text-foreground">
                  {editingServiceId ? "Edit Service" : "Add Service"}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {editingServiceId
                    ? "Update your service package details and pricing."
                    : "Create a new service package for brands."}
                </p>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1 custom-scrollbar">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl font-medium">
                    <span>{formError}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    maxLength={150}
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Dedicated Instagram Reel & Story Package"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Category & Platform */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      maxLength={100}
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g. Social Media Campaign"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      {PLATFORM_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing Type, Price, Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Pricing Type
                    </label>
                    <select
                      name="pricingType"
                      value={formData.pricingType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                    >
                      {PRICING_TYPE_OPTIONS.map((pt) => (
                        <option key={pt.value} value={pt.value}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Price ({formData.currency})
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      disabled={formData.pricingType === "custom"}
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Currency
                    </label>
                    <input
                      type="text"
                      name="currency"
                      maxLength={3}
                      value={formData.currency}
                      onChange={handleInputChange}
                      placeholder="INR"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground uppercase focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                {/* Delivery Time & Revisions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Delivery Time (Days)
                    </label>
                    <input
                      type="number"
                      name="deliveryTime"
                      min="1"
                      value={formData.deliveryTime}
                      onChange={handleInputChange}
                      placeholder="7"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Revisions Included
                    </label>
                    <input
                      type="number"
                      name="revisions"
                      min="0"
                      value={formData.revisions}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    maxLength={2000}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what is included in this service package..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors resize-none"
                  />
                </div>

                {/* Dynamic Deliverables List */}
                <div className="space-y-2.5 pt-2 border-t border-border-theme">
                  <label className="block font-semibold text-foreground">
                    Deliverables (Optional)
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={deliverableInput}
                      onChange={(e) => setDeliverableInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDeliverable();
                        }
                      }}
                      placeholder="e.g. 1x High Quality Reel (60s)"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="px-3.5 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>

                  {formData.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.deliverables.map((item, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-muted text-foreground border border-border-theme text-xs"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(index)}
                            className="text-text-secondary hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Toggle Switch */}
                <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 flex items-center justify-between pt-3">
                  <div>
                    <span className="font-semibold text-foreground block">Active Status</span>
                    <span className="text-[11px] text-text-secondary block mt-0.5">
                      {formData.isActive
                        ? "Active services are visible and selectable by brands."
                        : "Inactive services are hidden from brands."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      formData.isActive ? "bg-secondary" : "bg-surface-muted border-border-theme"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formData.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-border-theme bg-surface-muted/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? "Saving..." : editingServiceId ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteConfirmService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setDeleteConfirmService(null)} />
          <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-base text-foreground">
                  Delete Service?
                </h3>
                <p className="text-text-secondary text-xs">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-text-secondary leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteConfirmService.title}"</span>?
            </p>

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-2 rounded-lg font-medium">
                {deleteError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmService(null)}
                className="px-4 py-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
