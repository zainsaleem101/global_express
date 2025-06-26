import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token?: string;
  authChecked: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isAuthenticated: false,
      authChecked: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      login: (user, token) => {
        set({
          user,
          isAuthenticated: true,
          loading: false,
          token,
          authChecked: true,
        });
      },

      logout: async () => {
        set({ loading: true });
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error during logout:", error);
          }
        }
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          authChecked: true,
        });
      },

      checkAuth: async () => {
        const state = get();

        // If we're already loading, don't start another request
        if (state.loading) {
          return;
        }

        // If auth has been checked and we have a user, don't check again
        if (state.authChecked && state.isAuthenticated && state.user) {
          return;
        }

        set({ loading: true });

        try {
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              loading: false,
              authChecked: true,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
              authChecked: true,
            });
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Auth check error:", error);
          }
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            authChecked: true,
          });
        }
      },

      resetAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          loading: true,
          authChecked: false,
          token: undefined,
        });
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authChecked: state.authChecked,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // When rehydrating from localStorage, set loading to false
        if (state) {
          state.loading = false;
        }
      },
    }
  )
);
