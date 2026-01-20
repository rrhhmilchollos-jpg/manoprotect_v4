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

  // Register with email/password
  const register = async (email, name, password) => {
    setError(null);
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, name, password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Error de conexión con el servidor');
      }
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error al registrar');
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

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
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Login with Google (redirect to Emergent Auth)
  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Process Google OAuth session
  const processGoogleSession = async (sessionId) => {
    setError(null);
    try {
      const response = await fetch(`${API}/auth/google/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error en autenticación Google');
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
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
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
    isPremium: user?.role === 'premium' || user?.role === 'superadmin' || (user?.plan && user?.plan !== 'free'),
    isInvestor: user?.role === 'investor' || user?.role === 'superadmin',
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
