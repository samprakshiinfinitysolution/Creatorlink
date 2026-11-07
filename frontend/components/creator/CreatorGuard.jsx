"use client";

import React from "react";
import AuthRouteGuard from "@/components/auth/AuthRouteGuard";

/**
 * Creator Panel Route Guard.
 * Protects all /creator/* routes. Allows only authenticated users with role === "creator".
 */
export default function CreatorGuard({ children }) {
  return (
    <AuthRouteGuard allowedRole="creator" roleLabel="Creator">
      {children}
    </AuthRouteGuard>
  );
}

