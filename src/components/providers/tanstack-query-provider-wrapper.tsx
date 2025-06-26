"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// Dynamically import the TanStackQueryProvider to avoid SSR issues
const TanStackQueryProvider = dynamic(
  () => import("../../../src/components/providers/tanstack-query-provider"),
  {
    ssr: false,
  }
);

interface TanStackQueryProviderWrapperProps {
  children: ReactNode;
}

export default function TanStackQueryProviderWrapper({
  children,
}: TanStackQueryProviderWrapperProps) {
  return <TanStackQueryProvider>{children}</TanStackQueryProvider>;
}
