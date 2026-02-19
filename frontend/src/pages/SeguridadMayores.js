/**
 * ManoProtect - Protección para Mayores
 * Contenido SEO para "protección digital mayores" "estafas ancianos"
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, Heart, Phone, Users, AlertTriangle, 
  CheckCircle, ArrowRight, Clock, Eye, Bell,
  Smartphone, Lock, UserCheck, MapPin
} from 'lucide-react';
import { Button } from '../components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const ProteccionMayores = () => {
  const commonScams = [
    {
      title: "Falso técnico de Microsoft",
      description: "Llaman diciendo que tu ordenador tiene un virus y piden acceso remoto.",
      risk: "Alto"
    },
    {
      title: "Estafa del familiar en apuros",
      description: "'Abuela, soy tu nieto, he tenido un accidente y necesito dinero urgente'",
      risk: "Muy Alto"
    },
    {
      title: "Falso empleado del banco",
      description: "Llaman haciéndose pasar por el banco para 'verificar' datos.",
      risk: "Muy Alto"
    },
    {
      title: "Premio de lotería falso",
      description: "Te avisan de un premio que no existe para robarte datos.",
      risk: "Medio"
    },
    {
      title: "Revisión de gas/luz falsa",
      description: "Se presentan en casa como técnicos para entrar y robar.",
      risk: "Alto"
    },
    {
      title: "Romance scam",
      description: "Crean relaciones falsas online para pedir dinero.",
      risk: "Alto"
    }
  ];

  const features = [
    {
      icon: Phone,
      title: "Verificación de Llamadas",
      description: "Identificamos si quien llama es realmente tu banco o un estafador."
    },
    {
      icon: Bell,
      title: "Alertas Familiares",
      description: "Los hijos reciben una alerta si detectamos actividad sospechosa."
    },
    {
      icon: Eye,
      title: "Interfaz Simplificada",
      description: "Diseñada con letras grandes y botones claros para facilitar el uso."
    },
    {
      icon: MapPin,
      title: "Botón SOS",
      description: "Un solo botón para pedir ayuda y compartir ubicación con la familia."
    }
  ];

  const testimonials = [
    {
      quote: "Mi madre casi cae en una estafa del 'nieto'. Gracias a ManoProtect, nos avisaron a tiempo.",
      name: "María G.",
      relation: "Hija de usuaria de 78 años"
    },
    {
      quote: "Por fin puedo estar tranquilo sabiendo que mis padres están protegidos.",
      name: "Carlos R.",
      relation: "Hijo de usuarios de 72 y 75 años"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Protección Digital para Mayores | Evita Estafas a Ancianos | ManoProtect</title>
        <meta name="description" content="Protege a tus padres y abuelos de estafas digitales. Sistema fácil de usar diseñado para mayores. Alertas familiares, verificación de llamadas y botón SOS." />
        <meta name="keywords" content="protección mayores estafas, estafas ancianos, seguridad digital tercera edad, proteger abuelos fraude, app mayores seguridad" />
        <link rel="canonical" href="https://manoprotect.com/proteccion-mayores" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "ManoProtect para Mayores",
            "description": "Sistema de protección digital diseñado para personas mayores",
            "brand": { "@type": "Brand", "name": "ManoProtect" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6">
              <Heart className="w-4 h-4 text-pink-400" />
              Especialmente diseñado para mayores
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Protege a Tus Padres y Abuelos<br />
              <span className="text-pink-400">de las Estafas Digitales</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              El 52% de las víctimas de estafas en España son mayores de 55 años. 
              ManoProtect les protege con tecnología fácil de usar y alertas a la familia.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register?plan=family-yearly">
                <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  Proteger a Mi Familia
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Ver Planes Familiares
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Common Scams */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">
              Las 6 Estafas Más Comunes a Mayores
            </h2>
            <p className="text-slate-600 text-center max-w-xl mx-auto mb-12">
              Conocer las técnicas más usadas es el primer paso para proteger a nuestros mayores
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commonScams.map((scam, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900">{scam.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      scam.risk === 'Muy Alto' ? 'bg-green-100 text-green-700' :
                      scam.risk === 'Alto' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {scam.risk}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{scam.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">
              Cómo ManoProtect Protege a los Mayores
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Family Connection */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Conexión Familiar en Tiempo Real
              </h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto mb-6">
                Con el plan Familiar, toda la familia recibe alertas cuando detectamos 
                una posible estafa. Así puedes actuar rápido y proteger a tus mayores.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Hasta 5 miembros
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Alertas instantáneas
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Ubicación GPS
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Botón SOS
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
              Lo Que Dicen Las Familias
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.relation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              No Esperes a Que Sea Tarde
            </h2>
            <p className="text-slate-600 mb-8">
              Protege a tus padres y abuelos hoy. Plan familiar desde 39,99€/mes.
            </p>
            <Link to="/register?plan=family-monthly">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Empezar Protección Familiar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <LandingFooter />
      </div>
    </>
  );
};

export default ProteccionMayores;
