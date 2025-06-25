"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../../../src/components/ui/button";
import { useAuthStore } from "../../../src/lib/store/useAuthStore";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Set mounted to true when component mounts (client-side only)
  useEffect(() => {
    // Small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Define navigation items - removed Home, only keep Orders for authenticated users
  const navItems = [];

  // Add Orders link only for authenticated users
  if (mounted && isAuthenticated) {
    navItems.push({ name: "My Orders", path: "/orders" });
  }

  // If no nav items, don't render the navigation bar
  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav className="border-b bg-white">
      <div className="container h-12 px-4 md:px-6 overflow-x-auto">
        <div className="flex items-center gap-1 text-sm whitespace-nowrap">
          {navItems.map((item) => (
            <Link href={item.path} key={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={
                  pathname === item.path
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                    : ""
                }
              >
                {item.name === "My Orders" && (
                  <Package className="mr-1 h-4 w-4" />
                )}
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
