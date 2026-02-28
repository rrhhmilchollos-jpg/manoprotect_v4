/**
 * ManoProtect - Página de Precios y Planes
 * Plan mensual y anual + prueba gratis 7 días + tabla de beneficios
 */
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Check, ArrowRight, Clock, Star, Lock, Users, Zap } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Precios y Planes | ManoProtect – Desde 9,99€/mes</title>
        <meta name="description" content="Planes de suscripción ManoProtect: mensual 9,99€/mes o anual 99,99€/año. Dispositivo Sentinel GRATIS incluido. Prueba 7 días gratis sin compromiso." />
        <link rel="canonical" href="https://manoprotect.com/plans" />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-emerald-600">Volver al inicio</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white" data-testid="pricing-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full mb-4">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">OFERTA POR TIEMPO LIMITADO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4" data-testid="pricing-title">
            Protección familiar desde <span className="text-emerald-500">9,99€/mes</span>
          </h1>
          <p className="text-lg text-gray-500 mb-2">Dispositivo Sentinel GRATIS incluido con cualquier plan</p>
          <p className="text-emerald-600 font-semibold">Prueba 7 días gratis – Sin compromiso</p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 bg-white" data-testid="pricing-plans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow" data-testid="plan-mensual">
              <h3 className="font-bold text-gray-900 text-xl mb-1">Plan Mensual</h3>
              <p className="text-gray-500 text-sm mb-6">Cancela cuando quieras</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-gray-900">9,99€</span>
                <span className="text-gray-400 text-lg">/mes</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                {[
                  'GPS en tiempo real 24/7',
                  'Alertas SOS instantáneas',
                  'Hasta 5 familiares',
                  'Zonas seguras ilimitadas',
                  'Historial de ubicaciones',
                  'Notificaciones push',
                  'Dispositivo Sentinel GRATIS',
                  'Soporte 24/7',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/registro')}
                className="block w-full text-center py-4 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                data-testid="plan-mensual-cta"
              >
                Probar gratis ahora
              </button>
            </div>

            {/* Annual Plan - Recommended */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-8 relative shadow-lg shadow-emerald-100" data-testid="plan-anual">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                MÁS POPULAR – Ahorra 20€
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-1">Plan Anual</h3>
              <p className="text-gray-500 text-sm mb-6">El más elegido por las familias</p>
              <div className="mb-1">
                <span className="text-5xl font-extrabold text-gray-900">99,99€</span>
                <span className="text-gray-400 text-lg">/año</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mb-6">Solo 8,33€/mes – Ahorra 19,89€ al año</p>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                {[
                  'Todo del Plan Mensual',
                  'GPS en tiempo real 24/7',
                  'Prioridad en soporte',
                  'Alertas por WhatsApp',
                  'Dispositivo Sentinel GRATIS',
                  'Envío prioritario GRATIS',
                  'Actualizaciones premium',
                  'Descuento en accesorios',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/registro')}
                className="block w-full text-center py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all"
                data-testid="plan-anual-cta"
              >
                Probar gratis ahora – Mejor precio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits table */}
      <section className="py-16 bg-slate-50" data-testid="pricing-benefits">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Todo lo que incluye tu suscripción</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 border-b">Beneficio</th>
                  <th className="p-4 text-center text-sm font-bold text-gray-600 border-b">Mensual</th>
                  <th className="p-4 text-center text-sm font-bold text-emerald-600 border-b">Anual</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['Localización GPS en tiempo real', true, true],
                  ['Alertas SOS ilimitadas', true, true],
                  ['Zonas seguras', true, true],
                  ['Historial de ubicaciones', true, true],
                  ['Notificaciones push', true, true],
                  ['Hasta 5 familiares', true, true],
                  ['Dispositivo Sentinel GRATIS', true, true],
                  ['Soporte 24/7', true, true],
                  ['Alertas por WhatsApp', false, true],
                  ['Envío prioritario', false, true],
                  ['Prioridad en soporte', false, true],
                  ['Descuento en accesorios', false, true],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[1] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-gray-300">—</span>}</td>
                    <td className="p-3 text-center border-b border-gray-100">{row[2] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-gray-300">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-12 bg-emerald-50 border-y border-emerald-100" data-testid="pricing-guarantee">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-3">Garantía de satisfacción</h2>
          <p className="text-gray-600 mb-6">
            Si en los primeros 7 días no estás satisfecho, <strong>te devolvemos el 100% del dinero</strong>. Sin preguntas, sin letras pequeñas.
          </p>
          <button
            onClick={() => navigate('/registro')}
            className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
            data-testid="pricing-guarantee-cta"
          >
            Probar gratis ahora <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Urgency */}
      <section className="py-16 bg-gray-900" data-testid="pricing-urgency">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Oferta por tiempo limitado</h2>
          <p className="text-gray-400 text-lg mb-8">Dispositivo Sentinel GRATIS con tu suscripción. Stock limitado.</p>
          <button
            onClick={() => navigate('/registro')}
            className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-10 py-5 rounded-xl hover:bg-emerald-400 transition-all text-lg shadow-xl shadow-emerald-500/20 hover:scale-105"
            data-testid="pricing-final-cta"
          >
            Probar gratis ahora <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-gray-500 text-sm mt-5">Sin compromiso – Cancela cuando quieras – Garantía 7 días</p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Pricing;
