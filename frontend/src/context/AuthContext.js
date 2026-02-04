import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('mano_user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Try localStorage backup
        const storedUser = localStorage.getItem('mano_user');
        if (storedUser) {
          // Verify the stored session is still valid
          const verifyResponse = await fetch(`${API}/auth/me`, {
            credentials: 'include'
          });
          if (verifyResponse.ok) {
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('mano_user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // On network error, try localStorage
      const storedUser = localStorage.getItem('mano_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register with email/password - with automatic retry on network failure
  const register = async (email, name, password, retryCount = 0) => {
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, name, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Error de conexión con el servidor');
      }
      
      if (!response.ok) {
        // Handle different error formats from backend
        let errorMessage = 'Error al registrar';
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail.message) {
            // Password validation errors with feedback
            if (data.detail.feedback && Array.isArray(data.detail.feedback)) {
              errorMessage = `${data.detail.message}: ${data.detail.feedback.join(', ')}`;
            } else {
              errorMessage = data.detail.message;
            }
          } else if (Array.isArray(data.detail)) {
            // Pydantic validation errors
            errorMessage = data.detail.map(e => e.msg || e.message).join('. ');
          }
        }
        throw new Error(errorMessage);
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      // Retry once on network failure
      if (retryCount < 1 && (err.name === 'AbortError' || err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
        console.log('Register retry attempt...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return register(email, name, password, retryCount + 1);
      }
      
      setError(err.message);
      return { success: false, error: err.message === 'Failed to fetch' ? 'Error de conexión. Por favor, inténtalo de nuevo.' : err.message };
    }
  };

  // Login with email/password - with automatic retry on network failure
  const login = async (email, password, retryCount = 0) => {
    setError(null);
    if (retryCount === 0) setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Error de conexión con el servidor');
      }
      
      if (!response.ok) {
        throw new Error(data.detail || 'Credenciales inválidas');
      }

      // Store user data in localStorage as backup
      localStorage.setItem('mano_user', JSON.stringify(data));
      setUser(data);
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      // Retry once on network failure (failed to fetch, timeout, etc.)
      if (retryCount < 1 && (err.name === 'AbortError' || err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
        console.log('Login retry attempt...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        return login(email, password, retryCount + 1);
      }
      
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message === 'Failed to fetch' ? 'Error de conexión. Por favor, inténtalo de nuevo.' : err.message };
    }
  };

  // Login with Google
  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Process Google OAuth session - with automatic retry
  const processGoogleSession = async (sessionId, retryCount = 0) => {
    setError(null);
    if (retryCount === 0) setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API}/auth/google/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error en autenticación Google');
      }

      localStorage.setItem('mano_user', JSON.stringify(data));
      setUser(data);
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      // Retry once on network failure
      if (retryCount < 1 && (err.name === 'AbortError' || err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
        console.log('Google session retry attempt...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return processGoogleSession(sessionId, retryCount + 1);
      }
      
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message === 'Failed to fetch' ? 'Error de conexión. Por favor, inténtalo de nuevo.' : err.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('mano_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'superadmin' || user?.role === 'director' || user?.role === 'admin',
    isSuperAdmin: user?.role === 'superadmin' || user?.role === 'director',
    isDirector: user?.role === 'director',
    isPremium: user?.role === 'premium' || user?.role === 'superadmin' || user?.role === 'director' || (user?.plan && user?.plan !== 'free'),
    isInvestor: user?.role === 'investor' || user?.role === 'superadmin' || user?.role === 'director',
    register,
    login,
    loginWithGoogle,
    processGoogleSession,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
