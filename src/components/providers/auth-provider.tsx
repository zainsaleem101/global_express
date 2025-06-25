"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../lib/store/useAuthStore";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Only check auth once when the component mounts
    console.log("AuthProvider: Checking authentication...");
    checkAuth();
  }, [checkAuth]); // Include checkAuth in dependencies

  return <>{children}</>;
}
