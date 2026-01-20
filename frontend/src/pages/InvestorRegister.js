import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, Mail, Phone, Briefcase, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const InvestorRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);
  
  const [formData, setFormData] = useState({
    cif: '',
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    position: '',
    reason: ''
  });

  const [errors, setErrors] = useState({});

  const validateCIF = (cif) => {
    const cifPattern = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;
    return cifPattern.test(cif.toUpperCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateCIF(formData.cif)) {
      newErrors.cif = 'CIF inválido. Formato: Letra + 7 dígitos + letra/dígito (ej: B12345678)';
    }
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Nombre de empresa requerido';
    }
    
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Nombre de contacto requerido';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email corporativo inválido';
    }
    
    if (!formData.contact_phone.trim() || formData.contact_phone.length < 9) {
      newErrors.contact_phone = 'Teléfono inválido';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Cargo requerido';
    }
    
    if (!formData.reason.trim() || formData.reason.length < 50) {
      newErrors.reason = 'Por favor, describe tu interés (mínimo 50 caracteres)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/investors/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cif: formData.cif.toUpperCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al enviar solicitud');
      }

      setRequestId(data.request_id);
      setSubmitted(true);
      toast.success('Solicitud enviada correctamente');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg border-2 border-emerald-200 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Solicitud Recibida</h2>
            <p className="text-zinc-600 mb-6">
              Hemos recibido tu solicitud de acceso como inversor. Nuestro equipo revisará 
              la información proporcionada y te contactará en un máximo de <strong>48 horas laborables</strong>.
            </p>
            
            <div className="bg-zinc-100 p-4 rounded-lg mb-6">
              <p className="text-sm text-zinc-600">ID de solicitud:</p>
              <p className="font-mono font-bold text-lg">{requestId}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Volver al Inicio
              </Button>
              <Button
                onClick={() => navigate('/investor/status')}
                variant="outline"
                className="w-full"
              >
                Consultar Estado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
            alt="ManoProtect Logo" 
            className="h-16 w-auto mx-auto mb-6 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <Badge className="bg-amber-600 text-white px-4 py-2 mb-4">
            Acceso Confidencial para Inversores
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Solicitud de Acceso</h1>
          <p className="text-zinc-600">
            Complete el formulario para solicitar acceso a la documentación confidencial de ManoProtect
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-800 mb-1">Requisitos de Acceso</p>
                <ul className="text-amber-700 space-y-1">
                  <li>• CIF de empresa española verificable</li>
                  <li>• Email corporativo (no se aceptan emails personales)</li>
                  <li>• La solicitud será revisada manualmente por nuestro equipo</li>
                  <li>• Tiempo de respuesta: máximo 48 horas laborables</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card className="border-2 border-zinc-200 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Datos de la Empresa</CardTitle>
            <CardDescription>
              Todos los campos son obligatorios. La información será verificada.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CIF */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">CIF de la Empresa *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    type="text"
                    name="cif"
                    placeholder="B12345678"
                    value={formData.cif}
                    onChange={handleChange}
                    className={`pl-10 h-12 uppercase ${errors.cif ? 'border-red-500' : ''}`}
                    maxLength={9}
                    data-testid="cif-input"
                  />
                </div>
                {errors.cif && <p className="text-sm text-red-500">{errors.cif}</p>}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Nombre de la Empresa *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    type="text"
                    name="company_name"
                    placeholder="Nombre legal de la empresa"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={`pl-10 h-12 ${errors.company_name ? 'border-red-500' : ''}`}
                    data-testid="company-name-input"
                  />
                </div>
                {errors.company_name && <p className="text-sm text-red-500">{errors.company_name}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Persona de Contacto *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      type="text"
                      name="contact_name"
                      placeholder="Nombre completo"
                      value={formData.contact_name}
                      onChange={handleChange}
                      className={`pl-10 h-12 ${errors.contact_name ? 'border-red-500' : ''}`}
                      data-testid="contact-name-input"
                    />
                  </div>
                  {errors.contact_name && <p className="text-sm text-red-500">{errors.contact_name}</p>}
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Cargo *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      type="text"
                      name="position"
                      placeholder="CEO, Director de Inversiones..."
                      value={formData.position}
                      onChange={handleChange}
                      className={`pl-10 h-12 ${errors.position ? 'border-red-500' : ''}`}
                      data-testid="position-input"
                    />
                  </div>
                  {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Email Corporativo *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      type="email"
                      name="contact_email"
                      placeholder="nombre@empresa.com"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className={`pl-10 h-12 ${errors.contact_email ? 'border-red-500' : ''}`}
                      data-testid="email-input"
                    />
                  </div>
                  {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      type="tel"
                      name="contact_phone"
                      placeholder="+34 600 000 000"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className={`pl-10 h-12 ${errors.contact_phone ? 'border-red-500' : ''}`}
                      data-testid="phone-input"
                    />
                  </div>
                  {errors.contact_phone && <p className="text-sm text-red-500">{errors.contact_phone}</p>}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Motivo de Interés *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                  <Textarea
                    name="reason"
                    placeholder="Describa brevemente su interés en invertir en ManoProtect y qué documentación le gustaría revisar..."
                    value={formData.reason}
                    onChange={handleChange}
                    className={`pl-10 min-h-[120px] ${errors.reason ? 'border-red-500' : ''}`}
                    data-testid="reason-input"
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  {errors.reason && <p className="text-red-500">{errors.reason}</p>}
                  <span className="ml-auto">{formData.reason.length}/50 min</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white text-lg"
                disabled={loading}
                data-testid="submit-investor-btn"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando solicitud...</>
                ) : (
                  'Enviar Solicitud de Acceso'
                )}
              </Button>

              <p className="text-xs text-zinc-500 text-center">
                Al enviar esta solicitud, acepta que sus datos serán verificados y 
                tratados conforme a nuestra política de privacidad.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvestorRegister;
