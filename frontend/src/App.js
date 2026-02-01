import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect, lazy, Suspense } from 'react';

// Firebase Analytics
import { logAnalyticsEvent, AnalyticsEvents } from '@/services/firebase';

// Critical Pages - Load immediately
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Lazy load non-critical pages to reduce initial bundle size
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const FamilyMode = lazy(() => import('@/pages/FamilyMode'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const Profile = lazy(() => import('@/pages/Profile'));
const Knowledge = lazy(() => import('@/pages/Knowledge'));
const Community = lazy(() => import('@/pages/Community'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const TrialSuccess = lazy(() => import('@/pages/TrialSuccess'));
const Downloads = lazy(() => import('@/pages/Downloads'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const InvestorRegister = lazy(() => import('@/pages/InvestorRegister'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const EnterpriseDashboard = lazy(() => import('@/pages/EnterpriseDashboard'));
const FamilyAdmin = lazy(() => import('@/pages/FamilyAdmin'));
const ChildTracking = lazy(() => import('@/pages/ChildTracking'));
const SOSEmergency = lazy(() => import('@/pages/SOSEmergency'));
const VincularDispositivo = lazy(() => import('@/pages/VincularDispositivo'));
const Rewards = lazy(() => import('@/pages/Rewards'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const LegalNotice = lazy(() => import('@/pages/LegalNotice'));
const LandingPromo = lazy(() => import('@/pages/LandingPromo'));
const RecuperarPassword = lazy(() => import('@/pages/RecuperarPassword'));
const VerificarEstafa = lazy(() => import('@/pages/VerificarEstafa'));
const ManoProtectRegistro = lazy(() => import('@/pages/ManoProtectRegistro'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const DescargarDesktop = lazy(() => import('@/pages/DescargarDesktop'));
const DescargarApps = lazy(() => import('@/pages/DescargarApps'));
const PortalEmpleados = lazy(() => import('@/pages/PortalEmpleados'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));

// Lazy load non-critical UI components to reduce main thread blocking
const CookieConsent = lazy(() => import('@/components/CookieConsent'));
const FloatingWhatsApp = lazy(() => import('@/components/FloatingWhatsApp'));

import UrgencyBanner from '@/components/UrgencyBanner';

import '@/App.css';

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-zinc-500 text-sm">Cargando...</p>
    </div>
  </div>
);

// Empty fallback for non-critical components
const EmptyFallback = () => null;

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

// App Router - ManoProtect.com Only
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  if (location.hash?.includes('session_id=')) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthCallback />
      </Suspense>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/trial-success" element={<TrialSuccess />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/community" element={<Community />} />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/legal-notice" element={<LegalNotice />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/preguntas-frecuentes" element={<FAQ />} />
          <Route path="/empleados/descargar" element={<DescargarDesktop />} />
          <Route path="/empleados/portal" element={<PortalEmpleados />} />
          <Route path="/desarrolladores/descargas" element={<DescargarApps />} />
          
          {/* ManoProtect Promo Landing */}
          <Route path="/promo" element={<LandingPromo />} />
          <Route path="/manoprotect" element={<LandingPromo />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/verificar-estafa" element={<VerificarEstafa />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro" element={<ManoProtectRegistro />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          
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
          path="/sos-emergency" 
          element={
            <ProtectedRoute>
              <SOSEmergency />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vincular/:memberId" 
          element={<VincularDispositivo />} 
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
      </Suspense>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <UrgencyBanner 
            message="🎁 OFERTA ESPECIAL: Primer mes GRATIS en ManoProtect"
            link="/registro"
          />
          <Toaster position="top-center" richColors />
          <AppRouter />
          {/* Defer non-critical UI components */}
          <Suspense fallback={<EmptyFallback />}>
            <FloatingWhatsApp />
          </Suspense>
          <Suspense fallback={<EmptyFallback />}>
            <CookieConsent />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
