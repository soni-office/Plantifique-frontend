import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const location = useLocation();
  const { initialized, isLoading, isAuthenticated, initializeAuth, logout } = useAuthStore();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const handleUnauthorized = () => {
      void logout();
    };

    window.addEventListener('app:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('app:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  if (!initialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
