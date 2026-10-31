"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getServices,
  updateCreatorService,
  deleteCreatorService,
} from "@/redux/creator/services/services_slice";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import ServiceFormModal, {
  PLATFORM_OPTIONS,
  getDeliverablesList,
  formatPrice,
  getPlatformLabel,
  getContentTypeLabel,
  ServiceCardCover,
} from "./ServiceFormModal";

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

function LayersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.321 4.5L2.25 16.5l9.75 5.25 9.75-5.25-4.179-2.25M12 3.75L2.25 9l9.75 5.25 9.75-5.25L12 3.75z" />
    </svg>
  );
}

function RupeeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 8h12M6 13h7a4 4 0 000-8H6m0 8l7 8" />
    </svg>
  );
}



function BarChartIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
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
  const finalClass = className.includes("w-") && className.includes("h-")
    ? className
    : `w-3.5 h-3.5 ${className}`.trim();
  return (
    <svg className={finalClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

function EllipsisVerticalIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}

function CoinsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <ellipse cx="12" cy="7" rx="6" ry="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7v5c0 1.66 2.69 3 6 3s6-1.34 6-3V7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
    </svg>
  );
}

function PlaySquareIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="3.5" />
      <polygon points="10 8.5 16 12 10 15.5 10 8.5" fill="currentColor" />
    </svg>
  );
}

