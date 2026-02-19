import { create } from 'zustand';
import { authApi } from '../api/auth';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  setToken: (token: string | null) => void;
  initializeAuth: () => Promise<void>;
  loginWithTikTok: () => Promise<void>;
  completeOAuthCallback: (code: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('app_access_token'),
  isAuthenticated: Boolean(localStorage.getItem('app_access_token')),
  isLoading: false,
  initialized: false,
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('app_access_token', token);
    } else {
      localStorage.removeItem('app_access_token');
    }
    set({ token, isAuthenticated: Boolean(token) });
  },

  initializeAuth: async () => {
    if (get().initialized) return;
    const existingToken = localStorage.getItem('app_access_token');
    if (!existingToken) {
      set({ user: null, token: null, isAuthenticated: false, initialized: true, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authApi.getCurrentUser();
      set({ user, token: existingToken, isAuthenticated: true, initialized: true });
    } catch {
      localStorage.removeItem('app_access_token');
      set({
        user: null,
        isAuthenticated: false,
        token: null,
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithTikTok: async () => {
    set({ isLoading: true });
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';
      const loginPath = import.meta.env.VITE_TIKTOK_LOGIN_PATH ?? '/auth/tiktokshop/login';
      window.location.assign(`${backendUrl}${loginPath}`);
    } finally {
      set({ isLoading: false });
    }
  },

  completeOAuthCallback: async (code: string, state: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.exchangeSessionFromCallback(code, state);
      localStorage.setItem('app_access_token', response.access_token);
      set({
        token: response.access_token,
        user: response.user,
        isAuthenticated: true,
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // ignore logout API failures and clear local state
    } finally {
      localStorage.removeItem('app_access_token');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
      });
    }
  },
}));
