"use client";

import React from "react";
import LoginNetworkVisual from "@/components/auth/LoginNetworkVisual";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col lg:flex-row overflow-x-hidden">
      {/* =========================================================
          LEFT COLUMN: CREATOR × BRAND NETWORK VISUAL (48% WIDTH ON DESKTOP)
      ========================================================= */}
      <div className="hidden lg:block lg:w-[48%] shrink-0">
        <LoginNetworkVisual />
      </div>

      {/* =========================================================
          RIGHT COLUMN: LOGIN FORM PANEL (52% WIDTH ON DESKTOP)
      ========================================================= */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
