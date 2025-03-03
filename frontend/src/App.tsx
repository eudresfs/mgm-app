import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { CommandMenu } from '@/components/command-menu';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

// Layouts
import DashboardLayout from '@/layouts/dashboard-layout';

// Auth Pages
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';

// Dashboard Pages
import Dashboard from '@/pages/dashboard';
import Affiliates from '@/pages/affiliates';
import AffiliateDetails from '@/pages/affiliates/affiliate-details';
import Campaigns from '@/pages/campaigns';
import CampaignDetails from '@/pages/campaigns/campaign-details';
import Offers from '@/pages/campaigns/offers';
import OfferDetails from '@/pages/campaigns/offer-details';
import Payouts from '@/pages/campaigns/payouts';
import Profile from '@/pages/profile';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="affiliate-platform-theme">
      <AuthProvider>
        <Router>
          <CommandMenu />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="affiliates" element={<Affiliates />} />
              <Route path="affiliates/:id" element={<AffiliateDetails />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/:id" element={<CampaignDetails />} />
              <Route path="offers" element={<Offers />} />
              <Route path="offers/:id" element={<OfferDetails />} />
              <Route path="payouts" element={<Payouts />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;