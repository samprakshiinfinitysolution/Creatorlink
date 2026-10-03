"use client";

import React from "react";
import SignupEcosystemVisual from "@/components/auth/SignupEcosystemVisual";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col lg:flex-row overflow-x-hidden">
      {/* =========================================================
          LEFT COLUMN: ENTER THE SYNERGIE VISUAL (48% WIDTH ON DESKTOP)
      ========================================================= */}
      <div className="hidden lg:block lg:w-[48%] shrink-0">
        <SignupEcosystemVisual />
      </div>

      {/* =========================================================
          RIGHT COLUMN: SIGNUP FORM PANEL (52% WIDTH ON DESKTOP)
      ========================================================= */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center">
        <SignupForm />
      </div>
    </main>
  );
}
