import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Landmark, Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RecuperarPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState(token ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Error al procesar la solicitud');
      
      setStep('sent');
      toast.success('Si el email existe, recibirás instrucciones');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.detail?.feedback) {
          data.detail.feedback.forEach(fb => toast.error(fb));
          return;
        }
        throw new Error(data.detail || 'Error al cambiar la contraseña');
      }
      
      setSuccess(true);
      toast.success('Contraseña actualizada correctamente');
      
      setTimeout(() => navigate('/login-seguro'), 3000);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Landmark className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">ManoBank</span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Request Reset Form */}
          {step === 'request' && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contraseña</h1>
                <p className="text-gray-600">
                  Introduce tu email y te enviaremos instrucciones para recuperar tu acceso
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de tu cuenta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/login-seguro')}
                  className="text-blue-600 hover:underline text-sm flex items-center gap-2 justify-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </button>
              </div>
            </>
          )}

          {/* Email Sent Confirmation */}
          {step === 'sent' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email enviado</h1>
              <p className="text-gray-600 mb-6">
                Si existe una cuenta con el email <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Revisa tu bandeja de entrada y spam. El enlace expira en 1 hora.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left text-sm">
                    <p className="text-amber-800 font-medium">¿No puedes acceder a tu email?</p>
                    <p className="text-amber-700 mt-1">
                      Si has cambiado de teléfono y no puedes recibir el código 2FA, deberás acudir a una sucursal de ManoBank con tu DNI para verificar tu identidad.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => navigate('/login-seguro')}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          )}

          {/* Reset Password Form */}
          {step === 'reset' && !success && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Nueva contraseña</h1>
                <p className="text-gray-600">
                  Introduce tu nueva contraseña segura
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                </Button>
              </form>
            </>
          )}

          {/* Success */}
          {success && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h1>
              <p className="text-gray-600 mb-6">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo al login...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-8">
          © 2026 ManoBank S.A. · CIF: B19427723
        </p>
      </div>
    </div>
  );
};

export default RecuperarPassword;
