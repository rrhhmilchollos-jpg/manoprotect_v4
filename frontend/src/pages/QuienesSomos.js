/**
 * ManoProtect - Quiénes Somos (About Us)
 * Página que presenta al equipo detrás de ManoProtect
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, Users, Heart, Award, Target, Zap, 
  CheckCircle, ArrowRight, Linkedin, Mail, Phone
} from 'lucide-react';
import { Button } from '../components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const QuienesSomos = () => {
  // Placeholder para equipo - El usuario proporcionará los datos reales
  const teamMembers = [
    {
      name: "Iván Rubio",
      role: "CEO & Fundador",
      image: null, // Placeholder - usuario proporcionará imagen
      description: "Emprendedor con visión de proteger a las familias españolas contra el fraude digital.",
      linkedin: "https://linkedin.com/in/",
    },
    {
      name: "Equipo Técnico",
      role: "Desarrollo & Seguridad",
      image: null,
      description: "Expertos en ciberseguridad, desarrollo móvil y sistemas de alerta temprana.",
      linkedin: null,
    },
    {
      name: "Equipo de Soporte",
      role: "Atención al Cliente",
      image: null,
      description: "Profesionales dedicados a garantizar la mejor experiencia para nuestros usuarios.",
      linkedin: null,
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Seguridad",
      description: "Protegemos a más de 10.000 familias españolas contra estafas y fraudes digitales."
    },
    {
      icon: Heart,
      title: "Compromiso",
      description: "Nos dedicamos 24/7 a garantizar la tranquilidad de nuestros usuarios."
    },
    {
      icon: Zap,
      title: "Innovación",
      description: "Utilizamos IA avanzada para detectar amenazas antes de que te afecten."
    },
    {
      icon: Users,
      title: "Familia",
      description: "Creemos que la protección digital es un derecho, no un privilegio."
    }
  ];

  const milestones = [
    { year: "2023", event: "Fundación de ManoProtect en Valencia" },
    { year: "2024", event: "Lanzamiento del sistema de detección de phishing con IA" },
    { year: "2024", event: "Primera familia protegida de una estafa bancaria" },
    { year: "2025", event: "+10.000 familias protegidas en toda España" },
    { year: "2025", event: "Lanzamiento del Botón SOS de emergencia" }
  ];

  return (
    <>
      <Helmet>
        <title>Quiénes Somos | ManoProtect - Protección Digital para Familias</title>
        <meta name="description" content="Conoce al equipo de ManoProtect. Somos una empresa española dedicada a proteger familias contra estafas, fraudes y amenazas digitales." />
        <meta name="keywords" content="ManoProtect equipo, sobre nosotros, protección digital España, empresa ciberseguridad Valencia" />
        <link rel="canonical" href="https://manoprotect.com/quienes-somos" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/30 mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Empresa 100% Española</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Protegiendo a las{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                familias españolas
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              ManoProtect nació con una misión clara: que ninguna familia española 
              vuelva a ser víctima de una estafa digital. Somos tecnología y humanidad 
              al servicio de tu tranquilidad.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Sede en Valencia, España</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>+10.000 familias protegidas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestra Historia */}
        <section className="py-16 px-6 bg-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Nuestra Historia</h2>
                <div className="space-y-4 text-slate-300">
                  <p>
                    ManoProtect nació en Valencia en 2023, cuando nuestro fundador 
                    presenció cómo un familiar perdía sus ahorros por una estafa 
                    telefónica sofisticada. Esa experiencia dolorosa se convirtió 
                    en nuestra motivación.
                  </p>
                  <p>
                    Nos preguntamos: ¿Por qué no existe una herramienta que proteja 
                    a las familias españolas de estas amenazas? La respuesta fue 
                    crear ManoProtect.
                  </p>
                  <p>
                    Hoy, protegemos a más de 10.000 familias en toda España, 
                    detectando amenazas antes de que causen daño y proporcionando 
                    tranquilidad a padres, abuelos e hijos.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Hitos importantes
                </h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="w-16 text-emerald-400 font-bold text-sm">
                        {milestone.year}
                      </div>
                      <div className="flex-1 text-slate-300 text-sm">
                        {milestone.event}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestros Valores */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Nuestros Valores</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Los principios que guían cada decisión que tomamos
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-slate-400 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="py-16 px-6 bg-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Nuestro Equipo</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Profesionales apasionados por proteger a las familias españolas
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 text-center group hover:border-emerald-500/50 transition-all"
                >
                  {/* Avatar placeholder */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Users className="w-10 h-10 text-white" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-emerald-400 text-sm mb-3">{member.role}</p>
                  <p className="text-slate-400 text-sm mb-4">{member.description}</p>
                  
                  {member.linkedin && (
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                ¿Quieres unirte a nuestro equipo? {' '}
                <a href="mailto:empleo@manoprotect.com" className="text-emerald-400 hover:underline">
                  Envíanos tu CV
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 md:p-12 border border-emerald-500/30">
              <Award className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Únete a las +10.000 familias protegidas
              </h2>
              <p className="text-slate-300 mb-6 max-w-xl mx-auto">
                Prueba ManoProtect gratis durante 7 días y descubre por qué 
                miles de familias españolas confían en nosotros.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    Probar 7 Días Gratis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                    Ver Planes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="py-12 px-6 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-white font-medium">Email</p>
                <a href="mailto:info@manoprotect.com" className="text-slate-400 hover:text-emerald-400 text-sm">
                  info@manoprotect.com
                </a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-white font-medium">Teléfono</p>
                <a href="tel:+34601510950" className="text-slate-400 hover:text-emerald-400 text-sm">
                  +34 601 510 950
                </a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-white font-medium">Empresa</p>
                <p className="text-slate-400 text-sm">
                  ManoProtect S.L. - Valencia, España
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <LandingFooter />
      </div>
    </>
  );
};

export default QuienesSomos;
