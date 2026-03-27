/**
 * ManoProtect - Blog: Cuidado de Mayores y Teleasistencia
 * SEO: cuidado mayores, teleasistencia moderna, detector de caídas
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, ArrowRight, Clock, Calendar, Share2, CheckCircle, Heart, Phone, MapPin, AlertTriangle, Battery, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const CuidadoMayoresTeleasistencia = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cuidado de Mayores: Teleasistencia Moderna vs Tradicional [2026]",
    "description": "Compara la teleasistencia tradicional con dispositivos SOS modernos. Detector de caídas, GPS, llamadas y alertas para personas mayores.",
    "author": { "@type": "Organization", "name": "ManoProtect" },
    "publisher": { "@type": "Organization", "name": "ManoProtect", "logo": { "@type": "ImageObject", "url": "https://manoprotectt.com/logo512.png" } },
    "datePublished": "2026-02-24",
    "dateModified": "2026-02-24"
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Botón SOS Físico para Mayores – Seguridad y Tranquilidad [2026]</title>
        <meta name="description" content="Compara la teleasistencia tradicional con dispositivos SOS modernos. Detector de caídas automático, GPS y alertas familiares. Guía 2026 para familiares." />
        <meta name="keywords" content="cuidado mayores, teleasistencia moderna, detector caídas ancianos, botón SOS personas mayores, teleasistencia sin cuotas" />
        <link rel="canonical" href="https://manoprotectt.com/blog/cuidado-mayores-teleasistencia" />
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
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />10 min lectura</span>
          <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Senior</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Botón SOS Físico para Mayores – <span className="text-red-600">Seguridad y Tranquilidad</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          La teleasistencia tradicional se ha quedado obsoleta. Los dispositivos modernos con
          detector de caídas automático, GPS y alertas a familiares ofrecen una protección muy
          superior. Comparamos las opciones para que elijas la mejor para tu familiar mayor.
        </p>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cómo Mantener a los Mayores Protegidos en Casa y Fuera</h2>
          <p className="text-gray-600 mb-4">
            Con un botón SOS físico para mayores, cualquier emergencia se comunica inmediatamente a familiares o servicios de asistencia. Incluye detector de caídas, localización en tiempo real y pantalla accesible para usuarios de 55 años en adelante.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 border-b">Característica</th>
                  <th className="p-4 text-center text-sm font-bold text-gray-500 border-b">Teleasistencia Tradicional</th>
                  <th className="p-4 text-center text-sm font-bold text-red-600 border-b">Botón SOS ManoProtect</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Tipo de dispositivo", "Medallón o pulsera con botón", "Reloj inteligente o botón portátil"],
                  ["Funciona fuera de casa", "No (solo radio 200m)", "Sí (4G LTE, toda España)"],
                  ["GPS en tiempo real", "No", "Sí (precisión 2-5 metros)"],
                  ["Detector de caídas", "No (o muy básico)", "Sí (IA avanzada)"],
                  ["Llamadas bidireccionales", "Solo a centralita", "A familiares directamente"],
                  ["Cuota mensual", "25-50€/mes", "Desde 9,99€/mes"],
                  ["Zonas seguras", "No", "Ilimitadas"],
                  ["Monitor cardíaco", "No", "24/7 con alertas"],
                  ["App para familiares", "No", "Sí (iOS y Android)"],
                  ["Contrato mínimo", "12-24 meses", "Sin permanencia"]
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-4 text-center text-gray-500 border-b border-gray-100">{row[1]}</td>
                    <td className="p-4 text-center text-gray-900 font-medium border-b border-gray-100">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Detector de caídas: cómo funciona</h2>
          <p className="text-gray-600 mb-4">
            Las <strong>caídas son la primera causa de lesión en mayores de 65 años</strong>. Cada año,
            un tercio de las personas mayores de 65 años sufre al menos una caída. El problema es que
            muchos no pueden pedir ayuda después de caer.
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-gray-900">Dato crítico</h3>
            </div>
            <p className="text-gray-700">
              Según el INE, <strong>más de 3.000 personas mueren al año en España por caídas accidentales</strong>.
              La mayoría son personas mayores de 65 años. El tiempo de respuesta tras la caída es
              determinante: si la persona recibe ayuda en los primeros 30 minutos, la tasa de
              supervivencia se multiplica por 4.
            </p>
          </div>
          <p className="text-gray-600">
            El detector de caídas del Sentinel X y el Botón SOS de ManoProtect utiliza sensores
            acelerómetro y giroscopio combinados con <strong>inteligencia artificial</strong> para
            distinguir entre una caída real y un movimiento brusco normal. Cuando detecta una caída:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600 mt-4">
            <li>Emite una vibración y cuenta atrás de 30 segundos para cancelar falsos positivos</li>
            <li>Si no se cancela, envía alerta con ubicación GPS a todos los contactos de emergencia</li>
            <li>Realiza llamada automática al primer contacto</li>
            <li>Graba audio del entorno durante 60 segundos como referencia</li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Consejos para elegir un dispositivo para mayores</h2>
          <div className="space-y-3 text-gray-600">
            <p className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Facilidad de uso</strong>: botones grandes, pantalla legible, sonido alto. Tu familiar no debería necesitar un manual.</p>
            <p className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Resistencia al agua</strong>: IP67 mínimo. Muchas caídas ocurren en el baño; el dispositivo debe funcionar mojado.</p>
            <p className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Batería larga</strong>: 5+ días. Los mayores olvidan cargar los dispositivos; cuanta más batería, mejor.</p>
            <p className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Sin permanencia</strong>: evita contratos de 12-24 meses. Si el dispositivo no funciona como esperabas, debes poder devolverlo.</p>
            <p className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> <strong>GPS real</strong>: algunos dispositivos solo ofrecen localización por red móvil (imprecisa). Exige GPS multi-banda.</p>
          </div>
        </section>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 border border-red-200 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Nuestra recomendación para Seniors</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500" /> Botón SOS Físico - 29,99€</h4>
              <p className="text-gray-600 text-sm mb-2">Para mayores que quieren un dispositivo simple y económico. Un botón grande, GPS y alerta a familiares.</p>
              <Link to="/boton-sos-senior">
                <Button variant="outline" size="sm" className="border-red-300 text-red-700">Ver Botón SOS Senior</Button>
              </Link>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-[#4CAF50]" /> Sentinel X - 149€</h4>
              <p className="text-gray-600 text-sm mb-2">Para protección completa: detector de caídas IA, llamadas, monitor cardíaco, zonas seguras ilimitadas y eSIM incluida.</p>
              <Link to="/sentinel-x">
                <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049]">Ver Sentinel X</Button>
              </Link>
            </div>
          </div>
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
            <Link to="/blog/reloj-gps-alzheimer" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Reloj GPS para personas con Alzheimer</p>
              <p className="text-sm text-gray-500">Zonas seguras y alertas automáticas</p>
            </Link>
            <Link to="/blog/seguridad-hijos-boton-sos" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Seguridad para niños con botón SOS</p>
              <p className="text-sm text-gray-500">Guía completa para padres</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default CuidadoMayoresTeleasistencia;
