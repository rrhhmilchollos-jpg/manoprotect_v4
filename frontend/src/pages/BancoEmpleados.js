import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Landmark,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ArrowRight
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BancoEmpleados = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, normal login
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // Parse login response only once
      let loginData;
      try {
        loginData = await loginResponse.json();
      } catch (parseError) {
        throw new Error('Error al procesar la respuesta del servidor');
      }
      
      if (!loginResponse.ok) {
        throw new Error(loginData.detail || 'Credenciales incorrectas');
      }
      
      // Check if user is bank employee
      const dashboardResponse = await fetch(`${API_URL}/api/manobank/admin/dashboard`, {
        credentials: 'include'
      });
      
      // Parse dashboard response safely
      let dashboardData;
      try {
        dashboardData = await dashboardResponse.json();
      } catch (parseError) {
        throw new Error('Error al verificar permisos de empleado');
      }
      
      if (!dashboardResponse.ok) {
        throw new Error(dashboardData.detail || 'No tienes acceso al sistema bancario. Contacta con tu supervisor.');
      }
      
      // Update auth context to recognize the logged-in user
      await checkAuth();
      
      toast.success(`Bienvenido al Sistema ManoBank, ${loginData.name || 'Usuario'}`);
      navigate('/banco/sistema');
      
    } catch (error) {
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-800 to-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ManoBank</h1>
              <p className="text-zinc-400">Sistema Interno</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Portal de<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Empleados
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-md">
            Acceso exclusivo para personal autorizado de ManoBank. 
            Sistema de gestión bancaria integral.
          </p>
          
          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span>Conexión segura</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Lock className="w-5 h-5 text-emerald-500" />
              <span>Cifrado AES-256</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-zinc-500 text-sm">
          © 2026 ManoBank. Sistema interno - Uso exclusivo empleados.
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-4 mb-12 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ManoBank</h1>
              <p className="text-zinc-500 text-sm">Sistema Interno</p>
            </div>
          </div>
          
          <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-8 border border-zinc-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Acceso Empleados</h2>
              <p className="text-zinc-400">Introduce tus credenciales corporativas</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email corporativo
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="empleado@manobank.es"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-zinc-400">
                  <input type="checkbox" className="rounded bg-zinc-700 border-zinc-600" />
                  Recordar sesión
                </label>
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-14 text-lg font-semibold rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Acceder al Sistema
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-zinc-700">
              <p className="text-center text-zinc-500 text-sm">
                ¿Problemas de acceso? Contacta con{' '}
                <a href="mailto:soporte@manobank.es" className="text-indigo-400 hover:underline">
                  soporte@manobank.es
                </a>
              </p>
            </div>
          </div>
          
          <p className="text-center text-zinc-600 text-xs mt-6">
            Acceso no autorizado está prohibido y será perseguido legalmente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BancoEmpleados;
