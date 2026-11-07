"use client";

import React from "react";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import CreatorGuard from "@/components/creator/CreatorGuard";

export default function CreatorLayout({ children }) {
  return (
    <ReduxProvider>
      <CreatorGuard>
        {children}
      </CreatorGuard>
    </ReduxProvider>
  );
}

