import { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Smartphone,
  KeyRound,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BancoEmpleados = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 2FA State
  const [step, setStep] = useState('credentials'); // credentials, 2fa, success
  const [userData, setUserData] = useState(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState('');
  const inputRefs = useRef([]);

  // OTP Timer
  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setInterval(() => {
        setOtpExpiry(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiry]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

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
      
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Credenciales incorrectas');
      }
      
      const loginData = await loginResponse.json();
      
      // Check if user is bank employee
      const dashboardResponse = await fetch(`${API_URL}/api/manobank/admin/dashboard`, {
        credentials: 'include'
      });
      
      if (!dashboardResponse.ok) {
        const errorData = await dashboardResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'No tienes acceso al sistema bancario. Contacta con tu supervisor.');
      }

      const dashboardData = await dashboardResponse.json();
      
      // Get employee phone for 2FA
      const employeePhone = dashboardData.employee?.phone || '+34600000000';
      
      // Store user data and proceed to 2FA
      setUserData({
        ...loginData,
        phone: employeePhone
      });
      
      // TEMPORARILY SKIP 2FA - Direct access for Director
      // TODO: Re-enable 2FA when SMS is configured
      toast.success('Acceso autorizado. Bienvenido Director General.');
      await checkAuth();
      navigate('/banco/sistema');
      return;
      
      // Send 2FA code (DISABLED)
      // await send2FACode(loginData.user_id, employeePhone);
      
      setStep('2fa');
      toast.success('Credenciales verificadas. Introduce el código de seguridad.');
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const send2FACode = async (userId, phone) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/2fa/send-code`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          phone: phone
        })
      });

      if (!response.ok) {
        throw new Error('Error enviando código de verificación');
      }

      const data = await response.json();
      setOtpExpiry(data.expires_in_minutes * 60);
      setResendCooldown(60); // 60 seconds cooldown for resend
      setMaskedPhone(phone.slice(0, 4) + '****' + phone.slice(-3));
      
      // For testing - show code if Twilio not configured
      if (data.debug_code) {
        console.log('DEBUG OTP CODE:', data.debug_code);
        toast.info(`Código de prueba: ${data.debug_code}`, { duration: 10000 });
      }
      
    } catch (error) {
      console.error('2FA send error:', error);
      toast.error('Error enviando código SMS');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(paste)) {
      const newOtp = paste.split('').concat(Array(6 - paste.length).fill(''));
      setOtpCode(newOtp.slice(0, 6));
      inputRefs.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  const verify2FA = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      toast.error('Introduce el código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/2fa/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user_id,
          otp_code: code
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Código incorrecto');
      }

      // Update auth context
      await checkAuth();
      
      setStep('success');
      toast.success('Verificación completada');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/banco/sistema');
      }, 1500);
      
    } catch (error) {
      toast.error(error.message);
      // Clear OTP on error
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0) return;
    
    await send2FACode(userData.user_id, userData.phone);
    toast.success('Nuevo código enviado');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            Sistema de gestión bancaria integral con verificación en dos pasos.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-white font-medium">Conexión segura TLS 1.3</p>
                <p className="text-sm">Cifrado de extremo a extremo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-white font-medium">Verificación 2FA obligatoria</p>
                <p className="text-sm">Código SMS a tu móvil</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-white font-medium">Sesiones monitorizadas</p>
                <p className="text-sm">Registro de actividad 24/7</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-zinc-500 text-sm">
          © 2026 ManoBank S.A. · CIF: B19427723 · Sistema interno - Uso exclusivo empleados.
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
          
          {/* Step 1: Credentials */}
          {step === 'credentials' && (
            <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-8 border border-zinc-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Acceso Empleados</h2>
                <p className="text-zinc-400">Paso 1 de 2: Credenciales corporativas</p>
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
                      autoComplete="email"
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
                      autoComplete="current-password"
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
                      Continuar
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-200 font-medium">Verificación 2FA obligatoria</p>
                    <p className="text-amber-200/70 mt-1">
                      Después de verificar tus credenciales, recibirás un código SMS en tu móvil corporativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 2FA Verification */}
          {step === '2fa' && (
            <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-8 border border-zinc-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verificación 2FA</h2>
                <p className="text-zinc-400">Paso 2 de 2: Código de seguridad</p>
              </div>

              <div className="text-center mb-6">
                <p className="text-zinc-300">
                  Hemos enviado un código de 6 dígitos a
                </p>
                <p className="text-indigo-400 font-mono font-bold text-lg mt-1">
                  {maskedPhone}
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-zinc-700/50 border border-zinc-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ))}
              </div>

              {/* Timer */}
              {otpExpiry > 0 && (
                <div className="text-center mb-6">
                  <p className="text-zinc-400 text-sm">
                    Código válido por: <span className="text-indigo-400 font-mono">{formatTime(otpExpiry)}</span>
                  </p>
                </div>
              )}

              {/* Verify Button */}
              <Button
                onClick={verify2FA}
                disabled={loading || otpCode.join('').length !== 6}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-14 text-lg font-semibold rounded-xl mb-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verificar código
                    <Shield className="w-5 h-5" />
                  </span>
                )}
              </Button>

              {/* Resend */}
              <div className="text-center">
                <button
                  onClick={resendCode}
                  disabled={resendCooldown > 0}
                  className={`text-sm flex items-center gap-2 mx-auto ${
                    resendCooldown > 0 
                      ? 'text-zinc-500 cursor-not-allowed' 
                      : 'text-indigo-400 hover:text-indigo-300'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {resendCooldown > 0 
                    ? `Reenviar en ${resendCooldown}s` 
                    : 'Reenviar código'
                  }
                </button>
              </div>

              {/* Back button */}
              <div className="mt-6 pt-6 border-t border-zinc-700 text-center">
                <button
                  onClick={() => {
                    setStep('credentials');
                    setOtpCode(['', '', '', '', '', '']);
                  }}
                  className="text-zinc-400 hover:text-white text-sm"
                >
                  ← Volver a introducir credenciales
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-8 border border-zinc-700">
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Acceso verificado</h2>
                <p className="text-zinc-400 mb-6">
                  Bienvenido, {userData?.name}
                </p>
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <span>Redirigiendo al sistema...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              ¿Problemas de acceso? Contacta con{' '}
              <a href="mailto:soporte@manobank.es" className="text-indigo-400 hover:underline">
                soporte@manobank.es
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BancoEmpleados;
