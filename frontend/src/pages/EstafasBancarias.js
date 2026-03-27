/**
 * ManoProtect - Guía de Estafas Bancarias en España 2025
 * Contenido SEO para posicionar "estafas bancarias españa"
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, AlertTriangle, Phone, Mail, CreditCard, 
  Building2, Smartphone, Globe, CheckCircle, ArrowRight,
  Lock, Eye, Users, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';

const EstafasBancarias = () => {
  const scamTypes = [
    {
      icon: Phone,
      title: "Vishing (Llamadas fraudulentas)",
      description: "Llaman haciéndose pasar por tu banco para robarte las claves.",
      frequency: "47% de las estafas",
      tip: "Tu banco NUNCA te pedirá claves por teléfono."
    },
    {
      icon: Mail,
      title: "Phishing (Emails falsos)",
      description: "Emails que imitan a tu banco con enlaces a webs falsas.",
      frequency: "32% de las estafas",
      tip: "Verifica siempre la URL antes de introducir datos."
    },
    {
      icon: Smartphone,
      title: "Smishing (SMS fraudulentos)",
      description: "SMS urgentes que te piden verificar tu cuenta.",
      frequency: "15% de las estafas",
      tip: "No hagas clic en enlaces de SMS sospechosos."
    },
    {
      icon: Globe,
      title: "Webs falsas de bancos",
      description: "Páginas web idénticas a las de tu banco.",
      frequency: "6% de las estafas",
      tip: "Accede siempre desde la app oficial o escribiendo la URL."
    }
  ];

  const preventionTips = [
    "Nunca compartas tus claves bancarias por teléfono, email o SMS",
    "Activa las notificaciones de tu banco para cada movimiento",
    "Usa autenticación de dos factores (2FA) siempre que sea posible",
    "Verifica la URL: debe empezar por https:// y mostrar el candado",
    "No hagas clic en enlaces de emails o SMS, ve directamente a la web",
    "Ante la duda, cuelga y llama tú al número oficial de tu banco",
    "Desconfía de urgencias: los estafadores crean presión",
    "Mantén actualizado tu móvil y apps bancarias"
  ];

  const statistics = [
    { value: "285M€", label: "Robados en España en 2024" },
    { value: "+67%", label: "Aumento vs 2023" },
    { value: "52%", label: "Víctimas mayores de 55" },
    { value: "3 min", label: "Tiempo medio de estafa" }
  ];

  return (
    <>
      <Helmet>
        <title>Estafas Bancarias en España 2025: Guía Completa de Prevención | ManoProtect</title>
        <meta name="description" content="Aprende a protegerte de las estafas bancarias en España. Vishing, phishing, smishing: conoce los tipos de fraude bancario y cómo evitarlos. Guía actualizada 2025." />
        <meta name="keywords" content="estafas bancarias españa, fraude bancario, vishing, phishing banco, smishing, estafa telefono banco, proteccion bancaria" />
        <link rel="canonical" href="https://manoprotectt.com/estafas-bancarias" />
        <meta property="og:title" content="Estafas Bancarias en España 2025: Guía de Prevención" />
        <meta property="og:description" content="Guía completa para protegerte de estafas bancarias. Tipos de fraude, estadísticas y consejos de prevención actualizados." />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Estafas Bancarias en España 2025: Guía Completa de Prevención",
            "description": "Aprende a protegerte de las estafas bancarias. Vishing, phishing, smishing y más.",
            "author": { "@type": "Organization", "name": "ManoProtect" },
            "publisher": { "@type": "Organization", "name": "ManoProtect" },
            "datePublished": "2025-01-15",
            "dateModified": "2025-02-17"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full text-red-300 text-sm mb-6">
              <AlertTriangle className="w-4 h-4" />
              Guía Actualizada 2025
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Estafas Bancarias en España:<br />
              <span className="text-red-400">Cómo Protegerte</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              En 2024, los españoles perdieron más de 285 millones de euros por estafas bancarias. 
              Aprende a identificarlas y protegerte con esta guía completa.
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {statistics.map((stat, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-4">
                  <p className="text-2xl md:text-3xl font-bold text-red-400">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Types of Scams */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">
              Tipos de Estafas Bancarias Más Comunes
            </h2>
            <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
              Los ciberdelincuentes usan múltiples técnicas para robar tus datos bancarios. 
              Conocerlas es el primer paso para protegerte.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {scamTypes.map((scam, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-red-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <scam.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{scam.title}</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {scam.frequency}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{scam.description}</p>
                      <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{scam.tip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prevention Tips */}
        <section className="py-16 px-6 bg-emerald-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                8 Consejos para Evitar Estafas Bancarias
              </h2>
              <p className="text-slate-600">
                Sigue estas recomendaciones para proteger tus cuentas bancarias
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {preventionTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What to Do */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">
              ¿Qué Hacer Si Has Sido Víctima?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-red-600">1</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Bloquea tu cuenta</h3>
                <p className="text-slate-600 text-sm">
                  Llama inmediatamente a tu banco y bloquea tarjetas y acceso online.
                </p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-amber-600">2</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Denuncia</h3>
                <p className="text-slate-600 text-sm">
                  Presenta denuncia en Policía Nacional o Guardia Civil lo antes posible.
                </p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-emerald-600">3</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Reclama</h3>
                <p className="text-slate-600 text-sm">
                  Solicita al banco la devolución. Tienes 13 meses para reclamar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Protege a tu familia con ManoProtect
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Detectamos estafas bancarias ANTES de que te afecten. 
              Verificación de llamadas, análisis de SMS y alertas en tiempo real.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
                  Probar 7 Días Gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/verificar-estafa">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Verificar un Número Sospechoso
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <LandingFooter />
      </div>
    </>
  );
};

export default EstafasBancarias;
