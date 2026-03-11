import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { OAuthCallbackPage } from '../pages/auth/OAuthCallbackPage';
import { DashboardHomePage } from '../pages/dashboard/DashboardHomePage';
import { SampleRequestsPage } from '../pages/dashboard/SampleRequestsPage';
import { CreatorDetailsPage } from '../pages/dashboard/CreatorDetailsPage';
import { ProductDetailsPage } from '../pages/dashboard/ProductDetailsPage';

// import { AgentsPage } from '../pages/dashboard/AgentsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/tiktokshop/callback" element={<OAuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="sample-requests" element={<SampleRequestsPage />} />
          <Route path="creators/:creatorOpenId" element={<CreatorDetailsPage />} />
          <Route path="products/:productId" element={<ProductDetailsPage />} />
          {/* <Route path="agents" element={<AgentsPage />} /> */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
