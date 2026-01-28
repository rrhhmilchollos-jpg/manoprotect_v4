import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Building2, Lock, CreditCard, Phone, Mail, User,
  ArrowRight, ArrowLeft, CheckCircle, AlertTriangle,
  Shield, Key, Smartphone, HelpCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const RecuperarPasswordManoBank = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryId, setRecoveryId] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [cardMasked, setCardMasked] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    identifier: '', // DNI or email
    lastFour: '',
    expiryMonth: '',
    expiryYear: '',
    smsCode: ''
  });

  // Step 1: Start recovery process
  const handleStartRecovery = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/manobank/recuperar-password/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.identifier })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar recuperación');
      }

      setRecoveryId(data.recovery_id);
      setVerificationMethod(data.verification_method);
      
      if (data.verification_method === 'card') {
        setCardMasked(data.card_masked);
        toast.info(`Verifica tu identidad con tu tarjeta ${data.card_type}`);
      } else {
        setPhoneMasked(data.phone_masked);
        toast.info('Se ha enviado un código a tu teléfono');
      }
      
      setStep(2);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify identity
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = verificationMethod === 'card' 
        ? `${API_URL}/api/manobank/recuperar-password/verificar-tarjeta`
        : `${API_URL}/api/manobank/recuperar-password/verificar-sms`;
      
      const body = verificationMethod === 'card'
        ? {
            recovery_id: recoveryId,
            last_four: formData.lastFour,
            expiry_month: formData.expiryMonth,
            expiry_year: formData.expiryYear
          }
        : {
            recovery_id: recoveryId,
            code: formData.smsCode
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error en la verificación');
      }

      if (data.temp_password) {
        setNewPassword(data.temp_password);
      }
      
      toast.success(data.message);
      setStep(3);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
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
              <p className="text-xs text-blue-300">Recuperar Acceso</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="tel:601510950" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
              <Phone className="w-4 h-4" />
              <span className="hidden md:inline">601 510 950</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/50'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 rounded ${step > s ? 'bg-blue-600' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Step 1: Enter identifier */}
            {step === 1 && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex items-center gap-3">
                    <Key className="w-8 h-8" />
                    <div>
                      <h2 className="text-xl font-bold">Recuperar contraseña</h2>
                      <p className="text-blue-100 text-sm">Paso 1 de 3</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleStartRecovery} className="p-6 space-y-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Introduce tu DNI/NIE o email para verificar tu identidad de forma segura.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI/NIE o Email
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="12345678Z o tu@email.com"
                        data-testid="recovery-identifier"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Verificando...' : 'Continuar'}
                    {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                  
                  <p className="text-center text-sm text-gray-500">
                    ¿Ya tienes tus credenciales?{' '}
                    <a href="/login-seguro" className="text-blue-600 hover:underline">
                      Iniciar sesión
                    </a>
                  </p>
                </form>
              </>
            )}

            {/* Step 2: Verify identity */}
            {step === 2 && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex items-center gap-3">
                    {verificationMethod === 'card' ? (
                      <CreditCard className="w-8 h-8" />
                    ) : (
                      <Smartphone className="w-8 h-8" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold">Verificar identidad</h2>
                      <p className="text-blue-100 text-sm">Paso 2 de 3</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleVerify} className="p-6 space-y-5">
                  {verificationMethod === 'card' ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium">Verificación con tarjeta</p>
                            <p className="mt-1">Por seguridad, introduce los datos de tu tarjeta:</p>
                            <p className="mt-1 font-mono text-lg">{cardMasked}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Últimos 4 dígitos de la tarjeta
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            maxLength={4}
                            value={formData.lastFour}
                            onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
                            required
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest"
                            placeholder="0000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mes caducidad</label>
                          <input
                            type="text"
                            maxLength={2}
                            value={formData.expiryMonth}
                            onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                            placeholder="MM"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Año caducidad</label>
                          <input
                            type="text"
                            maxLength={2}
                            value={formData.expiryYear}
                            onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                            placeholder="YY"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium">Código enviado</p>
                            <p className="mt-1">Hemos enviado un código de verificación al teléfono {phoneMasked}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código de verificación
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.smsCode}
                          onChange={(e) => setFormData({ ...formData, smsCode: e.target.value.replace(/\D/g, '') })}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                          placeholder="000000"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Verificando...' : 'Verificar'}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Listo!</h2>
                <p className="text-gray-600 mb-6">
                  Tu nueva contraseña temporal ha sido enviada por SMS.
                </p>
                
                {newPassword && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800 mb-2">Tu nueva contraseña temporal:</p>
                    <p className="text-2xl font-mono font-bold text-blue-600">{newPassword}</p>
                    <p className="text-xs text-blue-600 mt-2">Válida durante 24 horas</p>
                  </div>
                )}
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    <strong>Importante:</strong> Deberás cambiar esta contraseña temporal en tu primer inicio de sesión.
                  </p>
                </div>
                
                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/login-seguro')}
                >
                  Ir a iniciar sesión
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="mt-6 text-center">
            <a 
              href="tel:601510950"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              ¿Necesitas ayuda? Llámanos al 601 510 950
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecuperarPasswordManoBank;
