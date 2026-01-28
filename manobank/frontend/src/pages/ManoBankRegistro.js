import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, FileText, CreditCard, Shield, CheckCircle,
  ChevronRight, ChevronLeft, Camera, Mic, Video, AlertTriangle, Loader2,
  Building, Calendar, Lock, Eye, EyeOff, Upload, Info, Landmark, Home
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ManoBankRegistro = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [step, setStep] = useState(1); // 1-5 steps
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data - BBVA style complete registration
  const [formData, setFormData] = useState({
    // Step 1: Personal Data
    tipo_documento: 'DNI',
    numero_documento: '',
    letra_documento: '',
    nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_nacimiento: '',
    sexo: '',
    nacionalidad: 'Española',
    
    // Step 2: Contact & Address
    email: '',
    telefono_movil: '',
    telefono_fijo: '',
    direccion: '',
    numero: '',
    piso: '',
    puerta: '',
    codigo_postal: '',
    localidad: '',
    provincia: '',
    pais: 'España',
    
    // Step 3: Employment & Financial
    situacion_laboral: '',
    profesion: '',
    nombre_empresa: '',
    ingresos_anuales: '',
    origen_fondos: '',
    proposito_cuenta: '',
    
    // Step 4: Documents
    documento_frontal: null,
    documento_trasero: null,
    selfie: null,
    
    // Consents
    acepta_terminos: false,
    acepta_privacidad: false,
    acepta_comunicaciones: false,
    persona_politica: false,
    titular_real: true
  });

  // KYC Video state
  const [kycStatus, setKycStatus] = useState('pending'); // pending, scheduled, in_progress, completed, rejected
  const [kycAppointment, setKycAppointment] = useState(null);
  const [mediaPermissions, setMediaPermissions] = useState({ camera: false, microphone: false });
  const [stream, setStream] = useState(null);

  // Registration result
  const [registrationResult, setRegistrationResult] = useState(null);

  const steps = [
    { number: 1, title: 'Datos Personales', icon: User },
    { number: 2, title: 'Contacto y Dirección', icon: MapPin },
    { number: 3, title: 'Situación Económica', icon: Building },
    { number: 4, title: 'Documentación', icon: FileText },
    { number: 5, title: 'Videoverificación', icon: Video }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (stepNum) => {
    switch(stepNum) {
      case 1:
        if (!formData.numero_documento || !formData.nombre || !formData.primer_apellido || !formData.fecha_nacimiento) {
          toast.error('Complete todos los campos obligatorios');
          return false;
        }
        if (formData.tipo_documento === 'DNI' && !formData.letra_documento) {
          toast.error('Introduzca la letra del DNI');
          return false;
        }
        return true;
      case 2:
        if (!formData.email || !formData.telefono_movil || !formData.direccion || !formData.codigo_postal || !formData.localidad) {
          toast.error('Complete todos los campos obligatorios');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Email no válido');
          return false;
        }
        if (!/^[67]\d{8}$/.test(formData.telefono_movil)) {
          toast.error('Teléfono móvil no válido (debe empezar por 6 o 7)');
          return false;
        }
        return true;
      case 3:
        if (!formData.situacion_laboral || !formData.origen_fondos || !formData.proposito_cuenta) {
          toast.error('Complete todos los campos obligatorios');
          return false;
        }
        return true;
      case 4:
        if (!formData.acepta_terminos || !formData.acepta_privacidad) {
          toast.error('Debe aceptar los términos y condiciones y la política de privacidad');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Request camera and microphone permissions
  const requestMediaPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true 
      });
      
      setStream(mediaStream);
      setMediaPermissions({ camera: true, microphone: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      toast.success('Permisos de cámara y micrófono concedidos');
      return true;
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Debe permitir el acceso a la cámara y micrófono para la videoverificación');
      } else if (error.name === 'NotFoundError') {
        toast.error('No se encontró cámara o micrófono en este dispositivo');
      } else {
        toast.error('Error al acceder a la cámara y micrófono');
      }
      
      setMediaPermissions({ camera: false, microphone: false });
      return false;
    }
  };

  // Stop media stream
  const stopMediaStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  // Submit registration
  const handleSubmitRegistration = async () => {
    setLoading(true);
    try {
      const registrationData = {
        ...formData,
        documento_completo: `${formData.numero_documento}${formData.letra_documento}`.toUpperCase(),
        fecha_registro: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/api/manobank/registro/nuevo-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en el registro');
      }

      setRegistrationResult(data);
      toast.success('Solicitud de registro enviada correctamente');
      
    } catch (error) {
      toast.error(error.message || 'Error al procesar el registro');
    } finally {
      setLoading(false);
    }
  };

  // Schedule KYC video call
  const scheduleKYC = async () => {
    if (!mediaPermissions.camera || !mediaPermissions.microphone) {
      const granted = await requestMediaPermissions();
      if (!granted) return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/manobank/registro/solicitar-videoverificacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: `${formData.numero_documento}${formData.letra_documento}`.toUpperCase(),
          nombre: `${formData.nombre} ${formData.primer_apellido}`,
          telefono: formData.telefono_movil,
          email: formData.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al solicitar videoverificación');
      }

      setKycStatus('scheduled');
      setKycAppointment(data);
      toast.success('Videoverificación programada');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-white">ManoBank</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:601510950" className="hidden md:flex items-center gap-2 text-white/70 hover:text-white text-sm">
              <Phone className="w-4 h-4" />
              601 510 950
            </a>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/login-seguro')}>
              Ya soy cliente
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= s.number 
                      ? 'bg-white text-blue-600 border-white' 
                      : 'bg-transparent text-white/50 border-white/30'
                  }`}>
                    {step > s.number ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs text-center hidden md:block ${step >= s.number ? 'text-white' : 'text-white/50'}`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-full mx-2 ${step > s.number ? 'bg-white' : 'bg-white/30'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h1 className="text-2xl font-bold">Abrir cuenta en ManoBank</h1>
            <p className="text-blue-100 mt-1">Paso {step} de 5: {steps[step-1].title}</p>
          </div>

          <div className="p-6 md:p-8">
            {/* Step 1: Personal Data */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Documento de identidad</p>
                    <p className="text-sm text-blue-700">Necesitará su DNI o NIE vigente para completar el registro</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de documento *</label>
                    <select
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DNI">DNI</option>
                      <option value="NIE">NIE</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                    <input
                      type="text"
                      name="numero_documento"
                      value={formData.numero_documento}
                      onChange={handleChange}
                      placeholder="12345678"
                      maxLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Letra *</label>
                    <input
                      type="text"
                      name="letra_documento"
                      value={formData.letra_documento}
                      onChange={(e) => setFormData(prev => ({ ...prev, letra_documento: e.target.value.toUpperCase() }))}
                      placeholder="X"
                      maxLength={1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Juan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primer apellido *</label>
                    <input
                      type="text"
                      name="primer_apellido"
                      value={formData.primer_apellido}
                      onChange={handleChange}
                      placeholder="García"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Segundo apellido</label>
                    <input
                      type="text"
                      name="segundo_apellido"
                      value={formData.segundo_apellido}
                      onChange={handleChange}
                      placeholder="López"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento *</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexo *</label>
                    <select
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="H">Hombre</option>
                      <option value="M">Mujer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nacionalidad *</label>
                    <input
                      type="text"
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Address */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@ejemplo.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono móvil *</label>
                    <input
                      type="tel"
                      name="telefono_movil"
                      value={formData.telefono_movil}
                      onChange={handleChange}
                      placeholder="612345678"
                      maxLength={9}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Dirección de residencia
                  </h3>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Calle, Avenida, Plaza..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                      <input
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Piso/Puerta</label>
                      <input
                        type="text"
                        name="piso"
                        value={formData.piso}
                        onChange={handleChange}
                        placeholder="2ºA"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código postal *</label>
                      <input
                        type="text"
                        name="codigo_postal"
                        value={formData.codigo_postal}
                        onChange={handleChange}
                        placeholder="46001"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localidad *</label>
                      <input
                        type="text"
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        placeholder="Valencia"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Provincia *</label>
                      <select
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Valencia">Valencia</option>
                        <option value="Alicante">Alicante</option>
                        <option value="Castellón">Castellón</option>
                        <option value="Madrid">Madrid</option>
                        <option value="Barcelona">Barcelona</option>
                        <option value="Sevilla">Sevilla</option>
                        <option value="Otra">Otra</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment & Financial */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Información requerida por ley</p>
                    <p className="text-sm text-amber-700">Esta información es obligatoria según la normativa de prevención de blanqueo de capitales</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Situación laboral *</label>
                    <select
                      name="situacion_laboral"
                      value={formData.situacion_laboral}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="empleado">Empleado por cuenta ajena</option>
                      <option value="autonomo">Autónomo</option>
                      <option value="empresario">Empresario</option>
                      <option value="funcionario">Funcionario</option>
                      <option value="jubilado">Jubilado/Pensionista</option>
                      <option value="estudiante">Estudiante</option>
                      <option value="desempleado">Desempleado</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profesión</label>
                    <input
                      type="text"
                      name="profesion"
                      value={formData.profesion}
                      onChange={handleChange}
                      placeholder="Ej: Ingeniero, Médico, Comercial..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingresos anuales aproximados</label>
                    <select
                      name="ingresos_anuales"
                      value={formData.ingresos_anuales}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="menos_15000">Menos de 15.000€</option>
                      <option value="15000_30000">15.000€ - 30.000€</option>
                      <option value="30000_50000">30.000€ - 50.000€</option>
                      <option value="50000_100000">50.000€ - 100.000€</option>
                      <option value="mas_100000">Más de 100.000€</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Origen de los fondos *</label>
                    <select
                      name="origen_fondos"
                      value={formData.origen_fondos}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="nomina">Nómina/Pensión</option>
                      <option value="actividad_profesional">Actividad profesional</option>
                      <option value="ahorros">Ahorros</option>
                      <option value="herencia">Herencia</option>
                      <option value="venta_inmueble">Venta de inmueble</option>
                      <option value="inversiones">Inversiones</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Propósito de la cuenta *</label>
                  <select
                    name="proposito_cuenta"
                    value={formData.proposito_cuenta}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="gastos_diarios">Gastos diarios</option>
                    <option value="nomina">Domiciliación de nómina</option>
                    <option value="ahorro">Ahorro</option>
                    <option value="inversiones">Inversiones</option>
                    <option value="negocio">Negocio/Actividad profesional</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Declaraciones obligatorias</h3>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="persona_politica"
                      checked={formData.persona_politica}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Declaro que <strong>SOY</strong> una persona con responsabilidad pública (cargo político, alto funcionario, etc.) o familiar directo de una
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="titular_real"
                      checked={formData.titular_real}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Declaro que actúo en mi propio nombre y soy el <strong>titular real</strong> de los fondos que se depositarán en esta cuenta
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Documents & Consents */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Documentación a aportar</h3>
                  <p className="text-sm text-blue-700">
                    Para completar su solicitud, deberá tener preparado su documento de identidad (DNI/NIE) para la videoverificación.
                  </p>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Términos y condiciones</h3>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-xl hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="acepta_terminos"
                      checked={formData.acepta_terminos}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Acepto los términos y condiciones *</span>
                      <p className="text-xs text-gray-500 mt-1">
                        He leído y acepto el contrato de cuenta corriente, las condiciones generales y las tarifas aplicables
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-xl hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="acepta_privacidad"
                      checked={formData.acepta_privacidad}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Política de privacidad *</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de ManoBank
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-xl hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="acepta_comunicaciones"
                      checked={formData.acepta_comunicaciones}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Comunicaciones comerciales</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Acepto recibir comunicaciones comerciales sobre productos y ofertas de ManoBank
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen de su solicitud</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nombre completo</p>
                      <p className="font-medium">{formData.nombre} {formData.primer_apellido} {formData.segundo_apellido}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Documento</p>
                      <p className="font-medium">{formData.tipo_documento}: {formData.numero_documento}{formData.letra_documento}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium">{formData.telefono_movil}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Video Verification */}
            {step === 5 && (
              <div className="space-y-6">
                {!registrationResult ? (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <Video className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Videoverificación obligatoria</p>
                        <p className="text-sm text-red-700">
                          Para cumplir con la normativa bancaria, debe realizar una videollamada con uno de nuestros agentes para verificar su identidad
                        </p>
                      </div>
                    </div>

                    {/* Permission Request */}
                    {!mediaPermissions.camera && (
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Camera className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Activar cámara y micrófono</h3>
                        <p className="text-gray-600 mb-6">
                          Necesitamos acceso a su cámara y micrófono para realizar la videoverificación de identidad
                        </p>
                        <Button 
                          onClick={requestMediaPermissions}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Permitir acceso
                        </Button>
                      </div>
                    )}

                    {/* Video Preview */}
                    {mediaPermissions.camera && (
                      <div className="space-y-4">
                        <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              Cámara activa
                            </span>
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Mic className="w-3 h-3" />
                              Micrófono activo
                            </span>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="font-medium text-green-800">Dispositivo listo</p>
                          </div>
                          <p className="text-sm text-green-700">
                            Su cámara y micrófono están funcionando correctamente. Pulse el botón para enviar su solicitud y programar la videoverificación.
                          </p>
                        </div>

                        <Button 
                          onClick={handleSubmitRegistration}
                          disabled={loading}
                          className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Procesando solicitud...</>
                          ) : (
                            <><CheckCircle className="w-5 h-5 mr-2" />Enviar solicitud y programar videoverificación</>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Registration Success */
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">¡Solicitud recibida!</h2>
                      <p className="text-gray-600 mt-2">Su número de solicitud es: <strong>{registrationResult.solicitud_id}</strong></p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
                      <h3 className="font-semibold text-blue-800 mb-4">Próximos pasos:</h3>
                      <ol className="space-y-3 text-sm text-blue-700">
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                          <span>Un agente de ManoBank le llamará para programar la <strong>videoverificación</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                          <span>Durante la videollamada deberá mostrar su <strong>DNI/NIE original</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                          <span>Una vez verificado, recibirá por SMS su <strong>contraseña temporal</strong> (válida 24h)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                          <span>Acceda con su <strong>DNI/NIE y contraseña temporal</strong> para activar su cuenta</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                          <span>Realice su primer ingreso de <strong>25€ mínimo</strong> para activar todos los servicios</span>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-800">
                        <strong>Importante:</strong> Recibirá un SMS de confirmación en el número <strong>{formData.telefono_movil}</strong>. 
                        Si no lo recibe en 24h, contacte con nosotros al <strong>601 510 950</strong>
                      </p>
                    </div>

                    <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
                      Volver al inicio
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 5 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className={step === 1 ? 'invisible' : ''}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-white/70">
          <p>¿Necesita ayuda? Llámenos al <a href="tel:601510950" className="text-white font-medium hover:underline">601 510 950</a></p>
          <p className="text-sm mt-1">Horario: Lunes a Viernes 8:00 - 18:00</p>
        </div>
      </div>
    </div>
  );
};

export default ManoBankRegistro;
