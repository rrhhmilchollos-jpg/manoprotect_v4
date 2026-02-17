import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  UserPlus, 
  Bell, 
  Link2, 
  CheckCircle2, 
  ChevronRight,
  Smartphone,
  Download,
  AlertTriangle,
  ArrowLeft,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const InstruccionesFamiliares = () => {
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedStep, setExpandedStep] = useState(1);

  const shareLink = `${window.location.origin}/registro`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    toast.success('¡Enlace copiado!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Te invito a unirte a ManoProtect para que puedas recibir mis alertas de emergencia SOS. Es muy importante para mi seguridad. 🛡️\n\nRegístrate aquí: ${shareLink}\n\nDespués de registrarte, necesitas:\n1. Aceptar las notificaciones push\n2. Vincular tu cuenta con la mía\n\n¡Gracias! 💙`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const steps = [
    {
      number: 1,
      title: 'Registrarse en ManoProtect',
      description: 'El familiar debe crear su propia cuenta',
      icon: UserPlus,
      color: 'bg-blue-500',
      details: [
        'Ir a manoprotect.com/registro',
        'Completar el formulario con nombre, email y contraseña',
        'La contraseña debe tener al menos 8 caracteres',
        'Verificar el email si es necesario'
      ],
      action: (
        <Button 
          onClick={() => navigate('/registro')} 
          className="mt-3 bg-blue-600 hover:bg-blue-700"
          data-testid="step1-register-btn"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Ir a Registro
        </Button>
      )
    },
    {
      number: 2,
      title: 'Aceptar Notificaciones Push',
      description: 'Crítico para recibir alertas SOS',
      icon: Bell,
      color: 'bg-amber-500',
      details: [
        'Al iniciar sesión, aparecerá una ventana preguntando si permites notificaciones',
        'IMPORTANTE: Debes hacer clic en "Permitir"',
        'Si bloqueaste las notificaciones, debes ir a la configuración del navegador para habilitarlas',
        'Sin esto, NO recibirás las alertas de emergencia'
      ],
      warning: '⚠️ Si no aceptas las notificaciones, NO recibirás las alertas SOS'
    },
    {
      number: 3,
      title: 'Vincular la Cuenta',
      description: 'Conectar con el familiar que envía alertas',
      icon: Link2,
      color: 'bg-emerald-500',
      details: [
        'El familiar que envía alertas debe ir a "Contactos" en su dashboard',
        'Agregar tu email como contacto de emergencia',
        'Tú recibirás una invitación para vincular las cuentas',
        'Acepta la invitación para completar el proceso'
      ]
    },
    {
      number: 4,
      title: 'Verificar Configuración',
      description: 'Asegurar que todo funcione correctamente',
      icon: CheckCircle2,
      color: 'bg-purple-500',
      details: [
        'Ir a "Perfil" y verificar que las notificaciones estén activas',
        'Hacer una prueba: el familiar puede enviar un SOS de prueba',
        'Deberías recibir una notificación push con sirena',
        'Si no funciona, revisa los pasos anteriores'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <img 
            src="/manoprotect_logo.webp" 
            alt="ManoProtect" 
            className="h-8 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Guía para Familiares
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Sigue estos pasos para poder recibir las alertas SOS de tus seres queridos
          </p>
        </div>

        {/* Important Alert */}
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 font-medium">¿Por qué necesito hacer esto?</p>
              <p className="text-amber-200/80 text-sm mt-1">
                Para recibir alertas SOS de emergencia, necesitas tener tu propia cuenta en ManoProtect 
                y aceptar las notificaciones push. Sin esto, la app no puede enviarte alertas cuando 
                un familiar esté en peligro.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              Compartir con Familiares
            </CardTitle>
            <CardDescription className="text-slate-400">
              Envía este enlace a tus familiares para que se registren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-3">
              <input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="flex-1 bg-transparent text-slate-300 text-sm outline-none"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyLink}
                className="text-slate-400 hover:text-white"
                data-testid="copy-link-btn"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button 
              onClick={shareViaWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="share-whatsapp-btn"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Compartir por WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Pasos a Seguir</h2>
          
          {steps.map((step, index) => (
            <Card 
              key={step.number}
              className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:bg-slate-800/70 ${
                expandedStep === step.number ? 'ring-2 ring-blue-500/50' : ''
              }`}
              onClick={() => setExpandedStep(expandedStep === step.number ? 0 : step.number)}
              data-testid={`step-${step.number}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step.color}`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">PASO {step.number}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${
                    expandedStep === step.number ? 'rotate-90' : ''
                  }`} />
                </div>
                
                {expandedStep === step.number && (
                  <div className="mt-4 pl-16 space-y-3">
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {step.warning && (
                      <p className="text-amber-400 text-sm font-medium">{step.warning}</p>
                    )}
                    {step.action}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Device Requirements */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              Requisitos del Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-white">Navegador Web</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Chrome, Firefox, Edge o Safari actualizado</li>
                <li>• Notificaciones del navegador habilitadas</li>
                <li>• JavaScript activado</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">Móvil (Opcional)</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Android 8+ o iOS 14+</li>
                <li>• Instalar la app desde el navegador (PWA)</li>
                <li>• Permitir notificaciones en configuración</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-white">¿Qué pasa si no me llegan las notificaciones?</h4>
              <p className="text-sm text-slate-400 mt-1">
                Verifica que las notificaciones del navegador estén habilitadas. En Chrome, 
                ve a Configuración → Privacidad y seguridad → Configuración de sitios → Notificaciones 
                y asegúrate de que manoprotect.com esté permitido.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">¿Necesito pagar?</h4>
              <p className="text-sm text-slate-400 mt-1">
                No, recibir alertas SOS es completamente gratis. Los planes de pago son 
                opcionales y ofrecen funciones adicionales.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">¿Cómo sé si estoy vinculado correctamente?</h4>
              <p className="text-sm text-slate-400 mt-1">
                Ve a tu Dashboard y busca la sección "Modo Familiar". Ahí verás la lista de 
                familiares vinculados contigo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <h3 className="text-xl font-bold text-white">¿Listo para empezar?</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/registro')}
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6"
              data-testid="cta-register-btn"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Crear mi Cuenta
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-lg px-8 py-6"
              data-testid="cta-login-btn"
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default InstruccionesFamiliares;
