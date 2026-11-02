"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { getAdminMe } from "@/redux/admin/auth/admin_auth_slice";
import ThreeDotLoader from "@/components/common/Loader/ThreeDotLoader";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isLoginPage = Boolean(pathname?.startsWith("/admin/login"));

  const { adminUser } = useSelector((state) => state.adminAuth || {});
  const { user: generalUser } = useSelector((state) => state.auth || {});

  const [isAuthorized, setIsAuthorized] = useState(isLoginPage);
  const [isChecking, setIsChecking] = useState(!isLoginPage);
  const hasDispatchedRef = useRef(false);

  useEffect(() => {
    // If we are on the dedicated admin login page, bypass all checks
    if (isLoginPage) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    let isMounted = true;

    // 1. If Redux already has the authenticated admin in either adminAuth or auth store
    const activeAdmin =
      (adminUser?.role === "admin" && adminUser) ||
      (generalUser?.role === "admin" && generalUser);

    if (activeAdmin) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    // 2. If no admin in memory (page reload / fresh tab), verify session via /api/admin/auth/me
    if (!hasDispatchedRef.current) {
      hasDispatchedRef.current = true;

      // Safety timeout: Never hang indefinitely on "Verifying Administrator Credentials"
      const safetyTimer = setTimeout(() => {
        if (isMounted) {
          setIsChecking(false);
          setIsAuthorized(false);
          router.replace(
            `/admin/login?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`
          );
        }
      }, 5000);

      const checkAuthorization = async () => {
        try {
          const actionResult = await dispatch(getAdminMe());
          clearTimeout(safetyTimer);

          if (!isMounted) return;

          if (getAdminMe.fulfilled.match(actionResult)) {
            const fetchedUser =
              actionResult.payload?.data?.user || actionResult.payload?.user;

            if (fetchedUser?.role === "admin") {
              setIsAuthorized(true);
              setIsChecking(false);
              return;
            }

            // Not an admin account
            setIsAuthorized(false);
            setIsChecking(false);
            router.replace(
              `/admin/login?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`
            );
          } else {
            // Expired or unauthenticated
            setIsAuthorized(false);
            setIsChecking(false);
            router.replace(
              `/admin/login?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`
            );
          }
        } catch {
          clearTimeout(safetyTimer);
          if (isMounted) {
            setIsAuthorized(false);
            setIsChecking(false);
            router.replace(
              `/admin/login?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`
            );
          }
        }
      };

      checkAuthorization();

      return () => {
        isMounted = false;
        clearTimeout(safetyTimer);
      };
    }
  }, [adminUser, generalUser, dispatch, isLoginPage, pathname, router]);

  // Bypass guard check on login page
  if (isLoginPage) {
    return children;
  }

  // Render centered spinner during authentication verification
  if (isChecking) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-white"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-neutral-300 animate-spin"
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
            <p className="text-sm font-semibold tracking-wide text-neutral-200">
              Verifying Administrator Credentials
            </p>
            <ThreeDotLoader />
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/admin/login"
              className="text-xs text-neutral-400 hover:text-white underline transition-colors"
            >
              Taking longer than usual? Click here to Sign In directly
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
}
