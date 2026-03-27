/**
 * ManoProtect - Employee Password Recovery Page
 * Supports both Email and SMS recovery methods for employees
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Mail, Phone, ArrowLeft, KeyRound, Shield, CheckCircle, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const EmpleadoRecuperarPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  // State management
  const [step, setStep] = useState(tokenFromUrl ? 'reset' : 'method');
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [resetToken, setResetToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Request recovery via email
  const handleEmailRecovery = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Introduce tu email corporativo');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/recovery/employee/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Revisa tu bandeja de entrada');
        setStep('email-sent');
      } else {
        toast.error(data.detail || 'Error al enviar email');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  // Request recovery via SMS
  const handleSmsRecovery = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Introduce tu teléfono');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/recovery/employee/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Código enviado a ${data.phone_masked}`);
        setStep('verify');
      } else {
        toast.error(data.detail || 'Error al enviar SMS');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify SMS code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!smsCode || smsCode.length !== 6) {
      toast.error('Introduce el código de 6 dígitos');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/recovery/employee/verify-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: smsCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Código verificado');
        setResetToken(data.reset_token);
        setStep('reset');
      } else {
        toast.error(data.detail || 'Código incorrecto');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/recovery/employee/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Contraseña actualizada correctamente');
        setStep('success');
      } else {
        toast.error(data.detail || 'Error al actualizar contraseña');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Helmet>
        <title>Recuperar Contraseña - Portal Empleados ManoProtect</title>
      </Helmet>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Portal de Empleados</h1>
          <p className="text-slate-400 mt-1">Recuperar Contraseña</p>
        </div>
        
        {/* Card */}
        <Card className="bg-slate-800/80 border-slate-700 shadow-2xl">
          <CardContent className="pt-6">
          
          {/* Step: Choose Method */}
          {step === 'method' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">
                  ¿Cómo quieres recuperar tu cuenta?
                </h2>
                <p className="text-slate-400 text-sm">
                  Elige el método que prefieras
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => { setMethod('email'); setStep('email'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-slate-600 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-600/30">
                    <Mail className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Email Corporativo</p>
                    <p className="text-sm text-slate-400">Recibirás un enlace para restablecer</p>
                  </div>
                </button>
                
                <button
                  onClick={() => { setMethod('sms'); setStep('sms'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-slate-600 rounded-xl hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:bg-blue-600/30">
                    <Phone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">SMS</p>
                    <p className="text-sm text-slate-400">Recibirás un código al móvil</p>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => navigate('/empleados/login')}
                className="w-full mt-6 text-center text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Volver al inicio de sesión
              </button>
            </div>
          )}
          
          {/* Step: Email Form */}
          {step === 'email' && (
            <form onSubmit={handleEmailRecovery} className="space-y-6">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="flex items-center text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Cambiar método
              </button>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Recuperar por Email
                </h2>
                <p className="text-slate-400 text-sm">
                  Introduce tu email corporativo
                </p>
              </div>
              
              <Input
                type="email"
                placeholder="tu@manoprotectt.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                required
              />
              
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enviar enlace de recuperación
              </Button>
            </form>
          )}
          
          {/* Step: Email Sent */}
          {step === 'email-sent' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Revisa tu email
              </h2>
              <p className="text-slate-400 text-sm">
                Hemos enviado un enlace de recuperación a <strong className="text-white">{email}</strong>
              </p>
              <p className="text-slate-500 text-xs">
                El enlace expirará en 1 hora. Revisa también la carpeta de spam.
              </p>
              <Button onClick={() => navigate('/empleados/login')} variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                Volver al inicio de sesión
              </Button>
            </div>
          )}
          
          {/* Step: SMS Form */}
          {step === 'sms' && (
            <form onSubmit={handleSmsRecovery} className="space-y-6">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="flex items-center text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Cambiar método
              </button>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Recuperar por SMS
                </h2>
                <p className="text-slate-400 text-sm">
                  Introduce el teléfono registrado en tu perfil
                </p>
              </div>
              
              <Input
                type="tel"
                placeholder="+34 612 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                required
              />
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enviar código SMS
              </Button>
            </form>
          )}
          
          {/* Step: Verify SMS Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <button
                type="button"
                onClick={() => setStep('sms')}
                className="flex items-center text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
              </button>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Introduce el código
                </h2>
                <p className="text-slate-400 text-sm">
                  Hemos enviado un código de 6 dígitos a tu móvil
                </p>
              </div>
              
              <Input
                type="text"
                placeholder="123456"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                maxLength={6}
                required
              />
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verificar código
              </Button>
              
              <p className="text-center text-sm text-slate-500">
                El código expira en 10 minutos
              </p>
            </form>
          )}
          
          {/* Step: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Nueva contraseña
                </h2>
                <p className="text-slate-400 text-sm">
                  Introduce tu nueva contraseña
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  minLength={8}
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  minLength={8}
                  required
                />
              </div>
              
              <p className="text-xs text-slate-500">
                Mínimo 8 caracteres
              </p>
              
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Actualizar contraseña
              </Button>
            </form>
          )}
          
          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-slate-400 text-sm">
                Ya puedes iniciar sesión con tu nueva contraseña
              </p>
              <Button onClick={() => navigate('/empleados/login')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Ir al inicio de sesión
              </Button>
            </div>
          )}
          
          </CardContent>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Necesitas ayuda? Contacta con IT: +34 601 510 950
        </p>
      </div>
    </div>
  );
};

export default EmpleadoRecuperarPassword;
