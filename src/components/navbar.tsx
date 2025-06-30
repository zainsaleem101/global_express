"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Button } from "../../src/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "../../src/lib/store/useAuthStore";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get auth state from Zustand store
  const { user, isAuthenticated, logout } = useAuthStore();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Update local state
      logout();
      setIsMenuOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Logout error:", error);
      }
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="border-b bg-white sticky top-0 z-50">
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
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMenu}
        />
      )}

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 z-50 bg-white border-b shadow-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container py-4 px-4">
          {/* Navigation Links */}
          <nav className="mb-6">
            <div className="space-y-2">
              <Link
                href="/"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  pathname === "/"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                href="/booking"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  pathname === "/booking"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <Calculator className="h-5 w-5" />
                <span className="font-medium">Get Quote</span>
              </Link>
              <Link
                href="/orders"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  pathname === "/orders"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span className="font-medium">Track Orders</span>
              </Link>
            </div>
          </nav>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-6" />

          {/* Auth Section */}
          <div className="space-y-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={closeMenu} className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenu} className="block">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
