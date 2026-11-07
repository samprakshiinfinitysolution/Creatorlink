"use client";

import React from "react";
import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import BrandGuard from "@/components/brand/BrandGuard";

export default function BrandLayout({ children }) {
  return (
    <ReduxProvider>
      <BrandGuard>
        {children}
      </BrandGuard>
    </ReduxProvider>
  );
}

