import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { authApi } from '../api/auth';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  /** Subscribe to Firebase auth state — call once on app mount. */
  initializeAuth: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  /** Fetch TikTok OAuth URL and redirect the browser — org_admin/super_admin only. */
  connectTikTok: () => Promise<void>;
  logout: () => Promise<void>;
}

// Module-level guard so the onAuthStateChanged listener is only registered once.
let _subscribed = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,

  initializeAuth: () => {
    if (_subscribed) return;
    _subscribed = true;

    set({ isLoading: true });

    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch full profile (name, org_id, role) from backend
          const user = await authApi.getCurrentUser();
          set({ firebaseUser, user, isAuthenticated: true, initialized: true, isLoading: false });
        } catch {
          // Token valid but /auth/me failed — use minimal data from the Firebase token
          set({
            firebaseUser,
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              role: 'ORG_MEMBER',
              org_id: '',
            },
            isAuthenticated: true,
            initialized: true,
            isLoading: false,
          });
        }
      } else {
        set({
          firebaseUser: null,
          user: null,
          isAuthenticated: false,
          initialized: true,
          isLoading: false,
        });
      }
    });
  },

  loginWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      // onAuthStateChanged fires automatically and resolves the rest of the state
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  connectTikTok: async () => {
    set({ isLoading: true });
    try {
      const authUrl = await authApi.getTikTokConnectUrl();
      window.location.href = authUrl;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(firebaseAuth);
    } finally {
      set({ user: null, firebaseUser: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
