/**
 * ManoProtect - Quienes Somos (Pagina Premium)
 * Equipo, historia, valores, oficina, numeros, CTA
 */
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Users, Heart, Target, Zap, MapPin, Phone, Mail, ArrowRight,
  Award, Camera, Watch, Building2, Globe, Star, Lock, Eye, Radio
} from 'lucide-react';

const IMG = {
  team: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/64ddf9a7ca4433786d08652e80bef7d720547dae09dc5910b0371085f558e81b.png',
  office: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/01479dedd0d28e8b04a0a835bcfa1b2534ae65443ae9b4c54c00a7d61dc4b9f7.png',
  sentinelTrio: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/16e97d0972346860b882ddea3662703ffc3438f28eae4e99da63bf51db6b6e60.png',
};

const TEAM = [
  { name: 'Daniel Escriva', role: 'Fundador y CEO', initials: 'DE', color: 'from-blue-600 to-blue-800', bio: 'Apasionado por la ciberseguridad y la proteccion de familias espanolas. 15 anos de experiencia en tecnologia y seguridad.' },
  { name: 'Maria Lopez', role: 'Directora de Operaciones', initials: 'ML', color: 'from-orange-500 to-red-500', bio: 'Ex-Securitas Direct. Experta en gestion de centros de control y respuesta ante emergencias.' },
  { name: 'Carlos Ruiz', role: 'CTO', initials: 'CR', color: 'from-emerald-500 to-teal-600', bio: 'Ingeniero de telecomunicaciones. Diseno los sistemas anti-inhibicion y la plataforma IoT de los Sentinel.' },
  { name: 'Ana Garcia', role: 'Directora Comercial', initials: 'AG', color: 'from-purple-500 to-indigo-600', bio: 'Especialista en seguridad residencial con experiencia en Prosegur. Dirige el equipo comercial a nivel nacional.' },
  { name: 'Javier Martinez', role: 'Jefe de Instalaciones', initials: 'JM', color: 'from-sky-500 to-cyan-600', bio: 'Mas de 2.000 instalaciones realizadas. Lidera el equipo de tecnicos en toda Espana.' },
  { name: 'Laura Fernandez', role: 'Atencion al Cliente', initials: 'LF', color: 'from-rose-500 to-pink-600', bio: 'Responsable del equipo de soporte 24/7. Garantiza una experiencia excepcional en cada interaccion.' },
];

const MILESTONES = [
  { year: '2023', title: 'La idea', desc: 'Daniel Escriva experimenta un robo en su vivienda. Descubre que las alarmas del mercado son caras, con permanencia y sin innovacion real.' },
  { year: '2024', title: 'Fundacion', desc: 'Nace ManoProtect con una mision clara: seguridad accesible, sin permanencia y con tecnologia de vanguardia.' },
  { year: '2024', title: 'Sentinel X, J y S', desc: 'Desarrollo de los relojes Sentinel con boton SOS, GPS y E-SIM integrada. Primer dispositivo de seguridad personal que funciona sin movil.' },
  { year: '2025', title: 'Lanzamiento comercial', desc: 'Primeros 1.000 clientes. Alianza con centro de control CRA certificado. Expansion a toda Espana.' },
  { year: '2025', title: 'Alarmas hogar y empresa', desc: 'Nueva linea de kits de alarma profesionales con camaras IA, anti-inhibicion y Sentinel integrado.' },
  { year: '2026', title: 'Lider en seguridad inteligente', desc: '+3.200 hogares y +950 empresas protegidas. 4.9/5 en Google Reviews. Expansion internacional en marcha.' },
];

