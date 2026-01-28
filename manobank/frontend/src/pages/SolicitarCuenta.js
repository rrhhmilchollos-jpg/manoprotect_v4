import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Building2, Shield, CheckCircle, ArrowRight, User, Mail, Phone, 
  MapPin, FileText, CreditCard, Video, Loader2, AlertCircle,
  Lock, Award, Clock, Globe
} from 'lucide-react';
import KYCVideoVerification from './KYCVideoVerification';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SolicitarCuenta = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: KYC Video, 3: Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_dni: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_province: '',
    address_country: 'España',
    account_type: 'corriente',
    initial_deposit: '0',
    occupation: '',
    monthly_income: '',
    date_of_birth: '',
    nationality: 'Española',
    accept_terms: false,
    accept_privacy: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!formData.accept_terms || !formData.accept_privacy) {
      toast.error('Debe aceptar los términos y condiciones y la política de privacidad');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create account request
      const response = await fetch(`${API_URL}/api/manobank/public/request-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          initial_deposit: parseFloat(formData.initial_deposit) || 0,
          monthly_income: parseFloat(formData.monthly_income) || 0
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al enviar solicitud');
      }

      const data = await response.json();
      setRequestId(data.request_id);
      setStep(2); // Move to KYC video verification
      toast.success('Formulario enviado. Ahora proceda con la videoverificación.');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKYCComplete = (result) => {
    setVerificationResult(result);
    if (result.status === 'approved') {
      setStep(3);
    } else {
      toast.error('Verificación no aprobada. Puede intentarlo de nuevo o contactar con nosotros.');
    }
  };

  // Step 1: Application Form
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">ManoBank</h1>
                <p className="text-xs text-slate-500">S.A.</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Ya soy cliente
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Entidad regulada por el Banco de España</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>Datos protegidos con cifrado SSL</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Garantía de depósitos hasta 100.000€</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <span className="font-medium">Datos personales</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-bold">2</div>
                <span className="text-slate-500">Videoverificación</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-bold">3</div>
                <span className="text-slate-500">Cuenta activa</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Abrir cuenta ManoBank</h2>
            <p className="text-slate-500 mb-6">Complete el formulario y realice la videoverificación para activar su cuenta en minutos.</p>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Personal Data */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Datos personales
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Juan García López"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">DNI/NIE/Pasaporte *</label>
                    <input
                      type="text"
                      name="customer_dni"
                      value={formData.customer_dni}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12345678A"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono móvil *</label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de nacimiento *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nacionalidad</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Dirección
                </h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Calle y número *</label>
                  <input
                    type="text"
                    name="address_street"
                    value={formData.address_street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Calle Mayor, 123, 2ºA"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Código postal *</label>
                    <input
                      type="text"
                      name="address_postal_code"
                      value={formData.address_postal_code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="28001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ciudad *</label>
                    <input
                      type="text"
                      name="address_city"
                      value={formData.address_city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Madrid"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Provincia *</label>
                    <input
                      type="text"
                      name="address_province"
                      value={formData.address_province}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Madrid"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Información laboral
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ocupación</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingeniero, Comercial, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ingresos mensuales (€)</label>
                    <input
                      type="number"
                      name="monthly_income"
                      value={formData.monthly_income}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2000"
                    />
                  </div>
                </div>
              </div>

              {/* Account Type */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Tipo de cuenta
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { value: 'corriente', label: 'Cuenta Corriente', desc: 'Para el día a día' },
                    { value: 'ahorro', label: 'Cuenta de Ahorro', desc: 'Rentabiliza tu dinero' },
                    { value: 'nomina', label: 'Cuenta Nómina', desc: 'Domicilia tu salario' },
                    { value: 'empresa', label: 'Cuenta Empresa', desc: 'Para autónomos y empresas' }
                  ].map(type => (
                    <label 
                      key={type.value}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.account_type === type.value 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="account_type"
                        value={type.value}
                        checked={formData.account_type === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-slate-500">{type.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accept_terms"
                    checked={formData.accept_terms}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    He leído y acepto los <a href="/terminos" className="text-blue-600 underline">Términos y Condiciones</a> y 
                    el <a href="/contrato-cuenta" className="text-blue-600 underline">Contrato de Cuenta</a> de ManoBank S.A. *
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accept_privacy"
                    checked={formData.accept_privacy}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    Acepto la <a href="/privacidad" className="text-blue-600 underline">Política de Privacidad</a> y 
                    autorizo el tratamiento de mis datos conforme al RGPD. *
                  </span>
                </label>
              </div>

              {/* KYC Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <Video className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">Videoverificación obligatoria</p>
                  <p className="text-sm text-amber-700">
                    Tras completar el formulario, deberá realizar una videollamada con un agente de ManoBank 
                    para verificar su identidad. Tenga preparado su DNI/NIE/Pasaporte original.
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Continuar con videoverificación
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>ManoBank S.A. | CIF: B19427723 | Código entidad: 9999</p>
            <p>Inscrita en el Registro del Banco de España</p>
            <p className="mt-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Calle Gran Vía, 28, 28013 Madrid | Tel: 900 123 456
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Step 2: KYC Video Verification
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4">
        {/* Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span>Datos enviados</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <span className="font-medium">Videoverificación</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-600 text-slate-400 rounded-full flex items-center justify-center font-bold">3</div>
              <span className="text-slate-400">Cuenta activa</span>
            </div>
          </div>
        </div>

        <KYCVideoVerification
          requestId={requestId}
          customerName={formData.customer_name}
          customerDni={formData.customer_dni}
          customerPhone={formData.customer_phone}
          onVerificationComplete={handleKYCComplete}
          onCancel={() => navigate('/')}
        />
      </div>
    );
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido a ManoBank!</h1>
          <p className="text-slate-600 mb-6">
            Su cuenta ha sido verificada y activada correctamente.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3">Próximos pasos:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Recibirá un email con sus credenciales de acceso
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Su IBAN estará disponible en su área de cliente
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Su tarjeta de débito será enviada a su domicilio
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/login')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Acceder a mi cuenta
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Volver al inicio
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            ManoBank S.A. | CIF: B19427723 | Entidad regulada por el Banco de España
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default SolicitarCuenta;
