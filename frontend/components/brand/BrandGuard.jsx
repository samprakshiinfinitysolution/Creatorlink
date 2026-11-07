"use client";

import React from "react";
import AuthRouteGuard from "@/components/auth/AuthRouteGuard";

/**
 * Brand Panel Route Guard.
 * Protects all /brand/* routes. Allows only authenticated users with role === "brand".
 */
export default function BrandGuard({ children }) {
  return (
    <AuthRouteGuard allowedRole="brand" roleLabel="Brand">
      {children}
    </AuthRouteGuard>
  );
}

