"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogIn, UserPlus, LogOut, Menu, X } from "lucide-react";
import { Button } from "../../src/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "../../src/lib/store/useAuthStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get auth state from Zustand store
  const { user, isAuthenticated, logout } = useAuthStore();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");

      // Call the logout API endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Update local state
      logout(); // This calls the Zustand logout which ALSO calls the API!
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <header className="border-b bg-white">
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
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
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
        <div className="md:hidden border-b bg-white">
          <div className="container py-3 px-4 space-y-2">
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
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
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
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1"
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
                    variant="default"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700"
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

      <nav className="border-b bg-white">
        <div className="container h-12 px-4 md:px-6 overflow-x-auto">
          <div className="flex items-center gap-1 text-sm whitespace-nowrap">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={
                  pathname === "/"
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                    : ""
                }
              >
                Home
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={
                  pathname === "/quote"
                    ? "bg-green-500 text-white hover:bg-green-600 hover:text-white"
                    : ""
                }
              >
                Quote
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={
                  pathname === "/track"
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                    : ""
                }
              >
                Track
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
