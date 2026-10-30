"use client";

import React, { Suspense } from "react";
import LoginNetworkVisual from "@/components/auth/LoginNetworkVisual";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

function ResetPasswordFallback() {
  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="flex items-center gap-3 text-text-secondary text-sm font-sans">
        <svg className="animate-spin h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading reset details...</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col lg:flex-row overflow-x-hidden">
      {/* =========================================================
          LEFT COLUMN: CREATOR × BRAND NETWORK VISUAL (48% WIDTH ON DESKTOP)
      ========================================================= */}
      <div className="hidden lg:block lg:w-[48%] shrink-0">
        <LoginNetworkVisual />
      </div>

      {/* =========================================================
          RIGHT COLUMN: RESET PASSWORD FORM PANEL (52% WIDTH ON DESKTOP)
      ========================================================= */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center">
        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}

