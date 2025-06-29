import { useAuthStore } from "../store/useAuthStore";
import type { ICountry } from "../models/Country";
import { useQuery } from "@tanstack/react-query";

// Global fetch interceptor to handle 401 responses
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Always include credentials
  });

  // Handle 401 responses globally
  if (response.status === 401) {
    // Get the auth store and force logout (without API call)
    const { forceLogout } = useAuthStore.getState();

    // Clear the auth state
    forceLogout();

    // Redirect to login page
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
  }

  return response;
}

// Enhanced fetch with better error handling
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(url, options);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetches countries from the API and sorts them alphabetically by title
 * This function is shared across multiple components and cached by TanStack Query
 */
export const fetchCountries = async (): Promise<ICountry[]> => {
  const response = await fetch("/api/transglobal/get-countries");
  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }
  const countries: ICountry[] = await response.json();

  // Sort countries alphabetically by title
  return countries.sort((a, b) => a.Title.localeCompare(b.Title));
};

/**
 * Custom hook for fetching countries with TanStack Query
 * Provides consistent caching and error handling across all components
 */
export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: Number.POSITIVE_INFINITY, // Never consider the data stale
    gcTime: Number.POSITIVE_INFINITY, // Never garbage collect the data
    retry: 3, // Retry failed requests 3 times
  });
};
