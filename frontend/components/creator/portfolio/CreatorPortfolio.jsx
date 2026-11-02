"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPortfolios,
  deletePortfolioItem,
} from "@/redux/creator/portfolio/portfolio_slice";
import PortfolioFormModal, { PortfolioCardCover } from "./PortfolioFormModal";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";

// =========================================================
// SVG ICONS (Inline Component Library)
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

function PhotoIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function FolderIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75A1.5 1.5 0 015.25 8.25h3.439a1.5 1.5 0 011.06.44l1.5 1.5H18.75a1.5 1.5 0 011.5 1.5v6.75a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V9.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75V6a1.5 1.5 0 011.5-1.5h4.939a1.5 1.5 0 011.06.44l1.5 1.5H18.75a1.5 1.5 0 011.5 1.5v.75" />
    </svg>
  );
}

function LayersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 6.75l5.571 3m0 0L21.75 12l-4.179 2.25m0 0l-5.571 3-5.571-3" />
    </svg>
  );
}

function ArrowPathIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ArrowUpTrayIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function LinkIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

export default function CreatorPortfolio() {
  const dispatch = useDispatch();
  const { portfolios, loading, error } = useSelector((state) => state.portfolio);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);

  // Delete State
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch portfolios on component mount
  useEffect(() => {
    dispatch(getPortfolios());
  }, [dispatch]);

  // Ensure portfolios is an array
  const portfolioItems = Array.isArray(portfolios) ? portfolios : [];

  // Filtering Logic
  const filteredItems = portfolioItems.filter((item) => {
    const titleMatch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesVisibility =
      visibilityFilter === "All" ||
      (visibilityFilter === "Public" && item.isPublic) ||
      (visibilityFilter === "Private" && !item.isPublic);

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  // Extract unique categories from real data, keeping default common options
  const defaultCategories = ["Fashion & Luxury", "Beauty & Skincare", "Apparel & Lifestyle", "Photography"];
  const dynamicCategories = Array.from(
    new Set([...defaultCategories, ...portfolioItems.map((item) => item.category).filter(Boolean)])
  );
  const categories = ["All", ...dynamicCategories];

  // Open Modal Helpers
  const handleOpenAddModal = () => {
    setEditingPortfolio(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingPortfolio(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPortfolio(null);
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProject) return;
    const portfolioId = deleteConfirmProject._id || deleteConfirmProject.id;
    if (!portfolioId) return;

    setDeleting(true);
    setDeleteError(null);

    const resultAction = await dispatch(deletePortfolioItem(portfolioId));
    setDeleting(false);

    if (deletePortfolioItem.fulfilled.match(resultAction)) {
      setDeleteConfirmProject(null);
    } else {
      setDeleteError(resultAction.payload || "Failed to delete portfolio project.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar Component */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Bar Component */}
        <CreatorHeader setMobileOpen={setMobileOpen} />

        {/* Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* 1. PAGE HEADER */}
          <div className="bg-surface border border-border-theme rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="mb-2">
                <span className="font-bold text-[11px] tracking-wider uppercase text-[#ff2d6c] dark:text-[#ff4f87] font-sans">
                  Creator Portfolio
                </span>
              </div>
              <h1 className="font-serif font-medium text-2xl sm:text-3xl text-foreground tracking-tight">
                My Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Showcase your best work, brand editorials, and creative projects.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer shrink-0 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
              >
                <PlusIcon />
                <span>Add Portfolio</span>
              </button>
            </div>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs font-medium flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>{typeof error === "string" ? error : "Failed to load portfolio items."}</span>
              <button
                type="button"
                onClick={() => dispatch(getPortfolios())}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Retrying..." : "Retry"}</span>
              </button>
            </div>
          )}

          {/* 2. SEARCH & FILTER BAR */}
          <div className="bg-surface border border-border-theme rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-text-secondary hover:text-foreground cursor-pointer font-sans"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              {/* Visibility Filter */}
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors cursor-pointer"
              >
                <option value="All">Status: All</option>
                <option value="Public">Public Only</option>
                <option value="Private">Private Only</option>
              </select>
            </div>
          </div>

          {/* 3. LOADING SKELETON STATE */}
          {loading && portfolioItems.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col"
                >
                  {/* Cover Image Skeleton */}
                  <div className="h-48 sm:h-52 bg-surface-muted w-full" />

                  {/* Card Details Skeleton */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="h-5 bg-surface-muted rounded-md w-3/4" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-surface-muted rounded w-full" />
                        <div className="h-3.5 bg-surface-muted rounded w-4/5" />
                      </div>
                    </div>

                    {/* Meta info & Action Buttons Skeleton */}
                    <div className="pt-3 border-t border-border-theme flex items-center justify-between">
                      <div className="h-4 bg-surface-muted rounded w-24" />
                      <div className="flex items-center gap-1.5">
                        <div className="h-8 w-8 bg-surface-muted rounded-lg" />
                        <div className="h-8 w-8 bg-surface-muted rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            /* PORTFOLIO GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((project) => (
                <div
                  key={project._id || project.id}
                  className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 flex flex-col group"
                >
                  {/* Cover Image Container with Per-Image Skeleton */}
                  <PortfolioCardCover
                    coverImage={project.coverImage}
                    title={project.title}
                    category={project.category}
                    isPublic={project.isPublic}
                  />

                  {/* Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif font-medium text-lg text-foreground line-clamp-1 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    {/* Meta info & Action Buttons */}
                    <div className="pt-3 border-t border-border-theme flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
                        <LayersIcon />
                        <span>
                          {Array.isArray(project.contents)
                            ? `${project.contents.length} Items`
                            : "Media Project"}
                        </span>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Edit Project"
                          onClick={() => handleOpenEditModal(project)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-muted border border-border-theme transition-colors cursor-pointer"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          title="Delete Project"
                          onClick={() => {
                            setDeleteConfirmProject(project);
                            setDeleteError(null);
                          }}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-surface-muted border border-border-theme transition-colors cursor-pointer"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !error ? (
            /* EMPTY STATE UI */
            <div className="bg-surface border border-border-theme rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-surface-muted text-black dark:text-white flex items-center justify-center mx-auto border border-neutral-200 dark:border-border-theme">
                <FolderIcon />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-medium text-xl text-foreground">
                  No portfolio items yet
                </h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                  Start showcasing your best work by adding your first portfolio project.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer dark:bg-white dark:text-black dark:hover:bg-neutral-100"
                >
                  <PlusIcon />
                  <span>Add Portfolio</span>
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* 4. PORTFOLIO FORM MODAL (REUSABLE COMPONENT) */}
      <PortfolioFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        portfolio={editingPortfolio}
        defaultCategory={selectedCategory !== "All" ? selectedCategory : "Fashion & Luxury"}
        onSuccess={() => {
          dispatch(getPortfolios());
        }}
      />

      {/* 5. DELETE CONFIRMATION MODAL */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => {
              if (!deleting) {
                setDeleteConfirmProject(null);
                setDeleteError(null);
              }
            }}
          />
          <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-md w-full shadow-2xl p-5 sm:p-6 space-y-4 overflow-hidden">
            <div className="space-y-2">
              <h3 className="font-serif font-medium text-lg text-foreground">
                Delete Portfolio Project
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{deleteConfirmProject.title}&quot;</span>? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs font-medium">
                <span>{deleteError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteConfirmProject(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl bg-surface-muted hover:bg-surface border border-border-theme text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
