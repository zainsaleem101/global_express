"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Home,
  Calculator,
  MapPin,
} from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../../src/lib/store/useAuthStore";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // Small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 100);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Logout error:", error);
      }
    }
  };

  if (!mounted) {
    return (
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold text-blue-600">
              GlobalExpress
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              delivering worldwide, sustainably
            </span>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600"
              onClick={closeMenu}
            >
              GlobalExpress
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              delivering worldwide, sustainably
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  pathname === "/"
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/booking">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  pathname === "/booking"
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <Calculator className="h-4 w-4" />
                Get Quote
              </Button>
            </Link>
            <Link href="/orders">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  pathname === "/orders"
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Track Orders
              </Button>
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center text-sm text-gray-700">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={closeMenu}
        />
      )}

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container py-4 px-4">
          {/* Navigation Links */}
          <nav className="mb-6">
            <div className="space-y-2">
              <Link href="/" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full flex items-center gap-2 justify-start ${
                    pathname === "/"
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/booking" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full flex items-center gap-2 justify-start ${
                    pathname === "/booking"
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Calculator className="h-4 w-4" />
                  Get Quote
                </Button>
              </Link>
              <Link href="/orders" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full flex items-center gap-2 justify-start ${
                    pathname === "/orders"
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  Track Orders
                </Button>
              </Link>
            </div>
          </nav>
          {/* Auth Buttons */}
          <div className="space-y-2">
            {isAuthenticated && user ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2 justify-start"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenu}>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full flex items-center gap-2 justify-start bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
