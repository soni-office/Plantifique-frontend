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
  const { isAuthenticated, user, activeOrgId } = useAuthStore();
  // Use activeOrgId when set (SUPER_ADMIN org-switch), else fall back to token's org_id
  const orgId = activeOrgId ?? user?.org_id ?? null;

  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(() => {
    // Only fetch once we have an authenticated user with a known org_id.
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

  // Re-run whenever auth state, org, or active org switch changes.
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <TikTokStatusContext.Provider value={{ connected, loading, refresh: fetchStatus }}>
      {children}
    </TikTokStatusContext.Provider>
  );
}
