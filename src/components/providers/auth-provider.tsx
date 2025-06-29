"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../lib/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isAuthenticated, loading, authChecked } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth when component mounts
    checkAuth();
  }, [checkAuth]);

  // Handle auth state changes and redirects
  useEffect(() => {
    // Only proceed if auth has been checked
    if (!authChecked || loading) {
      return;
    }

    // If not authenticated and on a protected route, redirect to login
    if (!isAuthenticated) {
      const protectedPaths = ["/orders", "/booking"];
      const authOnlyPaths = ["/login", "/register"];

      const isOnProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
      );
      const isOnAuthOnlyPath = authOnlyPaths.some((path) =>
        pathname.startsWith(path)
      );

      if (isOnProtectedPath) {
        const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
      }
    } else {
      // If authenticated and on auth-only pages, redirect to home
      const authOnlyPaths = ["/login", "/register"];
      const isOnAuthOnlyPath = authOnlyPaths.some((path) =>
        pathname.startsWith(path)
      );

      if (isOnAuthOnlyPath) {
        // Check for callback URL
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get("callbackUrl");

        if (
          callbackUrl &&
          !authOnlyPaths.some((path) => callbackUrl.startsWith(path))
        ) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
      }
    }
  }, [isAuthenticated, loading, authChecked, pathname, router]);

  return <>{children}</>;
}
