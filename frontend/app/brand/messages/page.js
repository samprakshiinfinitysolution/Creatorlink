"use client";

import React, { useState, Suspense } from "react";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandSidebar from "@/components/brand/dashboard/BrandSidebar";
import BrandHeader from "@/components/brand/dashboard/BrandHeader";
import BrandMessages from "@/components/brand/messages/BrandMessages";

function BrandMessagesContent() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Brand Sidebar */}
      <BrandSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Brand Top Header */}
        <BrandHeader setMobileOpen={setMobileOpen} />

        {/* Page Content Container */}
        <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
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
