"use client";

import Link from "next/link";
import {
  LogIn,
  UserPlus,
  LogOut,
  User,
  Menu,
  X,
  Home,
  Package,
} from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../../src/lib/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Set mounted to true when component mounts (client-side only)
  useEffect(() => {
    // Small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");

      // Update local state using Zustand store (which handles the API call)
      await logout();

      // Close menu and redirect
      setIsMenuOpen(false);

      // Wait a moment before redirecting
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Only render authentication-dependent UI after mounting to prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-blue-600"
            >
              GlobalExpress
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              delivering worldwide, sustainably
            </span>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-1">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden md:block w-[120px]"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-blue-600"
            >
              GlobalExpress
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              delivering worldwide, sustainably
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2 mx-4">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                size="sm"
                className={pathname === "/" ? "bg-blue-600 text-white" : ""}
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Button>
            </Link>
            {isAuthenticated && (
              <Link href="/orders">
                <Button
                  variant={pathname.startsWith("/orders") ? "default" : "ghost"}
                  size="sm"
                  className={
                    pathname.startsWith("/orders")
                      ? "bg-blue-600 text-white"
                      : ""
                  }
                >
                  <Package className="h-4 w-4 mr-1" />
                  Orders
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-1"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center mr-2 text-sm">
                  <User className="h-4 w-4 mr-1 text-blue-600" />
                  <span>{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant={pathname === "/login" ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-1 ${
                      pathname === "/login"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant={pathname === "/register" ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-1 ${
                      pathname === "/register"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b bg-white absolute w-full z-40">
          <div className="container py-3 px-4 space-y-2">
            <div className="grid grid-cols-1 gap-2 mb-3">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block"
              >
                <Button
                  variant={pathname === "/" ? "default" : "ghost"}
                  size="sm"
                  className={`w-full flex items-center justify-center gap-1 ${
                    pathname === "/" ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              {isAuthenticated && (
                <Link
                  href="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <Button
                    variant={
                      pathname.startsWith("/orders") ? "default" : "ghost"
                    }
                    size="sm"
                    className={`w-full flex items-center justify-center gap-1 ${
                      pathname.startsWith("/orders")
                        ? "bg-blue-600 text-white"
                        : ""
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </Button>
                </Link>
              )}
            </div>

            {isAuthenticated && user ? (
              <>
                <div className="flex items-center text-sm py-1">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <Button
                    variant={pathname === "/login" ? "default" : "outline"}
                    size="sm"
                    className={`w-full flex items-center justify-center gap-1 ${
                      pathname === "/login" ? "bg-blue-600 text-white" : ""
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <Button
                    variant={pathname === "/register" ? "default" : "outline"}
                    size="sm"
                    className={`w-full flex items-center justify-center gap-1 ${
                      pathname === "/register"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