const SobreNosotros = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" data-testid="sobre-nosotros">
      <Helmet>
        <title>Quienes Somos | ManoProtect - Seguridad Inteligente Espana</title>
        <meta name="description" content="Conoce al equipo detras de ManoProtect. Expertos en seguridad comprometidos con proteger hogares y familias espanolas. +3.200 hogares protegidos." />
      </Helmet>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md"><Shield className="w-5 h-5 text-white" /></div>
            <span className="text-gray-900 text-lg font-extrabold">ManoProtect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/seguridad-hogar-empresa" className="text-gray-600 hover:text-blue-700">Alarmas</Link>
            <Link to="/productos" className="text-gray-600 hover:text-blue-700">Sentinel</Link>
            <Link to="/contacto" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full text-xs font-bold">Contactar</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.team} alt="Equipo ManoProtect" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/40" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white/80 tracking-wider">QUIENES SOMOS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight tracking-tight" data-testid="hero-title">
            Personas reales protegiendo a <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">familias reales</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            No somos una corporacion sin rostro. Somos un equipo espanol de expertos en seguridad 
            comprometidos con hacer la proteccion accesible para todos.
          </p>
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-gray-950 py-6 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-10 sm:gap-16">
          {[
            { val: '+3.200', label: 'Hogares protegidos' },
            { val: '+950', label: 'Empresas' },
            { val: '30+', label: 'Empleados' },
            { val: '4.9/5', label: 'Google Reviews' },
            { val: '2023', label: 'Fundada' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-white text-xl font-black">{s.val}</p>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-5 tracking-tight">Nuestra mision</h2>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                En 2023, nuestro fundador Daniel Escriva sufrio un robo en su vivienda. La alarma que tenia 
                — de una empresa conocida — fallo. Contrato cara, con 24 meses de permanencia, y el servicio 
                de respuesta tardo mas de 15 minutos.
              </p>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Eso cambio todo. Daniel reunio a un equipo de expertos en telecomunicaciones, seguridad 
                y desarrollo de producto para crear algo mejor: <strong className="text-gray-900">ManoProtect</strong>.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Hoy ofrecemos alarmas con camaras IA, anti-inhibicion, sin permanencia, y algo que ningun 
                competidor tiene: los relojes <strong className="text-gray-900">Sentinel con boton SOS</strong> que funcionan 
                incluso con el movil apagado.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Proteccion real', desc: 'Cada producto esta disenado para proteger de amenazas reales, no solo para vender.' },
                { icon: Heart, title: 'Familias primero', desc: 'Detras de cada alarma hay una familia. Tratamos tu seguridad como la nuestra.' },
                { icon: Target, title: 'Innovacion', desc: 'Camaras con IA, anti-inhibicion, E-SIM. Tecnologia que los competidores no ofrecen.' },
                { icon: Zap, title: 'Sin permanencia', desc: 'Confiamos en nuestro servicio. Si no te gusta, te vas sin penalizacion.' },
              ].map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <v.icon className="w-6 h-6 text-blue-700 mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{v.title}</h3>
                  <p className="text-xs text-gray-500">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50" data-testid="team-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Nuestro equipo</h2>
            <p className="text-gray-500 text-sm">Expertos en seguridad, tecnologia y atencion al cliente</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all" data-testid={`team-${i}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md`}>{m.initials}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{m.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{m.role}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-white text-center mb-12 tracking-tight">Nuestra historia</h2>
          <div className="space-y-0">
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0">{m.year.slice(-2)}</div>
                  {i < MILESTONES.length - 1 && <div className="w-0.5 flex-1 bg-gray-800 mt-1" />}
                </div>
                <div className="pb-8">
                  <p className="text-orange-400 text-xs font-bold mb-1">{m.year}</p>
                  <h3 className="font-bold text-white text-sm mb-1">{m.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10 tracking-tight">Lo que hacemos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: IMG.sentinelTrio, title: 'Relojes Sentinel X, J y S', desc: 'Dispositivos de seguridad personal con GPS, boton SOS, E-SIM y sensor cardiaco.', link: '/productos', cta: 'Ver relojes' },
              { img: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/3491f38335afcb9caf468ea266417ef144e075a365d6a5fe69e676315b6942b6.png', title: 'Alarmas para viviendas', desc: 'Kits profesionales con camaras IA, centro 24h y Sentinel incluido. SIN permanencia.', link: '/alarmas/vivienda', cta: 'Ver alarmas hogar' },
              { img: 'https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/849e086aebf89bbc87613eecc7dd2e68ad9829e7f3df9e73c316cb6968ad6176.png', title: 'Alarmas para negocios', desc: 'Camaras 4K, control acceso biometrico, servicio de Acuda. Todo para tu empresa.', link: '/alarmas/negocio', cta: 'Ver alarmas negocio' },
            ].map((p, i) => (
              <Link key={i} to={p.link} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{p.desc}</p>
                  <span className="text-blue-700 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    {p.cta} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Office */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <img src={IMG.office} alt="Oficina ManoProtect Valencia" className="rounded-3xl shadow-xl w-full" loading="lazy" />
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-5">Nuestra oficina</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Sede central</p>
                    <p className="text-xs text-gray-500">C/ Sor Isabel de Villena 82 bajo, Novele, Valencia, Espana</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Telefono</p>
                    <a href="tel:+34601510950" className="text-xs text-blue-600 hover:underline">601 510 950</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Email</p>
                    <a href="mailto:info@manoprotect.com" className="text-xs text-blue-600 hover:underline">info@manoprotect.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Cobertura</p>
                    <p className="text-xs text-gray-500">Toda Espana peninsular, Baleares y Canarias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-800 to-blue-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-black mb-3">Unete a la familia ManoProtect</h2>
          <p className="text-blue-200 mb-6 text-sm">Mas de 3.200 hogares ya confian en nosotros. Sin permanencia. Sentinel SOS incluido.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/seguridad-hogar-empresa" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-sm hover:shadow-xl transition-all" data-testid="cta-alarmas">
              Ver alarmas
            </Link>
            <Link to="/productos" className="bg-white/15 text-white px-8 py-4 rounded-full font-bold text-sm border border-white/30">
              Ver relojes Sentinel
            </Link>
            <Link to="/contacto" className="bg-white text-blue-800 px-8 py-4 rounded-full font-bold text-sm hover:shadow-xl transition-all">
              Contactar
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SobreNosotros;
