/**
 * ManoProtect - Blog: Seguridad Personal para Adultos
 * SEO: seguridad laboral, protección personal, botón SOS trabajo
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, ArrowRight, Clock, Calendar, Share2, CheckCircle, Briefcase, Dumbbell, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const SeguridadPersonalAdultos = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Seguridad Personal para Adultos: Botón SOS en Trabajo y Deporte [2026]",
    "description": "Cómo un botón SOS físico mejora tu seguridad laboral y deportiva. Prevención de riesgos, protección personal y emergencias.",
    "author": { "@type": "Organization", "name": "ManoProtect" },
    "publisher": { "@type": "Organization", "name": "ManoProtect", "logo": { "@type": "ImageObject", "url": "https://manoprotectt.com/logo512.png" } },
    "datePublished": "2026-02-24",
    "dateModified": "2026-02-24"
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Protección Personal con Sentinel X – Botón SOS para Adultos [2026]</title>
        <meta name="description" content="Protege tu seguridad personal con un botón SOS físico. Ideal para trabajo en campo, deporte solitario y viajes. Prevención de riesgos laborales." />
        <meta name="keywords" content="seguridad personal adultos, botón SOS trabajo, protección laboral, botón emergencia deporte, seguridad runners" />
        <link rel="canonical" href="https://manoprotectt.com/blog/seguridad-personal-adultos" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div>
            <span className="text-[#4CAF50] text-xl font-bold">ManoProtect</span>
          </Link>
          <Link to="/blog"><Button variant="outline">Ver más artículos</Button></Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />24 Feb 2026</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />9 min lectura</span>
          <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">Adultos</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Protección Personal con Sentinel X – <span className="text-emerald-600">Botón SOS para Adultos</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Ya seas un profesional que trabaja en campo, un deportista solitario o alguien que viaja
          frecuentemente, un botón SOS físico te da la seguridad de poder pedir ayuda al instante.
          Sin sacar el móvil, sin desbloquear pantalla, sin buscar contactos.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Por Qué Cada Adulto Debe Tener un Botón SOS
          </h2>
          <p className="text-gray-600 mb-4">
            Sentinel X ofrece seguridad activa para adultos. Ya sea en el trabajo, deportes o viajes, un botón SOS físico garantiza que puedas alertar a tus contactos o servicios de emergencia inmediatamente.
          </p>
          <ul className="space-y-3 text-gray-600 mb-4">
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Repartidores y mensajeros</strong>: trabajan solos en rutas urbanas y rurales</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Técnicos de campo</strong>: instaladores, electricistas, mantenimiento en zonas aisladas</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Comerciales y visitadores</strong>: visitas a domicilios o empresas desconocidas</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Personal sanitario a domicilio</strong>: enfermeros, fisioterapeutas, cuidadores</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Guardas y vigilantes</strong>: seguridad en naves, polígonos y fincas</li>
          </ul>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <p className="text-gray-700">
              Un dispositivo como el Sentinel X con <strong>botón SOS físico</strong> cumple con los
              requisitos de la PRL para trabajadores solitarios. Al pulsarlo, envía la ubicación GPS
              y llama automáticamente a los contactos de emergencia configurados.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-emerald-600" />
            Seguridad deportiva: runners, ciclistas y montañeros
          </h2>
          <p className="text-gray-600 mb-4">
            Cada año se producen miles de accidentes deportivos en España. Los más vulnerables son
            quienes practican deporte en solitario: runners que entrenan solos, ciclistas en carreteras
            secundarias y montañeros en rutas aisladas.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {[
              { title: "Running", desc: "Caídas, esguinces, golpes de calor. Si entrenas solo y te caes en una zona aislada, el botón SOS envía tu ubicación exacta." },
              { title: "Ciclismo", desc: "Accidentes de tráfico, pinchazos en rutas solitarias. El Sentinel X es resistente a golpes y vibración." },
              { title: "Montaña", desc: "Pérdida de orientación, caídas, condiciones meteorológicas adversas. GPS multi-banda con precisión en zonas remotas." }
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Modo SOS invisible: protección discreta</h2>
          <p className="text-gray-600 mb-4">
            En situaciones de acoso, intimidación o violencia, no siempre es posible pedir ayuda
            abiertamente. El <strong>modo SOS invisible</strong> del Sentinel X permite enviar una alerta
            de emergencia sin que nadie lo note: un gesto discreto en la pantalla o una secuencia de
            pulsaciones activa el protocolo de emergencia silenciosamente.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Envío de ubicación GPS sin sonido ni vibración</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Grabación automática de audio como prueba</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> Alertas a contactos de emergencia en segundo plano</li>
          </ul>
        </section>

        <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-8 border border-emerald-200 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Nuestra recomendación: Sentinel X para Adultos</h3>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Botón SOS físico discreto + modo invisible</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> IP68 + 5ATM: agua, polvo, golpes, temperaturas extremas</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Cumple normativa PRL para trabajadores solitarios</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Diseño premium que parece un smartwatch de alta gama</li>
          </ul>
          <Link to="/sentinel-x-adultos">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Ver Sentinel X Adultos - 149€ <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-gray-500 text-sm">¿Te ha sido útil?</p>
          <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" />Compartir</Button>
        </div>
      </article>

      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Artículos relacionados</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/blog/seguridad-hijos-boton-sos" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Seguridad para niños con botón SOS</p>
              <p className="text-sm text-gray-500">Guía completa para padres</p>
            </Link>
            <Link to="/blog/cuidado-mayores-teleasistencia" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Cuidado de mayores: teleasistencia moderna</p>
              <p className="text-sm text-gray-500">Detector de caídas y botón SOS</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SeguridadPersonalAdultos;
