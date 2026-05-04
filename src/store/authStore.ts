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

/**
 * Holds an error message to surface on the login page after a forced sign-out.
 * Module-level so it survives Zustand state resets triggered by the Firebase
 * null auth event that follows signOut().
 */
let _pendingLoginError: string | null = null;
export const getPendingLoginError = (): string | null => _pendingLoginError;
export const clearPendingLoginError = (): void => { _pendingLoginError = null; };

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  /**
   * For SUPER_ADMIN: the org they are currently operating as.
   * When set, all API calls will carry X-Active-Org so the backend
   * scopes all data to this org instead of the admin's own org_id claim.
   */
  activeOrgId: string | null;
  /** Subscribe to Firebase auth state — call once on app mount. */
  initializeAuth: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  /** Fetch TikTok OAuth URL and redirect the browser — org_admin/super_admin only. */
  connectTikTok: () => Promise<void>;
  logout: () => Promise<void>;
  /** SUPER_ADMIN only: switch the active org context. Pass null to clear. */
  setActiveOrgId: (orgId: string | null) => void;
}

// Module-level guard so the onAuthStateChanged listener is only registered once.
let _subscribed = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  activeOrgId: null,

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
          // /auth/me failed — the Firebase token exists but the backend rejected or
          // doesn't recognise this user.  Block dashboard access entirely:
          // 1. Record the reason so LoginPage can surface it as a toast.
          // 2. Sign out of Firebase — this triggers a second onAuthStateChanged(null)
          //    which sets isAuthenticated: false and completes the redirect to /login.
          _pendingLoginError =
            'Your session could not be verified. Please sign in again.';
          await signOut(firebaseAuth);
          // State will be reset by the onAuthStateChanged(null) event above.
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
      set({ user: null, firebaseUser: null, isAuthenticated: false, isLoading: false, activeOrgId: null });
    }
  },

  setActiveOrgId: (orgId) => set({ activeOrgId: orgId }),
}));
