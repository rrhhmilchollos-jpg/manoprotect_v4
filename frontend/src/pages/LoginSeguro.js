import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Building2, Shield, Lock, Eye, EyeOff, User, Mail, 
  CheckCircle, AlertTriangle, Fingerprint, Smartphone,
  ArrowRight, HelpCircle, Phone, ChevronRight, Key
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LoginSeguro = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: credentials, 2: verification
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Credenciales incorrectas');
      }

      const data = await response.json();
      login(data);
      toast.success('Acceso correcto');
      navigate('/manobank');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (!registerData.acceptTerms) {
      toast.error('Debe aceptar los términos y condiciones');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        // Handle password validation errors
        if (error.detail?.feedback) {
          toast.error(error.detail.message);
          error.detail.feedback.forEach(fb => toast.error(fb));
          return;
        }
        throw new Error(error.detail || 'Error en el registro');
      }

      toast.success('Cuenta creada correctamente. Ya puede iniciar sesión.');
      setIsLogin(true);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  
  const checkPasswordStrength = async (password) => {
    if (password.length < 3) {
      setPasswordStrength({ score: 0, feedback: [] });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/validate-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      setPasswordStrength(data);
    } catch (e) {
      console.log('Password validation error');
    }
  };

  const getStrengthColor = (score) => {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score) => {
    if (score < 40) return 'Débil';
    if (score < 70) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ManoBank</h1>
              <p className="text-xs text-blue-300">Banca Digital Segura</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="tel:601510950" className="hidden md:flex items-center gap-2 text-white/70 hover:text-white text-sm">
              <Phone className="w-4 h-4" />
              601 510 950
            </a>
            <a href="/ayuda" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">Ayuda</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Security Info */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold text-white mb-6">
              Tu banco, siempre seguro
            </h2>
            <p className="text-lg text-blue-200 mb-8">
              Accede a tu cuenta con la máxima seguridad. Tus datos están protegidos con encriptación de nivel bancario.
            </p>
            
            {/* Security Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Conexión segura SSL</h3>
                  <p className="text-sm text-blue-200/70">Todos tus datos viajan encriptados</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Fingerprint className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Autenticación segura</h3>
                  <p className="text-sm text-blue-200/70">Verificación en dos pasos disponible</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Protección antifraude</h3>
                  <p className="text-sm text-blue-200/70">Monitorización 24/7 de tus operaciones</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-xs text-blue-300/60 mb-4">ENTIDAD REGULADA</p>
              <div className="flex items-center gap-6 text-white/50 text-xs">
                <span>Banco de España</span>
                <span>•</span>
                <span>CIF: B19427723</span>
                <span>•</span>
                <span>Garantía 100.000€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-6 text-green-400 text-sm">
              <Lock className="w-4 h-4" />
              <span>Conexión segura verificada</span>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    isLogin 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    !isLogin 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Hazte Cliente
                </button>
              </div>

              <div className="p-6">
                {isLogin ? (
                  /* Login Form */
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuario / Email
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="tu@email.com"
                          data-testid="login-email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="••••••••"
                          data-testid="login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rememberDevice}
                          onChange={(e) => setFormData({...formData, rememberDevice: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Recordar dispositivo</span>
                      </label>
                      <a href="/recuperar-password" className="text-sm text-blue-600 hover:underline">
                        ¿Olvidaste tu clave?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                      data-testid="login-submit"
                    >
                      {isLoading ? 'Verificando...' : 'Acceder a mi cuenta'}
                      {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>

                    {/* Security Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium">Consejos de seguridad:</p>
                        <ul className="mt-1 space-y-1 text-amber-700">
                          <li>• Nunca compartas tu contraseña</li>
                          <li>• ManoBank nunca te pedirá claves por email o SMS</li>
                        </ul>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Register Form */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono móvil
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="+34 600 000 000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            required
                            minLength={8}
                            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Mín. 8 caracteres"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                            required
                            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Repetir"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={registerData.acceptTerms}
                        onChange={(e) => setRegisterData({...registerData, acceptTerms: e.target.checked})}
                        className="w-4 h-4 mt-1 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600">
                        Acepto los <a href="/terminos" className="text-blue-600 underline">Términos y Condiciones</a> y 
                        la <a href="/privacidad" className="text-blue-600 underline">Política de Privacidad</a> de ManoBank S.A.
                      </span>
                    </label>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
                    >
                      {isLoading ? 'Creando cuenta...' : 'Crear mi cuenta'}
                      {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                      ¿Ya tienes cuenta?{' '}
                      <button 
                        type="button"
                        onClick={() => setIsLogin(true)} 
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Inicia sesión
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom Links */}
            <div className="mt-6 text-center">
              <a 
                href="/abrir-cuenta" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm"
              >
                ¿Nuevo cliente? Abre tu cuenta online
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Sitio web seguro - Certificado SSL</span>
          </div>
          <div>
            ManoBank S.A. | CIF: B19427723 | Inscrito en el Banco de España
          </div>
          <div className="flex gap-4">
            <a href="/privacidad" className="hover:text-white">Privacidad</a>
            <a href="/cookies" className="hover:text-white">Cookies</a>
            <a href="/seguridad" className="hover:text-white">Seguridad</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginSeguro;
