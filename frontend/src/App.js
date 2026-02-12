import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect, lazy, Suspense, useState } from 'react';

// Defer non-critical component loading
const PushNotificationPrompt = lazy(() => import('@/components/PushNotificationPrompt'));
const InterstitialAd = lazy(() => import('@/components/InterstitialAd').then(m => ({ default: m.InterstitialAd })));

// Simplified useInterstitialAd that respects preview environment
const useInterstitialAd = (user) => {
  const [showAd, setShowAd] = useState(false);
  
  useEffect(() => {
    // Never show ads in preview/staging
    const hostname = window.location.hostname;
    if (hostname.includes('preview') || hostname.includes('staging') || hostname === 'localhost') {
      return;
    }
    
    // Check if premium user
    const premiumPlans = ['family-yearly', 'family-monthly', 'premium', 'enterprise'];
    if (user && premiumPlans.includes(user.plan)) {
      return;
    }
    
    // Check session dismissed
    if (sessionStorage.getItem('mano_ad_session_dismissed') === 'true') {
      return;
    }
    
    // Check view count (show after 3 views)
    const views = parseInt(localStorage.getItem('mano_ad_views') || '0');
    if (views < 3) {
      localStorage.setItem('mano_ad_views', String(views + 1));
      return;
    }
    
    // Check minimum interval (60 seconds)
    const lastAd = parseInt(localStorage.getItem('mano_last_ad_time') || '0');
    if (Date.now() - lastAd < 60000) {
      return;
    }
    
    setShowAd(true);
  }, [user]);
  
  const closeAd = () => {
    setShowAd(false);
    sessionStorage.setItem('mano_ad_session_dismissed', 'true');
    localStorage.setItem('mano_last_ad_time', String(Date.now()));
    localStorage.setItem('mano_ad_views', '0');
  };
  
  return { showAd, closeAd };
};

// Firebase Analytics - Defer loading completely
const logAnalyticsEvent = (...args) => {
  import('@/services/firebase').then(m => m.logAnalyticsEvent(...args));
};
const AnalyticsEvents = {};

