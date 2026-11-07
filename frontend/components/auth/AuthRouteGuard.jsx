"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { getMe } from "@/redux/auth/auth_slice";
import ThreeDotLoader from "@/components/common/Loader/ThreeDotLoader";

/**
 * Centralized Route Guard for role-based authentication.
 *
 * @param {Object} props
 * @param {string} props.allowedRole - Target role ("creator" | "brand")
 * @param {string} props.roleLabel - Display label ("Creator" | "Brand")
 * @param {React.ReactNode} props.children - Protected content
 */
export default function AuthRouteGuard({
  allowedRole,
  roleLabel = "User",
  children,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const hasDispatchedRef = useRef(false);

  // Helper to redirect users with mismatched roles to their authorized panels
  const redirectToAppropriatePanel = (userRole) => {
    if (userRole === "creator") {
      router.replace("/creator/dashboard");
    } else if (userRole === "brand") {
      router.replace("/brand/dashboard");
    } else if (userRole === "admin") {
      router.replace("/admin/dashboard");
    } else {
      const fallbackTarget = allowedRole === "creator" ? "/creator/dashboard" : "/brand/dashboard";
      router.replace(`/login?redirect=${encodeURIComponent(pathname || fallbackTarget)}`);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. If Redux already has an authenticated user in memory
    if (user && isAuthenticated) {
      if (user.role === allowedRole) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Authenticated with a different role -> redirect to their panel
      setIsAuthorized(false);
      setIsChecking(false);
      redirectToAppropriatePanel(user.role);
      return;
    }

    // 2. If no user in Redux store (page reload / fresh tab), verify session via /api/auth/me
    if (!hasDispatchedRef.current) {
      hasDispatchedRef.current = true;

      // Safety timeout: Prevent infinite loading state on network stall
      const safetyTimer = setTimeout(() => {
        if (isMounted) {
          setIsChecking(false);
          setIsAuthorized(false);
          const fallbackTarget = allowedRole === "creator" ? "/creator/dashboard" : "/brand/dashboard";
          router.replace(`/login?redirect=${encodeURIComponent(pathname || fallbackTarget)}`);
        }
      }, 5000);

      const verifySession = async () => {
        try {
          const actionResult = await dispatch(getMe());
          clearTimeout(safetyTimer);

          if (!isMounted) return;

          if (getMe.fulfilled.match(actionResult)) {
            const fetchedUser =
              actionResult.payload?.data?.user || actionResult.payload?.user;

            if (fetchedUser?.role === allowedRole) {
              setIsAuthorized(true);
              setIsChecking(false);
              return;
            }

            // Mismatched role
            setIsAuthorized(false);
            setIsChecking(false);
            redirectToAppropriatePanel(fetchedUser?.role);
          } else {
            // Unauthenticated or expired session
            setIsAuthorized(false);
            setIsChecking(false);
            const fallbackTarget = allowedRole === "creator" ? "/creator/dashboard" : "/brand/dashboard";
            router.replace(`/login?redirect=${encodeURIComponent(pathname || fallbackTarget)}`);
          }
        } catch {
          clearTimeout(safetyTimer);
          if (isMounted) {
            setIsAuthorized(false);
            setIsChecking(false);
            const fallbackTarget = allowedRole === "creator" ? "/creator/dashboard" : "/brand/dashboard";
            router.replace(`/login?redirect=${encodeURIComponent(pathname || fallbackTarget)}`);
          }
        }
      };

      verifySession();

      return () => {
        isMounted = false;
        clearTimeout(safetyTimer);
      };
    }
  }, [user, isAuthenticated, allowedRole, dispatch, pathname, router]);

  // While checking authentication, render accessible centered loader
  if (isChecking) {
    const loginTarget = `/login?redirect=${encodeURIComponent(
      pathname || (allowedRole === "creator" ? "/creator/dashboard" : "/brand/dashboard")
    )}`;

    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border-theme flex items-center justify-center shadow-md">
            <svg
              className="w-6 h-6 text-pink-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm font-semibold tracking-wide text-foreground">
              Verifying {roleLabel} Access
            </p>
            <ThreeDotLoader forceShow={true} minDuration={300} />
          </div>

          <div className="pt-2 text-center">
            <Link
              href={loginTarget}
              className="text-xs text-text-secondary hover:text-foreground underline transition-colors"
            >
              Taking longer than usual? Click here to Sign In directly
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prevent flash of protected page content when unauthorized
  if (!isAuthorized) {
    return null;
  }

  return children;
}

