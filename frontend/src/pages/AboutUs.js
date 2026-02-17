/**
 * ManoProtect - Quiénes Somos / About Us Page
 * Professional team introduction page
 */
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, Heart, Target, Award, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Team members data - TO BE UPDATED with real photos and info
const teamMembers = [
  {
    name: "CEO / Fundador",
    role: "Director Ejecutivo",
    image: null, // Add photo URL here
    description: "Visionario y líder del proyecto ManoProtect. Más de 10 años de experiencia en tecnología y seguridad digital.",
    linkedin: null,
    email: "ceo@manoprotect.com"
  },
  {
    name: "CTO",
    role: "Director de Tecnología",
    image: null,
    description: "Experto en ciberseguridad y desarrollo de soluciones innovadoras para protección digital.",
    linkedin: null,
    email: "cto@manoprotect.com"
  },
  {
    name: "COO",
    role: "Director de Operaciones",
    image: null,
    description: "Especialista en operaciones y escalabilidad de productos tecnológicos.",
    linkedin: null,
    email: "coo@manoprotect.com"
  }
];

const values = [
  {
    icon: Shield,
    title: "Seguridad",
    description: "La protección de nuestros usuarios es nuestra máxima prioridad. Implementamos las más avanzadas tecnologías de seguridad."
  },
  {
    icon: Heart,
    title: "Compromiso",
    description: "Nos comprometemos con cada familia española a brindarles tranquilidad y protección las 24 horas del día."
  },
  {
    icon: Target,
    title: "Innovación",
    description: "Utilizamos inteligencia artificial y tecnología de vanguardia para estar siempre un paso adelante de las amenazas."
  },
  {
    icon: Award,
    title: "Excelencia",
    description: "Buscamos la excelencia en cada aspecto de nuestro servicio, desde la tecnología hasta la atención al cliente."
  }
];

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold">Quiénes Somos</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Protegiendo a las familias españolas
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Somos un equipo apasionado por la tecnología y la seguridad, comprometidos con 
            hacer de España un lugar más seguro frente a las amenazas digitales.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Nuestra Misión</h2>
            <p className="text-lg text-slate-600 text-center leading-relaxed">
              En ManoProtect creemos que todas las familias merecen sentirse seguras en el mundo digital. 
              Nuestra misión es proporcionar tecnología de protección accesible y fácil de usar que 
              permita a padres, hijos y abuelos navegar por internet y usar sus dispositivos con 
              total tranquilidad.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Nuestros Valores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Nuestro Equipo</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Un equipo multidisciplinar de expertos en tecnología, ciberseguridad y atención al cliente.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Photo placeholder */}
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                  <p className="text-emerald-600 font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-slate-600 text-sm mb-4">{member.description}</p>
                  
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" 
                         className="p-2 bg-slate-100 rounded-lg hover:bg-emerald-100 transition-colors">
                        <Linkedin className="w-4 h-4 text-slate-600" />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`}
                         className="p-2 bg-slate-100 rounded-lg hover:bg-emerald-100 transition-colors">
                        <Mail className="w-4 h-4 text-slate-600" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Placeholder notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 italic">
              * Las fotos y perfiles del equipo se actualizarán próximamente.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">10K+</p>
              <p className="text-emerald-200">Familias protegidas</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">99.9%</p>
              <p className="text-emerald-200">Uptime garantizado</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-emerald-200">Soporte disponible</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">4.8★</p>
              <p className="text-emerald-200">Valoración media</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">¿Quieres saber más?</h2>
          <p className="text-slate-600 mb-8">
            Estamos aquí para responder todas tus preguntas sobre cómo ManoProtect puede 
            ayudar a proteger a tu familia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/plans')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Ver Planes
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:info@manoprotect.com'}
            >
              Contactar
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
