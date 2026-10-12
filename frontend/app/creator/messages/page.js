"use client";

import React, { useState, Suspense } from "react";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorSidebar from "@/components/creator/dashboard/CreatorSidebar";
import CreatorHeader from "@/components/creator/dashboard/CreatorHeader";
import CreatorMessages from "@/components/creator/messages/CreatorMessages";

function CreatorMessagesContent() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Creator Sidebar */}
      <CreatorSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-full min-h-0 overflow-hidden">
        {/* Creator Top Header */}
        <div className="shrink-0">
          <CreatorHeader setMobileOpen={setMobileOpen} />
        </div>

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden flex flex-col min-h-0">
          <Suspense fallback={<div className="p-8 text-center text-xs text-text-secondary">Loading messages...</div>}>
            <CreatorMessages />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function CreatorMessagesPage() {
  return (
    <ReduxProvider>
      <CreatorMessagesContent />
    </ReduxProvider>
  );
}
