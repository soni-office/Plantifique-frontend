import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

interface TikTokStatusContextValue {
  connected: boolean | null; // null = still loading
  loading: boolean;
  refresh: () => void;
}

export const TikTokStatusContext = createContext<TikTokStatusContextValue>({
  connected: null,
  loading: true,
  refresh: () => {},
});

export function useTikTokStatus() {
  return useContext(TikTokStatusContext);
}

export function TikTokStatusProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const orgId = user?.org_id ?? null;

  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(() => {
    // Only fetch once we have an authenticated user with a known org_id.
    // Without this guard the request fires before the Firebase token is
    // attached to the axios interceptor, returns 401, and we incorrectly
    // mark the shop as disconnected.
    if (!isAuthenticated || !orgId) {
      setConnected(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    authApi
      .getTikTokStatus()
      .then((s) => setConnected(s.connected))
      .catch(() => setConnected(false))
      .finally(() => setLoading(false));
  }, [isAuthenticated, orgId]);

  // Re-run whenever auth state or org changes (covers login, org switch, refresh).
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <TikTokStatusContext.Provider value={{ connected, loading, refresh: fetchStatus }}>
      {children}
    </TikTokStatusContext.Provider>
  );
}