// ALL pages lazy loaded for better initial bundle
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));

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
const SafeZones = lazy(() => import('@/pages/SafeZones'));
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
const DeleteAccountRequest = lazy(() => import('@/pages/DeleteAccountRequest'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const HealthProfile = lazy(() => import('@/pages/HealthProfile'));
const AdminAudios = lazy(() => import('@/pages/AdminAudios'));
const AdminDevices = lazy(() => import('@/pages/AdminDevices'));
const SOSAlertReceived = lazy(() => import('@/pages/SOSAlertReceived'));
const SOSQuickButton = lazy(() => import('@/pages/SOSQuickButton'));
const InstruccionesFamiliares = lazy(() => import('@/pages/InstruccionesFamiliares'));
const CompartirUbicacion = lazy(() => import('@/pages/CompartirUbicacion'));
const SobreNosotros = lazy(() => import('@/pages/SobreNosotros'));
const ShieldPage = lazy(() => import('@/pages/ShieldPage'));
const EnterpriseLanding = lazy(() => import('@/pages/EnterpriseLanding'));
const JoinFamilyPage = lazy(() => import('@/pages/JoinFamilyPage'));
const VoiceShield = lazy(() => import('@/pages/VoiceShield'));
const SmartLocator = lazy(() => import('@/pages/SmartLocator'));
const DeepfakeShield = lazy(() => import('@/pages/DeepfakeShield'));
const InvestorCRM = lazy(() => import('@/pages/InvestorCRM'));
const VideosDemo = lazy(() => import('@/pages/VideosDemo'));
const DigitalLegacyVault = lazy(() => import('@/pages/DigitalLegacyVault'));
const PhishingSimulation = lazy(() => import('@/pages/PhishingSimulation'));
const EmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
const BlockchainVerifier = lazy(() => import('@/pages/BlockchainVerifier'));
const SOSDeviceOrder = lazy(() => import('@/pages/SOSDeviceOrder'));
const OrderTracking = lazy(() => import('@/pages/OrderTracking'));

// Lazy load non-critical UI components to reduce main thread blocking
const CookieConsent = lazy(() => import('@/components/CookieConsent'));
const AIChatWidget = lazy(() => import('@/components/AIChatWidget'));
const UrgencyBanner = lazy(() => import('@/components/UrgencyBanner'));

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

// SOS Alert Listener - Listens for Service Worker messages
const SOSAlertListener = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        if (event.data?.type === 'SOS_ALERT' || event.data?.type === 'NAVIGATE') {
          const url = event.data.url;
          if (url && event.data.isSOSAlert !== false) {
            // Navigate to the SOS alert page
            navigate(url);
          }
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [navigate]);
  
  return null;
};

// Interstitial Ad Manager - Shows promotional ads for free users
const InterstitialAdManager = () => {
  const { user } = useAuth();
  const { showAd, closeAd } = useInterstitialAd(user);
  
  if (!showAd) return null;
  
  return (
    <Suspense fallback={null}>
      <InterstitialAd user={user} onClose={closeAd} />
    </Suspense>
  );
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
      <SOSAlertListener />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/plans" element={<Pricing />} />
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
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/about" element={<SobreNosotros />} />
          <Route path="/empleados/descargar" element={<DescargarDesktop />} />
          <Route path="/empleados/portal" element={<PortalEmpleados />} />
          <Route path="/desarrolladores/descargas" element={<DescargarApps />} />
          
          {/* ManoProtect Promo Landing */}
          <Route path="/promo" element={<LandingPromo />} />
          <Route path="/manoprotect" element={<LandingPromo />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/verificar-estafa" element={<VerificarEstafa />} />
          
          {/* Family Invitation - Public route */}
          <Route path="/unirse/:memberId" element={<JoinFamilyPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro" element={<ManoProtectRegistro />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/solicitar-eliminacion" element={<DeleteAccountRequest />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/health-profile" element={<HealthProfile />} />
          <Route path="/admin/audios" element={<AdminAudios />} />
          <Route path="/admin/devices" element={<AdminDevices />} />
          
          {/* Shield Security Hub - Public */}
          <Route path="/shield" element={<ShieldPage />} />
          <Route path="/seguridad" element={<ShieldPage />} />
          
          {/* AI Voice Shield - Phone Scam Detection */}
          <Route path="/voice-shield" element={<VoiceShield />} />
          <Route path="/escudo-voz" element={<VoiceShield />} />
          
          {/* Smart Family Locator */}
          <Route path="/smart-locator" element={<SmartLocator />} />
          <Route path="/localizador" element={<SmartLocator />} />
          
          {/* SOS Device Order (Physical Keychain) */}
          <Route path="/sos-device" element={<SOSDeviceOrder />} />
          <Route path="/dispositivo-sos" element={<SOSDeviceOrder />} />
          <Route path="/boton-sos" element={<SOSDeviceOrder />} />
          
          {/* Anti-Deepfake Shield */}
          <Route path="/deepfake-shield" element={<DeepfakeShield />} />
          <Route path="/anti-deepfake" element={<DeepfakeShield />} />
          
          {/* Investor CRM (Admin only) */}
          <Route path="/investor-crm" element={<InvestorCRM />} />
          <Route path="/crm-inversores" element={<InvestorCRM />} />
          
          {/* Videos Demo IA (Sora 2) */}
          <Route path="/videos-demo" element={<VideosDemo />} />
          <Route path="/demo-videos" element={<VideosDemo />} />
          
          {/* Digital Legacy Vault */}
          <Route path="/legacy-vault" element={<DigitalLegacyVault />} />
          <Route path="/boveda-digital" element={<DigitalLegacyVault />} />
          
          {/* Phishing Simulation (B2B) */}
          <Route path="/phishing-simulation" element={<PhishingSimulation />} />
          <Route path="/simulacion-phishing" element={<PhishingSimulation />} />
          
          {/* Employee Dashboard - Control Panel */}
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/panel-empleados" element={<EmployeeDashboard />} />
          
          {/* Blockchain Transaction Verifier */}
          <Route path="/blockchain-verifier" element={<BlockchainVerifier />} />
          <Route path="/verificador-blockchain" element={<BlockchainVerifier />} />
          
          {/* Order Tracking - Seguimiento de Pedidos */}
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/seguimiento-pedido" element={<OrderTracking />} />
          <Route path="/tracking" element={<OrderTracking />} />
          
          {/* Enterprise B2B Landing */}
          <Route path="/enterprise" element={<EnterpriseLanding />} />
          <Route path="/empresas" element={<EnterpriseLanding />} />
          <Route path="/b2b" element={<EnterpriseLanding />} />
          
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
          path="/safe-zones" 
          element={
            <ProtectedRoute>
              <SafeZones />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/zonas-seguras" 
          element={
            <ProtectedRoute>
              <SafeZones />
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
          path="/sos-alert" 
          element={
            <ProtectedRoute>
              <SOSAlertReceived />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sos-quick" 
          element={<SOSQuickButton />} 
        />
        <Route 
          path="/instrucciones-familiares" 
          element={<InstruccionesFamiliares />} 
        />
        <Route 
          path="/compartir-ubicacion" 
          element={<CompartirUbicacion />} 
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
          <Suspense fallback={<EmptyFallback />}>
            <UrgencyBanner 
              message="🎁 OFERTA ESPECIAL: 7 días GRATIS en ManoProtect"
              link="/registro"
            />
          </Suspense>
          <Toaster position="top-center" richColors />
          <Suspense fallback={<EmptyFallback />}>
            <PushNotificationPrompt />
          </Suspense>
          <Suspense fallback={<EmptyFallback />}>
            <InterstitialAdManager />
          </Suspense>
          <AppRouter />
          {/* Defer non-critical UI components */}
          <Suspense fallback={<EmptyFallback />}>
            <AIChatWidget />
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
