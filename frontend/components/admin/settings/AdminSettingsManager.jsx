"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";
import { updateAdminUser } from "@/redux/admin/auth/admin_auth_slice";

// =========================================================
// SVG ICONS
// =========================================================
function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LockClosedIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ServerStackIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 3h13.5m-9.75 3h6m3-15H6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0018 3H6a2.25 2.25 0 00-2.25 2.25v.75" />
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

function EyeSlashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
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

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CameraIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

export default function AdminSettingsManager() {
  const dispatch = useDispatch();
  const { adminUser } = useSelector((state) => state.adminAuth || {});

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password" | "system"
  const fileInputRef = useRef(null);

  // Profile Form State
  const [name, setName] = useState(adminUser?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // System Info State
  const [systemInfo, setSystemInfo] = useState(null);

  // Load system info when tab is active
  useEffect(() => {
    let isMounted = true;
    if (activeTab === "system" && !systemInfo) {
      const fetchSystemInfo = async () => {
        try {
          const res = await axiosInstance.get("/admin/settings/system");
          if (isMounted) {
            setSystemInfo(res.data?.data || null);
          }
        } catch {
          // Fallback gracefully
        }
      };
      fetchSystemInfo();
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, systemInfo]);

  // Handle Name update (Email locked)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!name.trim()) {
      setProfileError("Admin name cannot be empty");
      return;
    }

    try {
      setProfileLoading(true);
      const res = await axiosInstance.patch("/admin/settings/profile", {
        name: name.trim()
      });
      const updatedUser = res.data?.data;
      if (updatedUser) {
        dispatch(updateAdminUser(updatedUser));
      }
      setProfileSuccess("Admin profile updated successfully.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update admin profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Avatar Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Only image files (JPEG, PNG, WEBP) are supported");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setAvatarLoading(true);
      setProfileError("");
      setProfileSuccess("");

      const res = await axiosInstance.post("/admin/settings/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const updatedUser = res.data?.data;
      if (updatedUser) {
        dispatch(updateAdminUser(updatedUser));
      }
      setProfileSuccess("Profile picture uploaded successfully.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to upload avatar image");
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Avatar Delete
  const handleDeleteAvatar = async () => {
    try {
      setAvatarLoading(true);
      setProfileError("");
      setProfileSuccess("");

      const res = await axiosInstance.delete("/admin/settings/avatar");
      const updatedUser = res.data?.data;
      if (updatedUser) {
        dispatch(updateAdminUser(updatedUser));
      }
      setProfileSuccess("Profile picture removed successfully.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to remove avatar image");
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axiosInstance.post("/admin/settings/password", {
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordSuccess(res.data?.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 5000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const adminInitials = adminUser?.name ? adminUser.name.slice(0, 2).toUpperCase() : "AD";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-secondary/15 via-surface to-surface border border-secondary/20 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Platform Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Admin Profile & Settings
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Manage your administrator credentials, upload custom profile avatars, and review platform telemetry.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="inline-flex rounded-xl bg-surface-muted p-1 border border-border-theme self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-text-secondary hover:text-foreground"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "password"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-text-secondary hover:text-foreground"
              }`}
            >
              <LockClosedIcon className="w-4 h-4" />
              <span>Security</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "system"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-text-secondary hover:text-foreground"
              }`}
            >
              <ServerStackIcon className="w-4 h-4" />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <div className="p-6 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-6 flex flex-col items-center text-center">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Profile Avatar</h3>
              <p className="text-xs text-text-secondary">Official avatar shown in the control center</p>
            </div>

            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-secondary/20 border-2 border-secondary/40 text-secondary flex items-center justify-center font-bold text-3xl uppercase overflow-hidden shadow-md">
                {adminUser?.avatar ? (
                  <img
                    src={adminUser.avatar}
                    alt={adminUser?.name || "Admin"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{adminInitials}</span>
                )}
              </div>
              {avatarLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  Saving...
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex flex-col w-full gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-foreground text-background hover:opacity-90 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CameraIcon className="w-4 h-4" />
                <span>Upload New Photo</span>
              </button>

              {adminUser?.avatar && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={avatarLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-muted hover:bg-red-500/10 text-red-500 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-border-theme disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-text-secondary">
              JPG, PNG or WEBP. Maximum file size 5MB.
            </p>
          </div>

          {/* Profile Details Form Card */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Account Information</h3>
              <p className="text-xs text-text-secondary">Update your admin display name and inspect locked attributes.</p>
            </div>

            {profileSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-medium">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Name Field (Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Admin Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sakshi"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground text-sm focus:outline-none focus:border-secondary transition-colors"
                />
                <p className="text-[11px] text-text-secondary">
                  This name is displayed in the header and on audit trail entries.
                </p>
              </div>

              {/* Email Field (Strictly Locked / Read-Only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Admin Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-muted text-text-secondary border border-border-theme">
                    <LockClosedIcon className="w-3 h-3 text-text-secondary" />
                    <span>Locked</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={adminUser?.email || "admin@creatorlink.com"}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted/60 border border-border-theme text-text-secondary text-sm cursor-not-allowed select-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                    <LockClosedIcon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-text-secondary">
                  For platform security and identity integrity, administrator email addresses cannot be altered.
                </p>
              </div>

              {/* Role Field (Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Assigned Privileges
                </label>
                <input
                  type="text"
                  value="Super Administrator (Full System Access)"
                  disabled
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted/60 border border-border-theme text-text-secondary text-sm cursor-not-allowed select-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white hover:bg-secondary/90 font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {profileLoading ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === "password" && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Change Admin Password</h3>
            <p className="text-xs text-text-secondary">
              Update your administrator password regularly to protect platform operations and user data.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-medium">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground text-sm focus:outline-none focus:border-secondary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground cursor-pointer"
                >
                  {showCurrentPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground text-sm focus:outline-none focus:border-secondary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground cursor-pointer"
                >
                  {showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border-theme text-foreground text-sm focus:outline-none focus:border-secondary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground cursor-pointer"
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-secondary text-white hover:bg-secondary/90 font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {passwordLoading ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SYSTEM TELEMETRY */}
      {activeTab === "system" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-theme shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Platform Telemetry & Infrastructure</h3>
            <p className="text-xs text-text-secondary">Core server runtime status, cloud services, and environment config.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Server Environment</span>
              <p className="text-sm font-bold text-foreground capitalize">{systemInfo?.environment || "Development"}</p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Node.js Runtime</span>
              <p className="text-sm font-bold text-foreground">{systemInfo?.nodeVersion || process.version || "v24.x"}</p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Memory RSS</span>
              <p className="text-sm font-bold text-foreground">{systemInfo?.memoryUsageMB ? `${systemInfo.memoryUsageMB} MB` : "Active"}</p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Payment Gateway</span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Razorpay (Active)</p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Media CDN Storage</span>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Cloudinary (Active)</p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-muted border border-border-theme space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Database Engine</span>
              <p className="text-sm font-bold text-foreground">MongoDB Atlas (Connected)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

