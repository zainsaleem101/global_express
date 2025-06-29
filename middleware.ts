import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenWithDetails } from "./src/lib/auth/jwt";

// List of paths that require authentication
const protectedPaths = [
  "/orders", // Protected orders page
  "/booking", // Protected booking page
];

// List of paths that are only accessible to non-authenticated users
const authOnlyPaths = ["/login", "/register"];

// List of API paths that require authentication
const protectedApiPaths = [
  "/api/auth/me",
  "/api/orders", // Protected orders API
  "/api/transglobal/book-shipment", // Protect the shipment booking API
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers to all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Add Content-Security-Policy header
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
  );

  // Add Strict-Transport-Security header in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Check if this is an API request
  const isApiRequest = pathname.startsWith("/api/");

  // Get token from cookie
  const token = request.cookies.get("auth_token")?.value;

  // Verify the token if it exists
  let isAuthenticated = false;
  if (token) {
    const tokenResult = verifyTokenWithDetails(token);
    isAuthenticated = tokenResult.valid;

    // If token is invalid/expired, clear the cookie
    if (!isAuthenticated) {
      response.cookies.set({
        name: "auth_token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0), // Set expiry to epoch time to delete the cookie
        sameSite: "strict",
        path: "/",
      });
    }
  }

  // Handle API authentication
  if (isApiRequest) {
    // Check if this API path requires authentication
    const isProtectedApiPath = protectedApiPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isProtectedApiPath && !isAuthenticated) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // For authenticated API requests, proceed normally
    return response;
  }

  // Handle page navigation (non-API requests)

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  // Check if the path is for non-authenticated users only
  const isAuthOnlyPath = authOnlyPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Store the current URL for post-login redirect if accessing a protected path
  if (!isAuthenticated && isProtectedPath) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth-only pages (like login/register)
  if (isAuthenticated && isAuthOnlyPath) {
    // Check if there's a callback URL to redirect to
    const callbackUrl = new URL(request.url).searchParams.get("callbackUrl");
    if (
      callbackUrl &&
      !authOnlyPaths.some((path) => callbackUrl.startsWith(path))
    ) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    // If no callback URL, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// Update the matcher to include all relevant paths
export const config = {
  matcher: [
    // Auth-only and protected pages
    "/login",
    "/register",
    "/orders",
    "/orders/:path*",
    "/booking",
    "/booking/:path*",
    // Protected API routes
    "/api/auth/me",
    "/api/orders/:path*",
    "/api/transglobal/book-shipment",
    // Apply security headers to all routes
    "/(.*)",
  ],
};
