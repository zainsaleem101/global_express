// Store the current page path in session storage
export const storeCurrentPage = (path: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("lastVisitedPage", path);
  }
};

// Get the last visited page from session storage
export const getLastVisitedPage = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("lastVisitedPage") || "/";
  }
  return "/";
};

// Clear the stored page
export const clearStoredPage = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("lastVisitedPage");
  }
};
