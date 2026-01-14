/**
 * Auth Context
 * Global authentication state management
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import biometricService from '../services/biometrics';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  plan: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  login: (email: string, password: string, enableBiometric?: boolean) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check biometric availability
      const { available } = await biometricService.isAvailable();
      setBiometricAvailable(available);

      // Check if biometric login is enabled
      const hasCredentials = await biometricService.hasStoredCredentials();
      setBiometricEnabled(hasCredentials);

      // Check for existing session
      const storedUser = await api.getStoredUser();
      if (storedUser) {
        try {
          // Validate session with server
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Session invalid, clear storage
          await AsyncStorage.multiRemove(['session_token', 'user']);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, enableBiometric: boolean = false) => {
    const userData = await api.login(email, password);
    setUser(userData);

    if (enableBiometric && biometricAvailable) {
      const result = await biometricService.enableBiometricLogin(email, password);
      if (result.success) {
        setBiometricEnabled(true);
      }
    }
  };

  const loginWithBiometric = async () => {
    const result = await biometricService.biometricLogin();
    if (result.success && result.credentials) {
      await login(result.credentials.email, result.credentials.password);
    } else {
      throw new Error(result.error || 'Error de autenticación biométrica');
    }
  };

  const register = async (email: string, name: string, password: string) => {
    const userData = await api.register(email, name, password);
    setUser(userData);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const enableBiometricLogin = async (email: string, password: string): Promise<boolean> => {
    const result = await biometricService.enableBiometricLogin(email, password);
    if (result.success) {
      setBiometricEnabled(true);
      return true;
    }
    return false;
  };

  const disableBiometric = async () => {
    await biometricService.clearCredentials();
    setBiometricEnabled(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        biometricAvailable,
        biometricEnabled,
        login,
        loginWithBiometric,
        register,
        logout,
        refreshUser,
        enableBiometric: enableBiometricLogin,
        disableBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
