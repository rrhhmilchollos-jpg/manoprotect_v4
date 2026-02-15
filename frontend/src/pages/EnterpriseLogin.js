/**
 * ManoProtect Enterprise Portal - Login Page with 2FA Support
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, KeyRound, ArrowLeft, Phone, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const EnterpriseLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  
  // IT Contact Modal state
  const [showITModal, setShowITModal] = useState(false);
  const [phoneMasked, setPhoneMasked] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/enterprise/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires_2fa) {
          // 2FA is required, show the 2FA input
          setRequires2FA(true);
          setEmployeeName(data.name);
          setPhoneMasked(data.phone_masked || '');
          
          if (data.two_factor_method === 'sms') {
            toast.success(`Código enviado por SMS a ${data.phone_masked}`);
          } else {
            toast.info('Introduce el código de tu app autenticadora');
          }
        } else if (data.success) {
          toast.success(`Bienvenido, ${data.name}`);
          navigate('/enterprise');
        }
      } else {
        setError(data.detail || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/enterprise/auth/login-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, totp_code: totpCode })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Bienvenido, ${data.name}`);
        navigate('/enterprise');
      } else {
        setError(data.detail || 'Código inválido');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    setRequires2FA(false);
    setTotpCode('');
    setError('');
  };

  // Detect if we're on the admin subdomain for enhanced branding
  const isAdminSubdomain = window.location.hostname.startsWith('admin.');

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isAdminSubdomain 
        ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900' 
        : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900'
    }`}>
      <Helmet>
        <title>{isAdminSubdomain ? 'Portal Empleados - ManoProtect Admin' : 'Login - Portal Enterprise - ManoProtect'}</title>
      </Helmet>

      <div className="w-full max-w-md">
        {/* Logo with Admin Badge */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isAdminSubdomain ? 'bg-emerald-600' : 'bg-indigo-600'
          }`}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ManoProtect</h1>
          {isAdminSubdomain ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-3 py-1 bg-emerald-600/30 border border-emerald-500/50 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                Portal Empleados
              </span>
            </div>
          ) : (
            <p className="text-indigo-300">Portal Enterprise</p>
          )}
        </div>

        <Card className={`border backdrop-blur ${
          isAdminSubdomain 
            ? 'bg-slate-800/60 border-emerald-800/50' 
            : 'bg-slate-800/50 border-slate-700'
        }`}>
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">
              {requires2FA ? 'Verificación 2FA' : 'Iniciar Sesión'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {requires2FA 
                ? `Hola ${employeeName}, introduce el código SMS enviado a ${phoneMasked || 'tu teléfono'}`
                : 'Acceso exclusivo para empleados autorizados'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requires2FA ? (
              /* 2FA Verification Form */
              <form onSubmit={handle2FASubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-center py-4">
                  <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Código SMS de 6 dígitos</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    required
                    autoFocus
                    className="text-center text-2xl tracking-widest bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    data-testid="enterprise-2fa-input"
                  />
                  <p className="text-xs text-slate-500 text-center">
                    El código expira en 5 minutos. También puedes usar un código de respaldo.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className={`w-full h-12 text-white font-semibold ${
                    isAdminSubdomain 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  data-testid="enterprise-2fa-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar y Acceder'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBackToLogin}
                  className="w-full text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al login
                </Button>
              </form>
            ) : (
              /* Normal Login Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Email corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="tu@manoprotect.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      data-testid="enterprise-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      data-testid="enterprise-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 text-white font-semibold ${
                    isAdminSubdomain 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  data-testid="enterprise-login-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Acceder al Portal'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-slate-500 text-sm">
                ¿Olvidaste tu contraseña?{' '}
                <button 
                  onClick={() => setShowITModal(true)}
                  className={`hover:underline ${isAdminSubdomain ? 'text-emerald-400 hover:text-emerald-300' : 'text-indigo-400 hover:text-indigo-300'}`}
                >
                  Contacta con IT
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2026 ManoProtect - {isAdminSubdomain ? 'admin.manoprotect.com' : 'Manoprotect.com'}. Todos los derechos reservados.
        </p>
      </div>

      {/* IT Contact Modal */}
      {showITModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md ${isAdminSubdomain ? 'bg-slate-800 border-emerald-800/50' : 'bg-slate-800 border-slate-700'}`}>
            <CardHeader className="relative">
              <button
                onClick={() => setShowITModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className={`w-5 h-5 ${isAdminSubdomain ? 'text-emerald-400' : 'text-indigo-400'}`} />
                Soporte IT - ManoProtect
              </CardTitle>
              <CardDescription className="text-slate-400">
                Contacta con nuestro equipo técnico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 ${isAdminSubdomain ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  <div>
                    <p className="text-slate-400 text-xs">Email</p>
                    <a href="mailto:soporte@manoprotect.com" className={`text-white ${isAdminSubdomain ? 'hover:text-emerald-300' : 'hover:text-indigo-300'}`}>
                      soporte@manoprotect.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-slate-400 text-xs">Teléfono</p>
                    <a href="tel:+34900123456" className="text-white hover:text-emerald-300">
                      +34 900 123 456
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-slate-400 text-xs">Horario de atención</p>
                    <p className="text-white">Lunes a Viernes: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-lg p-3 ${isAdminSubdomain ? 'bg-emerald-900/30 border border-emerald-600/30' : 'bg-indigo-900/30 border border-indigo-600/30'}`}>
                <p className={`text-sm ${isAdminSubdomain ? 'text-emerald-200' : 'text-indigo-200'}`}>
                  <strong>¿Problemas con 2FA?</strong><br />
                  Si no tienes acceso a tu app de autenticación, contacta con IT para restablecer tu acceso.
                </p>
              </div>

              <Button
                onClick={() => setShowITModal(false)}
                className={`w-full ${isAdminSubdomain ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnterpriseLogin;
