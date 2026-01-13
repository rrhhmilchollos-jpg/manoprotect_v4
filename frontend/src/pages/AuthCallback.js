import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-lg text-zinc-600">Verificando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
