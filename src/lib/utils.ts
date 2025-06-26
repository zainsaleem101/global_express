import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function for environment-based logging
 * Only logs in development environment
 */
export function debugLog(message: string, ...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(message, ...args);
  }
}

/**
 * Utility function for environment-based error logging
 * Only logs in development environment
 */
export function debugError(message: string, error?: any) {
  if (process.env.NODE_ENV === "development") {
    console.error(message, error);
  }
}
