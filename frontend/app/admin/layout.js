"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/dashboard/AdminSidebar";
import AdminHeader from "@/components/admin/dashboard/AdminHeader";

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Do not show admin sidebar/header chrome on the dedicated login page
  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 select-auto">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area Offset by Desktop Sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Admin Header with Theme Toggle & Profile Actions */}
        <AdminHeader setMobileOpen={setMobileOpen} />

        {/* Page Main Container */}
        <main className="flex-1 w-full px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1536px] mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <ReduxProvider>
      <AdminGuard>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminGuard>
    </ReduxProvider>
  );
}
