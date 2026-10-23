"use client";

import React, { useState, Suspense } from "react";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandMessages from "@/components/brand/messages/BrandMessages";

function BrandMessagesContent() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Brand Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 h-full min-h-0 overflow-hidden transition-all duration-300">
        {/* Brand Top Header */}
        <div className="shrink-0">
          <BrandHeader setMobileOpen={setMobileOpen} />
        </div>

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden flex flex-col min-h-0">
          <Suspense fallback={<div className="p-8 text-center text-xs text-text-secondary">Loading messages...</div>}>
            <BrandMessages />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function BrandMessagesPage() {
  return (
    <ReduxProvider>
      <BrandMessagesContent />
    </ReduxProvider>
  );
}
