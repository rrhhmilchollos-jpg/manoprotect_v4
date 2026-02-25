/**
 * ManoProtect - Blog: Seguridad Niños con Botón SOS
 * SEO: seguridad hijos, localización escolar, botón SOS adolescentes
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, ArrowRight, Clock, User, Calendar, Share2, CheckCircle, MapPin, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const SeguridadHijosBotonSOS = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Seguridad para Niños y Adolescentes: Guía del Botón SOS [2026]",
    "description": "Cómo proteger a tus hijos con tecnología SOS. Botón de emergencia, localización escolar, control parental y zonas seguras.",
    "author": { "@type": "Organization", "name": "ManoProtect" },
    "publisher": { "@type": "Organization", "name": "ManoProtect", "logo": { "@type": "ImageObject", "url": "https://manoprotect.com/logo512.png" } },
    "datePublished": "2026-02-24",
    "dateModified": "2026-02-24"
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Seguridad para Niños con Botón SOS: Guía Completa [2026]</title>
        <meta name="description" content="Protege a tus hijos con un botón SOS físico. Localización escolar, control parental, zonas seguras y alertas. Guía para padres 2026." />
        <meta name="keywords" content="seguridad niños boton sos, localización escolar, botón emergencia adolescentes, control parental gps, proteger hijos" />
        <link rel="canonical" href="https://manoprotect.com/blog/seguridad-hijos-boton-sos" />
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
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />8 min lectura</span>
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Niños</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Seguridad para Niños y Adolescentes: <span className="text-blue-600">Guía del Botón SOS</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          En España, más de 13.000 menores desaparecen cada año. El 66% son adolescentes.
          Un botón SOS físico puede ser la diferencia entre un susto y una emergencia real.
          Te explicamos cómo funciona y qué buscar.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mb-10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-lg text-gray-900">¿Por qué un botón SOS y no un móvil?</h2>
          </div>
          <p className="text-gray-700">
            Un teléfono móvil puede estar descargado, sin datos, confiscado en clase o simplemente
            olvidado en la mochila. Un <strong>botón SOS físico en la muñeca</strong> está siempre accesible:
            un toque de 3 segundos activa la emergencia, envía la ubicación GPS y llama a los padres.
            Sin desbloquear pantalla, sin buscar contactos, sin depender de WiFi.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Localización escolar: saber dónde están tus hijos</h2>
          <p className="text-gray-600 mb-4">
            La localización escolar permite a los padres configurar <strong>zonas seguras</strong> alrededor
            del colegio, la casa y las actividades extraescolares. El dispositivo envía alertas automáticas
            cuando tu hijo entra o sale de estas zonas, sin que él tenga que hacer nada.
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Alerta de salida del colegio</strong>: recibes una notificación cuando tu hijo sale del recinto escolar.</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Historial de rutas</strong>: consulta qué camino ha tomado para ir y volver del colegio.</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Alerta nocturna</strong>: si detecta movimiento fuera de casa por la noche, recibes aviso.</li>
            <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Modo clase</strong>: silencia el dispositivo en horario escolar, pero el SOS sigue activo.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Control parental: tú decides quién contacta a tu hijo</h2>
          <p className="text-gray-600 mb-4">
            El Sentinel X permite a los padres gestionar todos los aspectos del dispositivo desde la app:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: <Lock className="w-5 h-5" />, title: "Contactos bloqueados", desc: "Solo los números que tú autorices pueden llamar al reloj" },
              { icon: <MapPin className="w-5 h-5" />, title: "Zonas seguras ilimitadas", desc: "Colegio, casa abuelos, piscina, parque..." },
              { icon: <Clock className="w-5 h-5" />, title: "Horarios de uso", desc: "Define cuándo puede recibir llamadas y cuándo no" },
              { icon: <Shield className="w-5 h-5" />, title: "Anti-desmontaje", desc: "Tu hijo no puede desactivar la localización" }
            ].map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-start gap-3">
                <div className="text-blue-600 mt-0.5">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿A qué edad empezar con un botón SOS?</h2>
          <p className="text-gray-600 mb-4">
            Los expertos en seguridad infantil recomiendan considerar un dispositivo SOS cuando el menor
            empieza a tener <strong>independencia de movimiento</strong>: ir solo al colegio, actividades
            extraescolares, salidas con amigos. Normalmente entre los <strong>10 y 12 años</strong>.
          </p>
          <p className="text-gray-600">
            El Sentinel X está diseñado para niños a partir de 12 años, con un diseño juvenil que
            no les avergüenza llevar. Es resistente al agua y golpes del día a día escolar, y la
            batería dura 5 días para evitar cargas constantes.
          </p>
        </section>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Nuestra recomendación: Sentinel X para Niños</h3>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-500" /> Botón SOS físico - un toque = ayuda inmediata</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-500" /> GPS en tiempo real con zonas seguras</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-500" /> Control parental completo desde la app</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-500" /> IP68: resistente a agua y golpes</li>
          </ul>
          <Link to="/sentinel-x-ninos">
            <Button className="bg-blue-600 hover:bg-blue-700">Ver Sentinel X Niños - 149€ <ArrowRight className="w-4 h-4 ml-2" /></Button>
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
            <Link to="/blog/seguridad-personal-adultos" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Seguridad personal para adultos</p>
              <p className="text-sm text-gray-500">Trabajo, deporte y vida diaria</p>
            </Link>
            <Link to="/blog/cuidado-mayores-teleasistencia" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Cuidado de mayores: teleasistencia moderna</p>
              <p className="text-sm text-gray-500">Guía para familiares</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SeguridadHijosBotonSOS;
