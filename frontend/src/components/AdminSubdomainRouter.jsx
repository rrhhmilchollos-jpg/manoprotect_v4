/**
 * AdminSubdomainRouter - Router for admin.manoprotectt.com
 * This component handles all routing when accessed via the admin subdomain
 * Only shows enterprise portal routes, no consumer app routes
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load enterprise portal pages
const EnterprisePortal = lazy(() => import('@/pages/EnterprisePortal'));
const EnterpriseLogin = lazy(() => import('@/pages/EnterpriseLogin'));

// Loading fallback
const PortalLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      <p className="text-slate-400 text-sm">Cargando Portal de Empleados...</p>
    </div>
  </div>
);

const AdminSubdomainRouter = () => {
  return (
    <Suspense fallback={<PortalLoader />}>
      <Routes>
        {/* Main portal dashboard */}
        <Route path="/" element={<EnterpriseLogin />} />
        <Route path="/login" element={<EnterpriseLogin />} />
        <Route path="/portal" element={<EnterprisePortal />} />
        <Route path="/dashboard" element={<EnterprisePortal />} />
        
        {/* Legacy routes - redirect to main portal */}
        <Route path="/enterprise" element={<Navigate to="/portal" replace />} />
        <Route path="/enterprise/login" element={<Navigate to="/login" replace />} />
        <Route path="/enterprise/portal" element={<Navigate to="/portal" replace />} />
        
        {/* Catch-all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AdminSubdomainRouter;
