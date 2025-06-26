"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, AlertCircle, Mail, Lock, Package } from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import { Input } from "../../../src/components/ui/input";
import { Label } from "../../../src/components/ui/label";
import { Alert, AlertDescription } from "../../../src/components/ui/alert";
import { useAuthStore } from "../../../src/lib/store/useAuthStore";
import SiteLayout from "../../../src/components/layout/site-layout";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login, isAuthenticated } = useAuthStore();

  // Get the callback URL from the URL parameters
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      console.log("Login successful");

      // Store user data and token in Zustand store
      login(data.user, data.token);

      // Wait for state to update before redirecting
      setTimeout(() => {
        console.log("Redirecting to:", callbackUrl);
        router.push(callbackUrl);
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="flex flex-1 min-h-[calc(100vh-13rem)] bg-blue-600">
        {/* Left side - Content */}
        <div className="flex flex-1 items-center justify-center p-4 py-12 text-white">
          <div className="max-w-md space-y-8">
            <div className="text-center md:text-left">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-8 mx-auto md:mx-0">
                <Package className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                GlobalExpress Shipping
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Fast, reliable, and sustainable worldwide delivery services at
                your fingertips.
              </p>
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-lg flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Exclusive Rates</div>
                    <div className="text-sm opacity-80">
                      Access special shipping rates not available to guests
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Track Shipments</div>
                    <div className="text-sm opacity-80">
                      Real-time tracking of all your packages
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="hidden md:flex flex-1 items-center justify-center p-4 py-12 bg-white">
          <div className="mx-auto w-full max-w-md space-y-6 rounded-xl border border-blue-100 bg-white p-8 shadow-xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 text-red-800 border-red-200"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-medium"
                disabled={loading}
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile login form (shown when screen is small) */}
        <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto pt-16 px-4">
          <div className="mx-auto w-full max-w-md space-y-6 p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 text-red-800 border-red-200"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email-mobile" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email-mobile"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password-mobile"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password-mobile"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-medium"
                disabled={loading}
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
