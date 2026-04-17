import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TikTokStatusProvider, useTikTokStatus } from '../../context/tikTokStatus';
import { useAuthStore } from '../../store/authStore';
import { ErrorBoundary } from '../ErrorBoundary';

/** Shown on data routes when the org has no active TikTok Shop token. */
function NoShopAccess() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 max-w-md">
        <h2 className="text-lg font-semibold text-amber-800">TikTok Shop not connected</h2>
        <p className="mt-2 text-sm text-amber-700">
          This app does not have permission to access TikTok Shop data. Dashboard content is
          unavailable until a shop connection is established.
        </p>
        {isAdmin && (
          <Link
            to="/dashboard"
            className="mt-4 inline-block rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
          >
            Go to Dashboard to connect
          </Link>
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const { connected, loading } = useTikTokStatus();
  const location = useLocation();

  // Index route (/dashboard) always renders — it hosts the connect/revoke UI.
  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  const showGate = !loading && connected === false && !isHomePage;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <ErrorBoundary>
          {showGate ? <NoShopAccess /> : <Outlet />}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <TikTokStatusProvider>
      <DashboardContent />
    </TikTokStatusProvider>
  );
}
