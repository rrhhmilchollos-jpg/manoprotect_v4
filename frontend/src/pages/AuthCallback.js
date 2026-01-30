import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import NoAdsPage from '@/components/NoAdsPage';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      // Get session_id from URL fragment
      const hash = location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionId = params.get('session_id');

      if (sessionId) {
        const result = await processGoogleSession(sessionId);
        
        if (result.success) {
          // Redirect to dashboard with user data
          navigate('/dashboard', { 
            replace: true,
            state: { user: result.user }
          });
        } else {
          // Redirect to login with error
          navigate('/login', { 
            replace: true,
            state: { error: result.error }
          });
        }
      } else {
        // No session_id, redirect to login
        navigate('/login', { replace: true });
      }
    };

    processAuth();
  }, [location.hash, navigate, processGoogleSession]);

  return (
    <NoAdsPage reason="authentication-callback">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-zinc-100">
            {/* Logo */}
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            
            {/* Loading Animation */}
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Verificando tu cuenta
            </h2>
            <p className="text-zinc-600 mb-6">
              Estamos confirmando tu identidad de forma segura. Serás redirigido automáticamente en unos segundos.
            </p>
            
            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Conexión segura</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Encriptado</span>
              </div>
            </div>
          </div>
          
          {/* Footer info */}
          <p className="text-center text-xs text-zinc-400 mt-6">
            ManoProtect - Protección contra fraudes digitales
            <br />
            Tu seguridad es nuestra prioridad
          </p>
        </div>
      </div>
    </NoAdsPage>
  );
};

export default AuthCallback;
