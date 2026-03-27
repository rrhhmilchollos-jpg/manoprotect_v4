import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Trash2, AlertTriangle, Shield, Mail, Phone, User, 
  CheckCircle, XCircle, ArrowLeft, Send, Lock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DeleteAccountRequest = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    reason: '',
    confirmEmail: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});

  const reasons = [
    { value: 'no_longer_needed', label: 'Ya no necesito el servicio' },
    { value: 'privacy_concerns', label: 'Preocupaciones de privacidad' },
    { value: 'switching_service', label: 'Cambio a otro servicio' },
    { value: 'too_expensive', label: 'El servicio es muy caro' },
    { value: 'not_using', label: 'No estoy usando la aplicación' },
    { value: 'technical_issues', label: 'Problemas técnicos' },
    { value: 'other', label: 'Otro motivo' }
  ];

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.fullName) newErrors.fullName = 'El nombre es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.reason) newErrors.reason = 'Selecciona un motivo';
    if (formData.confirmEmail !== formData.email) {
      newErrors.confirmEmail = 'Los emails no coinciden';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/account/delete-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          full_name: formData.fullName,
          reason: formData.reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast.success('Solicitud enviada correctamente');
      } else {
        throw new Error(data.detail || 'Error al enviar solicitud');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Solicitud Recibida</h1>
            <p className="text-slate-300 mb-6">
              Hemos recibido tu solicitud de eliminación de cuenta. 
              Nuestro equipo la procesará en un plazo de <strong>30 días hábiles</strong>.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              Recibirás un email de confirmación en <strong>{formData.email}</strong> 
              cuando tu cuenta haya sido eliminada.
            </p>
            <a 
              href="/"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a ManoProtect
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Solicitar Eliminación de Cuenta
          </h1>
          <p className="text-slate-400">
            Completa este formulario para solicitar la eliminación de tu cuenta y datos
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>1</div>
            <span className="text-sm hidden sm:inline">Identificación</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>2</div>
            <span className="text-sm hidden sm:inline">Confirmación</span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 mb-8">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-400 mb-1">Acción Irreversible</h3>
              <p className="text-amber-200/80 text-sm">
                La eliminación de tu cuenta es permanente. Se eliminarán todos tus datos personales, 
                contactos de emergencia, historial de ubicaciones y configuración familiar.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Información de la Cuenta
                </h2>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email de la cuenta *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="tu@email.com"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.email ? 'border-red-500' : 'border-slate-600'
                      }`}
                      data-testid="delete-email-input"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Tu nombre completo"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.fullName ? 'border-red-500' : 'border-slate-600'
                      }`}
                      data-testid="delete-name-input"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
                </div>

                {/* Phone (optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Teléfono (opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+34 600 000 000"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-testid="delete-phone-input"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                  data-testid="delete-next-btn"
                >
                  Continuar
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  Confirmación
                </h2>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ¿Por qué quieres eliminar tu cuenta? *
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.reason ? 'border-red-500' : 'border-slate-600'
                    }`}
                    data-testid="delete-reason-select"
                  >
                    <option value="">Selecciona un motivo</option>
                    {reasons.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors.reason && <p className="text-red-400 text-sm mt-1">{errors.reason}</p>}
                </div>

                {/* Confirm Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirma tu email *
                  </label>
                  <input
                    type="email"
                    value={formData.confirmEmail}
                    onChange={(e) => setFormData({...formData, confirmEmail: e.target.value})}
                    placeholder="Escribe tu email otra vez"
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.confirmEmail ? 'border-red-500' : 'border-slate-600'
                    }`}
                    data-testid="delete-confirm-email-input"
                  />
                  {errors.confirmEmail && <p className="text-red-400 text-sm mt-1">{errors.confirmEmail}</p>}
                </div>

                {/* Data to be deleted */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Datos que se eliminarán:
                  </h4>
                  <ul className="space-y-2 text-sm text-red-200/80">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Datos personales (nombre, email, teléfono)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Contactos de emergencia
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Historial de ubicaciones
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Historial de alertas SOS
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Configuración familiar
                    </li>
                  </ul>
                </div>

                {/* Accept Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                    data-testid="delete-accept-terms"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-slate-300">
                    Entiendo que esta acción es <strong>irreversible</strong> y que todos mis datos 
                    serán eliminados permanentemente. Acepto la{' '}
                    <a href="/privacy-policy" className="text-indigo-400 hover:underline">
                      Política de Privacidad
                    </a>.
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-red-400 text-sm">{errors.acceptTerms}</p>}

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-700 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-500 text-white rounded-xl"
                    data-testid="delete-submit-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Enviar Solicitud
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            Tu solicitud será procesada en un máximo de 30 días
          </p>
          <p>
            ¿Preguntas? Contacta con{' '}
            <a href="mailto:soporte@manoprotectt.com" className="text-indigo-400 hover:underline">
              soporte@manoprotectt.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountRequest;
