import { Connection } from "mongoose";

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
      };
    }
  }
}

// From src/lib/models/Country.ts
export interface ICountry {
  CountryID: number;
  Title: string;
  CountryCode: string;
}

// From src/lib/store/useAuthStore.ts
export interface AuthState {
  user: import('./user').User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token?: string;
  authChecked: boolean;
  setUser: (user: import('./user').User | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  login: (user: import('./user').User, token: string) => void;
  logout: () => void;
  forceLogout: () => void;
  checkAuth: () => Promise<void>;
  resetAuth: () => void;
}
