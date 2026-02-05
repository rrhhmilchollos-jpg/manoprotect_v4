import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle, Users, Bell, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Recibe una Alerta",
      description: "Cuando recibes una llamada, SMS, email o mensaje sospechoso, simplemente cópialo.",
      icon: Bell
    },
    {
      number: 2,
      title: "Análisis Instantáneo",
      description: "Pégalo en MANO. Nuestra IA analiza el contenido en segundos usando patrones de amenazas conocidos.",
      icon: Zap
    },
    {
      number: 3,
      title: "Recibe Protección",
      description: "ManoProtect te muestra si es seguro o peligroso, qué tipo de amenaza es y qué hacer exactamente.",
      icon: Shield
    },
    {
      number: 4,
      title: "Protección Continua",
      description: "Tu historial se guarda para monitorear patrones y avisarte de amenazas similares en el futuro.",
      icon: Lock
    }
  ];

  const features = [
    "Análisis con IA en tiempo real",
    "Base de datos de amenazas actualizada",
    "Alertas personalizadas",
    "Protección familiar",
    "Historial completo",
    "Modo oscuro",
    "Exportación de datos",
    "Alertas comunitarias"
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/manoprotect_logo.png" alt="ManoProtect Logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold tracking-tight">ManoProtect</span>
          </div>
          <Button
            data-testid="header-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            Ir al Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            ¿Cómo funciona <span className="text-indigo-600">ManoProtect</span>?
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Protección contra fraudes digitales en 4 simples pasos
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 mb-20">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              data-testid={`step-${step.number}`}
              className="flex gap-8 items-start"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <step.icon className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                <p className="text-lg text-zinc-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Características incluidas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-zinc-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-12 text-center border-0">
          <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Empieza a protegerte hoy
          </h2>
          <p className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto">
            Empieza a protegerte ahora. Es gratis y toma menos de 1 minuto.
          </p>
          <Button
            data-testid="start-now-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-white text-indigo-600 hover:bg-zinc-50 rounded-lg px-10 h-14 text-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default HowItWorks;