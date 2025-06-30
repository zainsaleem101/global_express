import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState } from "../types/global";

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
          token: undefined,
        });
      },

      forceLogout: () => {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          authChecked: true,
          token: undefined,
        });
      },

      checkAuth: async () => {
        const state = get();

        if (state.loading) {
          return;
        }

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
          } else if (response.status === 401) {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
              authChecked: true,
              token: undefined,
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
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authChecked: state.authChecked,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
        }
      },
    }
  )
);
