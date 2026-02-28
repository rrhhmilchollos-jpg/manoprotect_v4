import React from 'react';
import { Shield, Users, Award, Heart, Target, Zap, Linkedin, Twitter, Mail, MapPin, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import LandingFooter from '@/components/landing/LandingFooter';

/**
 * Sobre Nosotros - Página del equipo y empresa
 * Genera confianza mostrando las personas detrás de ManoProtect
 */
const SobreNosotros = () => {
  const navigate = useNavigate();

  // Solo mostramos información verificable del fundador
  const team = [
    {
      name: "Daniel Escrivá",
      role: "Fundador",
      image: null,
      initials: "DE",
      bio: "Apasionado por la ciberseguridad y la protección de las familias españolas. Creó ManoProtect con la misión de hacer la tecnología de protección accesible para todos.",
      linkedin: "#",
      color: "emerald"
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Protección Real",
      description: "Cada funcionalidad está diseñada para protegerte de amenazas reales."
    },
    {
      icon: Heart,
      title: "Personas Primero",
      description: "Detrás de cada alerta hay una familia. Tratamos tus datos como si fueran los nuestros."
    },
    {
      icon: Target,
      title: "Innovación Constante",
      description: "Los estafadores evolucionan. Nosotros más rápido. Mejoramos nuestra tecnología constantemente."
    },
    {
      icon: Zap,
      title: "Simplicidad",
      description: "Tecnología compleja, uso sencillo. Diseñado para que cualquiera pueda usarlo."
    }
  ];

  const milestones = [
    { year: "2024", event: "Fundaci\u00f3n de ManoProtect", description: "Nace ManoProtect con la misi\u00f3n de proteger familias espa\u00f1olas" },
    { year: "2025", event: "Lanzamiento oficial", description: "Disponible para todos en Espa\u00f1a con GPS, SOS y seguimiento familiar" },
    { year: "2026", event: "Protecci\u00f3n 24/7", description: "Localizaci\u00f3n en segundo plano, bloqueo parental y notificaciones push en tiempo real" }
  ];

  const colorClasses = {
    emerald: 'bg-emerald-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Sobre Nosotros - El Equipo de ManoProtect"
        description="Conoce al equipo detrás de ManoProtect. Expertos en ciberseguridad comprometidos con proteger a las familias españolas del fraude digital."
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6">
            <Users className="w-4 h-4" />
            Nuestro Equipo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Personas Reales Protegiendo a <span className="text-emerald-400">Familias Reales</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            No somos una corporación sin rostro. Somos un equipo de expertos en seguridad que decidimos hacer algo contra el fraude después de verlo de cerca.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              Nuestra Misión
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              Cada día, muchos españoles reciben intentos de estafa por teléfono, SMS y email. Personas mayores, familias trabajadoras, todos son objetivos de los ciberdelincuentes.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              <strong>ManoProtect</strong> nació con una misión clara: hacer que la protección digital sea accesible y fácil de usar para todos.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Utilizamos inteligencia artificial para detectar amenazas en tiempo real y alertarte antes de que sea demasiado tarde.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Sobre el Fundador</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Comprometido con la seguridad digital de las familias españolas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 ${colorClasses[member.color]} rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-emerald-600 font-medium">{member.role}</p>
                  </div>
                </div>
                
                {/* Bio */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                
                {/* Social */}
                <a 
                  href={member.linkedin}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Nuestros Valores</h2>
            <p className="text-slate-600">Lo que nos guía cada día</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Nuestra Historia</h2>
            <p className="text-slate-400">De una idea a proteger familias españolas</p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-emerald-400 font-bold">{milestone.year}</span>
                </div>
                <div className="flex-shrink-0 relative">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                  {index < milestones.length - 1 && (
                    <div className="absolute top-4 left-1.5 w-1 h-full bg-slate-700" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="font-bold text-white">{milestone.event}</h3>
                  <p className="text-slate-400 text-sm">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">¿Quieres unirte al equipo?</h2>
            <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
              Siempre buscamos personas apasionadas por la seguridad y la protección de las personas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:careers@manoprotect.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Ver Ofertas de Empleo
              </a>
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Contactar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Office Info */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Oficina Central</h3>
              <p className="text-slate-600 text-sm">C/ Sor Isabel de Villena 82 bajo</p>
              <p className="text-slate-600 text-sm">Novelé, Valencia, España</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Teléfono</h3>
              <a href="tel:601510950" className="text-emerald-600 hover:underline">601 510 950</a>
            </div>
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
              <a href="mailto:info@manoprotect.com" className="text-emerald-600 hover:underline">info@manoprotect.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">¿Listo para proteger a tu familia?</h2>
          <p className="text-slate-600 mb-8">
            Prueba ManoProtect gratis durante 7 días. Sin compromiso.
          </p>
          <Button
            onClick={() => navigate('/register')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg"
          >
            Empezar Prueba Gratuita
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default SobreNosotros;