function PlatformBadgeIcon({ platform, className = "w-3.5 h-3.5" }) {
  const norm = typeof platform === "string" ? platform.toLowerCase() : "";
  if (norm.includes("youtube")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000" />
        <polygon points="10,8.5 16,12 10,15.5" fill="#FFFFFF" />
      </svg>
    );
  }
  if (norm.includes("instagram")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#ig-grad)" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.2" stroke="url(#ig-grad)" strokeWidth="2" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="url(#ig-grad)" />
        <defs>
          <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F58529" />
            <stop offset="0.5" stopColor="#DD2A7B" />
            <stop offset="1" stopColor="#8134AF" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (norm.includes("tiktok")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.84a8.27 8.27 0 0 0 4.89 1.57V6.96a4.83 4.83 0 0 1-1-.27z" />
      </svg>
    );
  }
  if (norm.includes("facebook")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (norm.includes("website")) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
      </svg>
    );
  }
  return <LayersIcon className={className} />;
}

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
  const [sortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Delete State
  const [deleteConfirmService, setDeleteConfirmService] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Active Toggle Loading State per ID
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  // Card 3-dot dropdown action menu state
  const [openMenuId, setOpenMenuId] = useState(null);

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

  // Service Overview Statistics Calculations
  const totalServicesCount =
    pagination && typeof pagination.totalItems === "number"
      ? pagination.totalItems
      : serviceItems.length;

  const activeServicesCount = serviceItems.filter((s) => Boolean(s.isActive)).length;

  const pricedServices = serviceItems.filter(
    (s) =>
      typeof s.price === "number" &&
      !isNaN(s.price) &&
      s.price > 0 &&
      s.pricingType !== "custom"
  );

  let startingPriceFormatted = "—";
  if (pricedServices.length > 0) {
    const minPrice = Math.min(...pricedServices.map((s) => s.price));
    const matchedService = pricedServices.find((s) => s.price === minPrice);
    const currencyCode = matchedService?.currency || "INR";
    const symbol = currencyCode === "INR" ? "₹" : `${currencyCode} `;
    startingPriceFormatted = `${symbol}${new Intl.NumberFormat("en-IN").format(minPrice)}`;
  } else if (serviceItems.length > 0 && serviceItems.some((s) => s.price === 0)) {
    startingPriceFormatted = "₹0";
  }

  const deliveryServices = serviceItems.filter(
    (s) => typeof s.deliveryTime === "number" && !isNaN(s.deliveryTime) && s.deliveryTime > 0
  );

  let avgDeliveryFormatted = "—";
  if (deliveryServices.length > 0) {
    const totalDays = deliveryServices.reduce((acc, s) => acc + s.deliveryTime, 0);
    const avgDays = Math.round(totalDays / deliveryServices.length);
    avgDeliveryFormatted = `${avgDays} Day${avgDays !== 1 ? "s" : ""}`;
  }



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
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
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
          <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
            <div className="space-y-3 sm:space-y-3.5 max-w-xl">
              <div>
                <div className="mb-2">
                  <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                    Creator Services
                  </span>
                </div>
                <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                  My Services
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Manage your service packages, pricing, and deliverables.
                </p>
              </div>

              {/* Two Compact Statistic Cards Shifted Below Text */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-sm pt-0.5">
                {/* 1. Total Services */}
                <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs rounded-xl py-2 px-3 sm:py-2.5 sm:px-3.5 border border-pink-100/90 dark:border-border-theme/70 shadow-2xs flex items-center gap-2.5 min-w-0 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                    <LayersIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-[11px] font-medium text-text-secondary block leading-tight truncate">
                      Total Services
                    </span>
                    <span className="font-sans font-bold text-base sm:text-lg text-foreground tracking-tight leading-none block mt-0.5 truncate">
                      {totalServicesCount}
                    </span>
                  </div>
                </div>

                {/* 2. Active Services */}
                <div className="bg-white/95 dark:bg-surface/90 backdrop-blur-xs rounded-xl py-2 px-3 sm:py-2.5 sm:px-3.5 border border-pink-100/90 dark:border-border-theme/70 shadow-2xs flex items-center gap-2.5 min-w-0 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-black dark:text-white flex items-center justify-center shrink-0">
                    <CheckIcon className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-[11px] font-medium text-text-secondary block leading-tight truncate">
                      Active Services
                    </span>
                    <span className="font-sans font-bold text-base sm:text-lg text-foreground tracking-tight leading-none block mt-0.5 truncate">
                      {activeServicesCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Right Actions & Illustration */}
            <div className="flex items-center gap-4 lg:gap-6 shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer shrink-0 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Service</span>
              </button>

              {/* Decorative Service Card Illustration */}
              <div className="hidden lg:flex items-center gap-3 shrink-0 pl-2 self-center">
                <div className="flex flex-col items-center select-none pointer-events-none">
                  <span className="text-[10px] 2xl:text-[11px] font-medium italic text-pink-500 dark:text-pink-400 text-center leading-tight max-w-[85px]">
                    Turn your skills into opportunities
                  </span>
                  <svg className="w-6 h-6 2xl:w-7 2xl:h-7 text-pink-400 -rotate-12 mt-1" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 8 C 12 24, 22 28, 30 24" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M24 22 L 30 24 L 28 30" />
                  </svg>
                </div>

                <div className="relative w-44 sm:w-48 bg-white dark:bg-surface rounded-2xl p-3 sm:p-3.5 shadow-md shadow-pink-500/10 border border-pink-200/80 dark:border-pink-900/50 rotate-[2.5deg] select-none pointer-events-none shrink-0 transition-transform hover:rotate-0 duration-300">
                  {/* Floating Instagram Badge */}
                  <div className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-black-500 via-black-500 to-black-600 text-black flex items-center justify-center shadow-md bg-grey">
                    <PlatformBadgeIcon platform="instagram" className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-black" />
                  </div>

                  {/* Thumbnail */}
                  <div className="h-14 sm:h-16 rounded-xl bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/80 dark:from-pink-950/40 dark:to-surface-muted flex items-center justify-center">
                    <div className="w-8 h-6 sm:w-9 sm:h-7 rounded-lg bg-pink-500/15 dark:bg-pink-500/25 flex items-center justify-center text-black dark:text-white">
                      <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Mini Service Details */}
                  <p className="text-[11px] sm:text-xs font-bold text-foreground leading-tight mt-2 line-clamp-1">
                    Social Media Content Creation
                  </p>

                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-pink-100/60 dark:border-border-theme/40">
                    <span className="text-xs sm:text-sm font-bold text-foreground font-sans">
                      ₹12,000
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-transparent px-2 py-0.5 rounded-full border border-emerald-500/30 dark:border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Floating Chart Badge */}
                  <div className="absolute -bottom-2.5 -right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-surface border border-pink-200/80 dark:border-border-theme text-black dark:text-white flex items-center justify-center shadow-md">
                    <BarChartIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                </div>
              </div>
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
                const validDeliverables = getDeliverablesList(service.deliverables);

                const normPlatform = (service.platform || "").toLowerCase();

                return (
                  <div
                    key={serviceId}
                    className="bg-white dark:bg-surface border border-pink-100/90 dark:border-pink-900/40 hover:border-pink-200/90 dark:hover:border-pink-500/30 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(255,45,108,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Cover Image with Overlaid Badges */}
                      <ServiceCardCover coverImage={service.coverImage} title={service.title}>
                        {/* Top-Left Platform Badge */}
                        <div className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xs shadow-xs border border-white/20">
                          <PlatformBadgeIcon platform={service.platform} className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[11px] font-bold tracking-wider uppercase text-foreground">
                            {getPlatformLabel(service.platform).toUpperCase()}
                          </span>
                        </div>

                        {/* Top-Right Active Status & 3-Dot Menu */}
                        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleActive(service)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xs shadow-xs border border-white/20 text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                              isToggling ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                            title="Click to toggle active status"
                          >
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                service.isActive ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            <span
                              className={
                                service.isActive
                                  ? "text-emerald-600 dark:text-emerald-400 font-semibold text-xs"
                                  : "text-amber-600 dark:text-amber-400 font-semibold text-xs"
                              }
                            >
                              {service.isActive ? "Active" : "Inactive"}
                            </span>
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              aria-label="Service actions"
                              aria-haspopup="true"
                              aria-expanded={openMenuId === serviceId}
                              onClick={() =>
                                setOpenMenuId((prev) => (prev === serviceId ? null : serviceId))
                              }
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xs shadow-xs border border-white/20 text-text-secondary hover:text-foreground flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                            >
                              <EllipsisVerticalIcon className="w-3.5 h-3.5" />
                            </button>

                            {openMenuId === serviceId && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-9 w-44 bg-surface border border-border-theme rounded-2xl shadow-xl p-1.5 z-30 font-sans text-xs space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleOpenEditModal(service);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors text-left cursor-pointer"
                                  >
                                    <PencilIcon className="w-3.5 h-3.5" />
                                    <span>Edit Service</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleToggleActive(service);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-muted transition-colors text-left cursor-pointer"
                                  >
                                    {service.isActive ? (
                                      <>
                                        <LockClosedIcon className="w-3.5 h-3.5" />
                                        <span>Mark as Inactive</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeIcon className="w-3.5 h-3.5" />
                                        <span>Mark as Active</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setDeleteConfirmService(service);
                                      setDeleteError(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                    <span>Delete Service</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </ServiceCardCover>

                      {/* Card Content */}
                      <div className="p-5 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
                        {/* Title, Category & Description */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-base sm:text-lg text-foreground line-clamp-1 tracking-tight">
                            {service.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-normal text-text-secondary line-clamp-1">
                              {service.category || "Social Media Campaign"}
                            </span>
                            {service.contentType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-semibold">
                                {service.quantity && service.quantity > 1 ? `${service.quantity}x ` : ""}
                                {getContentTypeLabel(service.platform, service.contentType)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 pt-1 min-h-[2.25rem]">
                            {service.description || "No description provided."}
                          </p>
                        </div>

                        {/* Highlighted Pricing Row */}
                        <div className="bg-pink-50/70 dark:bg-pink-950/20 border border-pink-100/60 dark:border-pink-900/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
                          <span className="text-xs font-medium text-text-secondary">
                            {service.pricingType === "custom" ? "Custom Quote" : "Starting at"}
                          </span>
                          <span className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                            {formatPrice(service)}
                          </span>
                        </div>

                        {/* Delivery Time & Included Revisions Row */}
                        <div className="grid grid-cols-2 gap-3 py-1 items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full border border-border-theme bg-surface-muted/30 text-foreground flex items-center justify-center shrink-0">
                              <ClockIcon className="w-3.5 h-3.5 text-foreground" />
                            </div>
                            <div className="min-w-0">
                              <span className="block font-bold text-xs text-foreground truncate leading-none">
                                {service.deliveryTime || 7} Days
                              </span>
                              <span className="block text-[10px] text-text-secondary leading-none mt-1 truncate">
                                Delivery Time
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full border border-border-theme bg-surface-muted/30 text-foreground flex items-center justify-center shrink-0">
                              <RefreshIcon className="w-3.5 h-3.5 text-foreground" />
                            </div>
                            <div className="min-w-0">
                              <span className="block font-bold text-xs text-foreground truncate leading-none">
                                {service.revisions === 0
                                  ? "No Revisions"
                                  : `${service.revisions || 1} Revision${(service.revisions || 1) > 1 ? "s" : ""}`}
                              </span>
                              <span className="block text-[10px] text-text-secondary leading-none mt-1 truncate">
                                Included
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Deliverables Section & Action Buttons */}
                        <div className="flex items-center justify-between gap-2.5 pt-1">
                          <div className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-surface-muted/50 dark:bg-surface-muted/20 border border-border-theme/60">
                            <div className="w-7 h-7 rounded-xl bg-surface border border-border-theme/70 flex items-center justify-center text-foreground shrink-0">
                              {normPlatform.includes("youtube") || normPlatform.includes("instagram") || normPlatform.includes("tiktok") ? (
                                <PlaySquareIcon className="w-3.5 h-3.5 text-foreground" />
                              ) : (
                                <LayersIcon className="w-3.5 h-3.5 text-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block font-bold text-[11px] text-foreground leading-none truncate">
                                Deliverables ({validDeliverables.length})
                              </span>
                              <span className="block text-[10px] text-text-secondary leading-none mt-1 truncate">
                                {validDeliverables.length > 0 ? validDeliverables.join(", ") : "No deliverables listed"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            title="Edit Service"
                            onClick={() => handleOpenEditModal(service)}
                            className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-muted border border-border-theme text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 shrink-0"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            title="Delete Service"
                            onClick={() => {
                              setDeleteConfirmService(service);
                              setDeleteError(null);
                            }}
                            className="w-10 h-10 rounded-2xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/50 border border-pink-200/80 dark:border-pink-900/60 text-[#FF4F87] dark:text-pink-400 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 shrink-0"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
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
                <h3 className="font-sans font-semibold text-xl text-foreground tracking-tight">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-semibold tracking-wide border border-neutral-900 shadow-xs hover:bg-neutral-900 hover:border-neutral-800 hover:shadow-xs hover:shadow-pink-500/10 active:scale-[0.99] transition-all duration-200 ease-out cursor-pointer dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200"
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

      {/* 5. CREATE / EDIT SERVICE MODAL (REUSABLE COMPONENT) */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={editingService}
        onSuccess={() => {
          dispatch(
            getServices({
              page: currentPage,
              limit: 9,
              sortBy,
              sortOrder,
              ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
              ...(selectedCategory !== "All" ? { category: selectedCategory } : {}),
              ...(selectedPlatform !== "All" ? { platform: selectedPlatform } : {}),
              ...(selectedStatus !== "All" ? { isActive: selectedStatus } : {}),
            })
          );
        }}
      />

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
                <h3 className="font-sans font-semibold text-base text-foreground tracking-tight">
                  Delete Service?
                </h3>
                <p className="text-text-secondary text-xs">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-text-secondary leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{deleteConfirmService.title}&quot;</span>?
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
