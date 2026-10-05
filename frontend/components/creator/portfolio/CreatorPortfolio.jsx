"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPortfolios,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "@/redux/creator/portfolio/portfolio_slice";
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

const initialFormState = {
  title: "",
  description: "",
  category: "Fashion & Luxury",
  coverImage: "",
  isPublic: true,
  contents: [],
};

export default function CreatorPortfolio() {
  const dispatch = useDispatch();
  const { portfolios, loading, error } = useSelector((state) => state.portfolio);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    setEditingPortfolioId(null);
    setFormData(initialFormState);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingPortfolioId(project._id || project.id);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      category: project.category || "Fashion & Luxury",
      coverImage: project.coverImage || "",
      isPublic: typeof project.isPublic === "boolean" ? project.isPublic : true,
      contents: Array.isArray(project.contents)
        ? project.contents.map((c) => ({
            platform: c.platform || "instagram",
            contentType: c.contentType || "post",
            url: c.url || "",
            previewImage: c.previewImage || "",
            title: c.title || "",
          }))
        : [],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
      setEditingPortfolioId(null);
      setFormError(null);
    }
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Content Entries Helper Functions
  const addContentEntry = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [
        ...prev.contents,
        {
          platform: "instagram",
          contentType: "post",
          url: "",
          previewImage: "",
          title: "",
        },
      ],
    }));
  };

  const updateContentEntry = (index, field, value) => {
    setFormData((prev) => {
      const updatedContents = [...prev.contents];
      updatedContents[index] = {
        ...updatedContents[index],
        [field]: value,
      };
      return { ...prev, contents: updatedContents };
    });
  };

  const removeContentEntry = (index) => {
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler for Creating / Updating Portfolio
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!formData.title.trim()) {
      setFormError("Portfolio title is required.");
      return;
    }
    if (formData.title.trim().length > 150) {
      setFormError("Title must be 150 characters or less.");
      return;
    }
    if (formData.description && formData.description.length > 2000) {
      setFormError("Description must be 2000 characters or less.");
      return;
    }
    if (formData.category && formData.category.length > 100) {
      setFormError("Category must be 100 characters or less.");
      return;
    }

    // Validate contents entries if added
    for (let i = 0; i < formData.contents.length; i++) {
      const item = formData.contents[i];
      if (!item.url || !item.url.trim()) {
        setFormError(`Content entry #${i + 1} requires a valid URL.`);
        return;
      }
      if (item.title && item.title.trim().length > 150) {
        setFormError(`Content entry #${i + 1} title must be 150 characters or less.`);
        return;
      }
    }

    // Construct Backend Payload matching exact validation schema
    const payload = {
      title: formData.title.trim(),
      description: formData.description ? formData.description.trim() : "",
      category: formData.category ? formData.category.trim() : "",
      coverImage: formData.coverImage ? formData.coverImage.trim() : "",
      isPublic: Boolean(formData.isPublic),
      contents: formData.contents.map((c) => ({
        platform: c.platform,
        contentType: c.contentType,
        url: c.url.trim(),
        ...(c.previewImage?.trim() ? { previewImage: c.previewImage.trim() } : {}),
        ...(c.title?.trim() ? { title: c.title.trim() } : {}),
      })),
    };

    setSubmitting(true);
    let resultAction;

    if (editingPortfolioId) {
      resultAction = await dispatch(
        updatePortfolioItem({
          portfolioId: editingPortfolioId,
          portfolioData: payload,
        })
      );
    } else {
      resultAction = await dispatch(createPortfolioItem(payload));
    }
    setSubmitting(false);

    const isSuccess = editingPortfolioId
      ? updatePortfolioItem.fulfilled.match(resultAction)
      : createPortfolioItem.fulfilled.match(resultAction);

    if (isSuccess) {
      setFormData(initialFormState);
      setEditingPortfolioId(null);
      setIsModalOpen(false);
    } else {
      setFormError(
        resultAction.payload ||
          (editingPortfolioId
            ? "Failed to update portfolio project."
            : "Failed to create portfolio project.")
      );
    }
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
              <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-foreground tracking-tight">
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer shrink-0"
              >
                <PlusIcon />
                <span>Add Portfolio</span>
              </button>
            </div>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-xs font-medium">
              <span>{error}</span>
            </div>
          )}

          {/* 2. SEARCH & FILTER BAR */}
          <div className="bg-surface border border-border-theme rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title or keyword..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground placeholder:text-text-secondary focus:outline-none focus:border-secondary transition-colors"
              />
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
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs animate-pulse space-y-4 p-4"
                >
                  <div className="h-48 bg-surface-muted rounded-xl" />
                  <div className="h-5 bg-surface-muted rounded-md w-3/4" />
                  <div className="h-4 bg-surface-muted rounded-md w-full" />
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            /* PORTFOLIO GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((project) => (
                <div
                  key={project._id || project.id}
                  className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs hover:border-secondary/40 transition-all duration-200 flex flex-col group"
                >
                  {/* Cover Image Container */}
                  <div className="relative h-48 sm:h-52 bg-surface-muted overflow-hidden">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : null}
                    {!project.coverImage && (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary">
                        <PhotoIcon className="w-10 h-10 opacity-40" />
                      </div>
                    )}

                    {/* Category Tag Overlay */}
                    {project.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-surface/90 backdrop-blur-xs text-foreground border border-border-theme">
                          {project.category}
                        </span>
                      </div>
                    )}

                    {/* Public / Private Status Overlay */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-xs border ${
                          project.isPublic
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        }`}
                      >
                        {project.isPublic ? (
                          <>
                            <EyeIcon className="w-3 h-3" /> Public
                          </>
                        ) : (
                          <>
                            <LockClosedIcon className="w-3 h-3" /> Private
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif font-medium text-lg text-foreground line-clamp-1 group-hover:text-secondary transition-colors">
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
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 border border-border-theme transition-colors cursor-pointer"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE UI */
            <div className="bg-surface border border-border-theme rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                >
                  <PlusIcon />
                  <span>Add Portfolio</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. PORTFOLIO FORM MODAL (ADD & EDIT MODE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={handleCloseModal}
          />
          <div className="relative z-10 bg-surface border border-border-theme rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-border-theme flex items-center justify-between">
              <div>
                <h2 className="font-serif font-medium text-xl text-foreground">
                  {editingPortfolioId ? "Edit Portfolio Project" : "Add Portfolio Project"}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {editingPortfolioId
                    ? "Update your existing project details and contents."
                    : "Showcase a new project, brand collaboration, or media item."}
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

            {/* Modal Body Form */}
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
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    maxLength={150}
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. My First Brand Collaboration"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                {/* Category & Cover Image URL Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors"
                    >
                      <option value="Fashion & Luxury">Fashion & Luxury</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Apparel & Lifestyle">Apparel & Lifestyle</option>
                      <option value="Photography">Photography</option>
                      <option value="Video & Reels">Video & Reels</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
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
                    placeholder="Provide context or highlights about this project..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground focus:outline-none focus:border-secondary transition-colors resize-none"
                  />
                </div>

                {/* Public Visibility Toggle */}
                <div className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground block">Public Visibility</span>
                    <span className="text-[11px] text-text-secondary block mt-0.5">
                      {formData.isPublic
                        ? "This project will be discoverable on your public portfolio."
                        : "Only you can view this project."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      formData.isPublic ? "bg-secondary" : "bg-surface-muted border-border-theme"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formData.isPublic ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Contents Entries Section */}
                <div className="space-y-3 pt-2 border-t border-border-theme">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground block">
                        Portfolio Contents (Optional)
                      </span>
                      <span className="text-[11px] text-text-secondary block mt-0.5">
                        Link social media posts, reels, stories, or external articles.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addContentEntry}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Add Entry</span>
                    </button>
                  </div>

                  {formData.contents.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl border border-border-theme bg-surface-muted/40 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border-theme/60">
                        <span className="font-semibold text-foreground text-[11px]">
                          Content Entry #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeContentEntry(index)}
                          className="text-text-secondary hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove Entry"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                            Platform <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={entry.platform}
                            onChange={(e) => updateContentEntry(index, "platform", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="youtube">YouTube</option>
                            <option value="tiktok">TikTok</option>
                            <option value="website">Website</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                            Content Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={entry.contentType}
                            onChange={(e) => updateContentEntry(index, "contentType", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                          >
                            <option value="post">Post</option>
                            <option value="reel">Reel</option>
                            <option value="story">Story</option>
                            <option value="video">Video</option>
                            <option value="short">Short</option>
                            <option value="article">Article</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                          URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={entry.url}
                          onChange={(e) => updateContentEntry(index, "url", e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                            Title (Optional)
                          </label>
                          <input
                            type="text"
                            maxLength={150}
                            value={entry.title}
                            onChange={(e) => updateContentEntry(index, "title", e.target.value)}
                            placeholder="e.g. Campaign Reel Part 1"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase text-text-secondary mb-1">
                            Preview Image URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={entry.previewImage}
                            onChange={(e) => updateContentEntry(index, "previewImage", e.target.value)}
                            placeholder="https://..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-theme text-foreground focus:outline-none focus:border-secondary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-border-theme bg-surface-muted/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl bg-surface-muted hover:bg-surface border border-border-theme text-foreground font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-semibold text-xs tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? editingPortfolioId
                      ? "Updating..."
                      : "Creating..."
                    : editingPortfolioId
                    ? "Update Portfolio"
                    : "Create Portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteConfirmProject.title}"</span>? This action cannot be undone.
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
