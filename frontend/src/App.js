import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

// Firebase Analytics
import { logAnalyticsEvent, AnalyticsEvents } from '@/services/firebase';

// Pages
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import HowItWorks from '@/pages/HowItWorks';
import FamilyMode from '@/pages/FamilyMode';
import Contacts from '@/pages/Contacts';
import Profile from '@/pages/Profile';
import Knowledge from '@/pages/Knowledge';
import Community from '@/pages/Community';
import Pricing from '@/pages/Pricing';
import PaymentSuccess from '@/pages/PaymentSuccess';
import Downloads from '@/pages/Downloads';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AuthCallback from '@/pages/AuthCallback';
import InvestorRegister from '@/pages/InvestorRegister';
import AdminPanel from '@/pages/AdminPanel';
import EnterpriseDashboard from '@/pages/EnterpriseDashboard';
import FamilyAdmin from '@/pages/FamilyAdmin';
import ChildTracking from '@/pages/ChildTracking';
import Rewards from '@/pages/Rewards';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import LegalNotice from '@/pages/LegalNotice';
import ManoBank from '@/pages/ManoBank';
import BancoEmpleados from '@/pages/BancoEmpleados';
import BancoSistema from '@/pages/BancoSistema';
import SolicitarCuenta from '@/pages/SolicitarCuenta';
import CookieConsent from '@/components/CookieConsent';

import '@/App.css';

// Analytics Page Tracker
const AnalyticsTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    logAnalyticsEvent(AnalyticsEvents.PAGE_VIEW, {
      page_path: location.pathname,
      page_title: document.title
    });
  }, [location]);
  
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children, requireInvestor = false, requireAdmin = false, redirectTo = "/login" }) => {
  const { isAuthenticated, isInvestor, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireInvestor && !isInvestor) {
    return <Navigate to="/investor/register" replace />;
  }

  return children;
};

// App Router with session_id detection
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  // REMINDER: This synchronous check prevents race conditions
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <>
      <AnalyticsTracker />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/knowledge" element={<Knowledge />} />
      <Route path="/community" element={<Community />} />
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/legal-notice" element={<LegalNotice />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Investor Routes */}
      <Route path="/investor/register" element={<InvestorRegister />} />
      <Route 
        path="/downloads" 
        element={
          <ProtectedRoute requireInvestor={true}>
            <Downloads />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/family-mode" 
        element={
          <ProtectedRoute>
            <FamilyMode />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/family-admin" 
        element={
          <ProtectedRoute>
            <FamilyAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/child-tracking" 
        element={
          <ProtectedRoute>
            <ChildTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contacts" 
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/rewards" 
        element={
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/enterprise" 
        element={
          <ProtectedRoute>
            <EnterpriseDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manobank" 
        element={
          <ProtectedRoute>
            <ManoBank />
          </ProtectedRoute>
        } 
      />
      
      {/* ManoBank Employee Portal - Separate System */}
      <Route path="/banco" element={<BancoEmpleados />} />
      <Route 
        path="/banco/sistema" 
        element={
          <ProtectedRoute redirectTo="/banco">
            <BancoSistema />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <AppRouter />
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
