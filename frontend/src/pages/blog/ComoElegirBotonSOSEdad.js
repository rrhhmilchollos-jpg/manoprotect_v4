/**
 * ManoProtect - Blog: Cómo Elegir el Botón SOS Adecuado para Cada Edad
 * Artículo comparativo SEO
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, ArrowRight, Clock, Calendar, Share2, CheckCircle, Users, Baby, Briefcase, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const ComoElegirBotonSOSEdad = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cómo Elegir el Botón SOS Adecuado para Cada Edad [Guía 2026]",
    "description": "Guía para elegir el mejor dispositivo SOS según la edad: niños 12-16, adultos 17-55 y seniors 55+. Comparativa de funciones y consejos.",
    "author": { "@type": "Organization", "name": "ManoProtect" },
    "publisher": { "@type": "Organization", "name": "ManoProtect", "logo": { "@type": "ImageObject", "url": "https://manoprotect.com/logo512.png" } },
    "datePublished": "2026-02-25",
    "dateModified": "2026-02-25"
  };

  const segments = [
    {
      age: "Niños (12-16)",
      device: "Sentinel X con geolocalización y botón físico juvenil",
      icon: <Baby className="w-8 h-8" />,
      color: "blue",
      features: ["Botón SOS físico", "GPS en tiempo real", "Control parental", "Zonas seguras (colegio, casa)", "Diseño juvenil resistente"],
      link: "/sentinel-x-ninos",
      cta: "Comprar Sentinel X Niños"
    },
    {
      age: "Adultos (17-55)",
      device: "Sentinel X discreto para seguridad personal y deportiva",
      icon: <Briefcase className="w-8 h-8" />,
      color: "emerald",
      features: ["Botón SOS discreto", "Llamadas automáticas a 3 contactos", "Resistente agua y golpes", "Uso laboral y deportivo", "Monitor cardíaco 24/7"],
      link: "/sentinel-x-adultos",
      cta: "Comprar Sentinel X Adultos"
    },
    {
      age: "Senior (55+)",
      device: "Botón SOS físico independiente con detector de caídas",
      icon: <Heart className="w-8 h-8" />,
      color: "red",
      features: ["Botón SOS físico grande", "Detector caídas automático", "Llamada emergencia inmediata", "Pantalla grande, sonido alto", "Sin cuotas ni permanencia"],
      link: "/boton-sos-senior",
      cta: "Comprar Botón SOS Senior"
    }
  ];

  const colorMap = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", iconBg: "bg-blue-100", btn: "bg-blue-600 hover:bg-blue-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", iconBg: "bg-emerald-100", btn: "bg-emerald-600 hover:bg-emerald-700" },
    red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", iconBg: "bg-red-100", btn: "bg-red-600 hover:bg-red-700" }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Cómo Elegir el Botón SOS Adecuado para Cada Edad [Guía 2026]</title>
        <meta name="description" content="Guía para elegir el mejor botón SOS según la edad. Niños 12-16: Sentinel X juvenil. Adultos 17-55: Sentinel X discreto. Senior 55+: Botón SOS independiente." />
        <meta name="keywords" content="elegir botón SOS, comparar dispositivos SOS, botón SOS por edades, sentinel x vs botón SOS, mejor dispositivo emergencia" />
        <link rel="canonical" href="https://manoprotect.com/blog/como-elegir-boton-sos-edad" />
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
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />25 Feb 2026</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />8 min lectura</span>
          <span className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Comparativa</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Cómo Elegir el <span className="text-[#4CAF50]">Botón SOS Adecuado</span> para Cada Edad
        </h1>

        <p className="text-xl text-gray-600 mb-10">
          No todos necesitan el mismo dispositivo de seguridad. La edad, el estilo de vida y las
          necesidades específicas determinan cuál es la mejor opción. Te ayudamos a elegir.
        </p>

        {/* Segmentation by Age */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Segmentación por Edad</h2>
          <div className="space-y-6">
            {segments.map((seg, i) => {
              const c = colorMap[seg.color];
              return (
                <div key={i} className={`${c.bg} rounded-2xl p-6 border ${c.border}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center ${c.text}`}>
                      {seg.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{seg.age}</h3>
                      <p className="text-gray-600 text-sm">{seg.device}</p>
                    </div>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-2 mb-4">
                    {seg.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-700 text-sm">
                        <CheckCircle className={`w-4 h-4 ${c.text} flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={seg.link}>
                    <Button className={`${c.btn} text-white`}>
                      {seg.cta} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparativa Rápida</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 border-b">Característica</th>
                  <th className="p-4 text-center text-sm font-bold text-blue-600 border-b">Niños 12-16</th>
                  <th className="p-4 text-center text-sm font-bold text-emerald-600 border-b">Adultos 17-55</th>
                  <th className="p-4 text-center text-sm font-bold text-red-600 border-b">Senior 55+</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Dispositivo", "Sentinel X", "Sentinel X", "Botón SOS"],
                  ["Botón SOS físico", "Sí", "Sí", "Sí"],
                  ["GPS en tiempo real", "Sí", "Sí", "Sí"],
                  ["Control parental", "Sí", "No", "No"],
                  ["Detector de caídas", "Sí (IA)", "Sí (IA)", "Sí (automático)"],
                  ["Llamadas bidireccionales", "Sí", "Sí", "Solo emergencia"],
                  ["Monitor cardíaco", "Sí", "Sí", "No"],
                  ["Resistencia agua", "IP68 + 5ATM", "IP68 + 5ATM", "IP67"],
                  ["Batería", "5 días", "5 días", "30 días"],
                  ["Precio", "149€", "149€", "29,99€"],
                  ["Envío", "Gratuito", "Gratuito", "Gratuito"]
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-3 text-center text-gray-700 border-b border-gray-100">{row[1]}</td>
                    <td className="p-3 text-center text-gray-700 border-b border-gray-100">{row[2]}</td>
                    <td className="p-3 text-center text-gray-700 border-b border-gray-100">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Consejos para Elegir el Mejor Dispositivo</h2>
          <div className="space-y-3">
            {[
              "Evalúa la facilidad de uso según la edad – los seniors necesitan botones grandes y simples; los niños necesitan control parental",
              "Verifica compatibilidad con tu app y contactos – todos los dispositivos ManoProtect funcionan con la misma app",
              "Considera resistencia agua y golpes – especialmente para niños activos y adultos deportistas",
              "Revisa alertas y geolocalización en tiempo real – la precisión GPS y las zonas seguras son fundamentales",
              "Compara el coste total a 1 año – incluye envío (gratuito en ManoProtect), cuotas y accesorios"
            ].map((tip, i) => (
              <p key={i} className="flex gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-0.5" />
                {tip}
              </p>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200 mb-12 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Comprar Ahora el Botón SOS Adecuado</h3>
          <p className="text-gray-600 mb-6">Envío gratuito a toda España | Oferta de lanzamiento hasta el 30 de Marzo</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/sentinel-x-ninos">
              <Button className="bg-blue-600 hover:bg-blue-700">Sentinel X Niños <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
            <Link to="/sentinel-x-adultos">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Sentinel X Adultos <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
            <Link to="/boton-sos-senior">
              <Button className="bg-red-600 hover:bg-red-700">Botón SOS Senior <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-gray-500 text-sm">¿Te ha sido útil?</p>
          <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" />Compartir</Button>
        </div>
      </article>

      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Artículos por segmento</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/blog/seguridad-hijos-boton-sos" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Seguridad para niños con botón SOS</p>
              <p className="text-sm text-gray-500">Guía completa para padres</p>
            </Link>
            <Link to="/blog/seguridad-personal-adultos" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Seguridad personal para adultos</p>
              <p className="text-sm text-gray-500">Trabajo, deporte y viajes</p>
            </Link>
            <Link to="/blog/cuidado-mayores-teleasistencia" className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="font-medium text-gray-900">Cuidado de mayores: teleasistencia</p>
              <p className="text-sm text-gray-500">Comparativa moderna vs tradicional</p>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ComoElegirBotonSOSEdad;
