/**
 * ManoProtect - Pagina de Precios Completa
 * Todos los productos: Alarmas Hogar/Negocio + Sentinel + Vecinal + Extras
 * Sistema de referidos universal: 1 mes gratis para ambos
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Check, ArrowRight, Clock, Home, Building2, Watch, Users, Crown, Gift, Star, Zap, Phone, Camera, Lock, ChevronDown } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const API = process.env.REACT_APP_BACKEND_URL;

const Pricing = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('alarmas-hogar');
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/ceo/promo-status`).then(r => r.json()).then(setPromo).catch(() => {});
  }, []);

  const promoLeft = promo?.promo_200_remaining ?? 200;
  const discount = promo?.discount_pct ?? 20;

  const tabs = [
    { id: 'alarmas-hogar', label: 'Alarmas Hogar', icon: Home },
    { id: 'alarmas-negocio', label: 'Alarmas Negocio', icon: Building2 },
    { id: 'sentinel', label: 'Sentinel SOS', icon: Watch },
    { id: 'vecinal', label: 'Escudo Vecinal', icon: Users },
    { id: 'extras', label: 'Extras', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="pricing-page">
      <Helmet>
        <title>Precios y Planes | ManoProtect – Alarmas desde 33,90 EUR/mes</title>
        <meta name="description" content="Todos los planes ManoProtect: Alarmas hogar desde 33,90 EUR, negocio desde 54,90 EUR, Sentinel SOS, Escudo Vecinal Premium. Instalacion GRATIS. SIN permanencia." />
        <link rel="canonical" href="https://manoprotect.com/plans" />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="tel:+34601510950" className="text-sm text-gray-500 hover:text-emerald-600 hidden sm:flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 601 510 950</a>
            <Link to="/" className="text-sm text-gray-500 hover:text-emerald-600">Inicio</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white" data-testid="pricing-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-1.5 rounded-full mb-4">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-600">OFERTA LANZAMIENTO – PRIMEROS {promoLeft} CON {discount}% DTO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3" data-testid="pricing-title">
            Todos los planes <span className="text-emerald-500">ManoProtect</span>
          </h1>
          <p className="text-base text-gray-500 mb-2">Instalacion GRATIS. SIN permanencia. Cancela cuando quieras.</p>
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full">
            <Gift className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">REFIERE Y GANA: 1 mes gratis para ti y para tu referido</span>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto gap-1 py-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${tab === t.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                data-testid={`tab-${t.id}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12" data-testid="pricing-content">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* ALARMAS HOGAR */}
          {tab === 'alarmas-hogar' && (
            <div data-testid="alarmas-hogar-plans">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Alarmas para viviendas</h2>
                <p className="text-gray-500 text-sm">Pisos, chalets, adosados y casas. Instalacion profesional GRATIS.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Essential */}
                <PlanCard
                  name="Essential" target="Pisos y apartamentos" promo={33.90} regular={44.90}
                  badge="MEJOR PRECIO" popular={false}
                  features={['Hub inteligente pantalla 7"', '2 camaras Full HD + vision nocturna', '3 sensores PIR anti-mascotas', '2 contactos magneticos', 'Sirena exterior 110dB', 'Centro control 24h (CRA)', 'Verificacion video IA', 'App completa + anti-inhibicion', '1 Sentinel X de REGALO', 'Refiere = 1 mes GRATIS']}
                  cta="Solicitar Essential" onClick={() => navigate('/contacto')}
                  testId="plan-essential"
                />
                {/* Premium */}
                <PlanCard
                  name="Premium" target="Chalets, adosados y casas" promo={44.90} regular={54.90}
                  badge="MAS VENDIDO" popular={true}
                  features={['Hub Pro pantalla 10" HD', '4 camaras 2K + 2 PTZ exterior 360', '6 sensores PIR + 4 magneticos', 'Detector humo + CO2 + inundacion', '2 sirenas 120dB + teclado RFID', 'CRA Premium + Servicio Acuda', 'Grabacion nube 30 dias', 'Anti-inhibicion 17 frecuencias', '2 Sentinel X de REGALO', 'Refiere = 1 mes GRATIS']}
                  cta="Solicitar Premium" onClick={() => navigate('/contacto')}
                  testId="plan-premium"
                />
              </div>
              <p className="text-center text-sm text-gray-400 mt-6">6 primeros meses precio promo. Instalacion profesional GRATIS. SIN permanencia.</p>
              <div className="text-center mt-4">
                <Link to="/alarmas/vivienda" className="text-emerald-600 text-sm font-bold hover:underline">Ver detalle completo de equipamiento →</Link>
              </div>
            </div>
          )}

          {/* ALARMAS NEGOCIO */}
          {tab === 'alarmas-negocio' && (
            <div data-testid="alarmas-negocio-plans">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Alarmas para negocios</h2>
                <p className="text-gray-500 text-sm">Locales, naves, oficinas y franquicias. Instalacion profesional GRATIS.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Comercio */}
                <PlanCard
                  name="Comercio" target="Tiendas, locales y restaurantes" promo={54.90} regular={69.90}
                  badge="POPULAR" popular={false}
                  features={['Hub Enterprise pantalla 10"', '6 camaras IP 4K con IA', '2 PTZ exterior 360 IP67', 'Control acceso biometrico', 'Detectores humo + CO2 + gas', 'CRA Enterprise 24h', 'Servicio Acuda prioritario', 'App Business multi-sede', '2 Sentinel X de REGALO', 'Refiere un negocio = 1 mes GRATIS']}
                  cta="Solicitar Comercio" onClick={() => navigate('/contacto')}
                  testId="plan-comercio"
                />
                {/* Empresa */}
                <PlanCard
                  name="Empresa" target="Naves, oficinas y franquicias" promo={74.90} regular={89.90}
                  badge="SEGURIDAD TOTAL" popular={true}
                  features={['Doble Hub redundante + backup 48h', '10 camaras 4K + 4 PTZ exterior', 'Videoportero reconocimiento facial', 'Control biometrico + RFID empleados', 'Grabacion nube 90 dias', 'CRA Enterprise Premium + Acuda 10min', 'Custodia de llaves', 'Mantenimiento preventivo trimestral', '3 Sentinel X REGALO', 'Gestion multi-sede completa', 'Refiere un negocio = 1 mes GRATIS']}
                  cta="Solicitar Empresa" onClick={() => navigate('/contacto')}
                  testId="plan-empresa"
                />
              </div>
              <p className="text-center text-sm text-gray-400 mt-6">6 primeros meses precio promo. Instalacion profesional GRATIS. SIN permanencia.</p>
              <div className="text-center mt-4">
                <Link to="/alarmas/negocio" className="text-emerald-600 text-sm font-bold hover:underline">Ver detalle completo de equipamiento →</Link>
              </div>
            </div>
          )}

          {/* SENTINEL */}
          {tab === 'sentinel' && (
            <div data-testid="sentinel-plans">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sentinel SOS - Dispositivos wearables</h2>
                <p className="text-gray-500 text-sm">Relojes y dispositivos de emergencia. Funcionan de forma independiente.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Sentinel X */}
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-all" data-testid="sentinel-x-card">
                  <div className="text-center mb-4">
                    <div className="text-xs text-emerald-400 font-bold mb-2">SENTINEL X</div>
                    <h3 className="text-white font-bold text-xl mb-1">Smartwatch SOS</h3>
                    <p className="text-gray-400 text-xs">GPS + SOS + caidas + llamadas</p>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-black text-white">199</span>
                    <span className="text-gray-500 text-sm">EUR</span>
                    <span className="text-gray-600 text-xs line-through ml-2">249 EUR</span>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-emerald-400 text-xs font-bold">+ Plan desde 9,99 EUR/mes</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {['GPS tiempo real 24/7', 'Boton SOS emergencia', 'Deteccion caidas auto', 'Llamadas y mensajes', 'Zonas seguras', 'App familiar completa', 'Refiere = 1 mes GRATIS'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-300"><Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Link to="/sentinel-x" className="block w-full text-center py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm transition-colors" data-testid="cta-sentinel-x">Ver Sentinel X</Link>
                </div>

                {/* Sentinel J */}
                <div className="bg-white rounded-2xl p-6 border-2 border-pink-200 hover:border-pink-400 transition-all" data-testid="sentinel-j-card">
                  <div className="text-center mb-4">
                    <div className="text-xs text-pink-500 font-bold mb-2">SENTINEL J</div>
                    <h3 className="text-gray-900 font-bold text-xl mb-1">Junior SOS</h3>
                    <p className="text-gray-400 text-xs">Para ninos y adolescentes</p>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-black text-gray-900">79</span>
                    <span className="text-gray-500 text-sm">EUR</span>
                    <span className="text-gray-400 text-xs line-through ml-2">99 EUR</span>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-pink-500 text-xs font-bold">+ Plan desde 9,99 EUR/mes</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {['GPS para padres tranquilos', 'Boton panico silencioso', 'Geovallas colegio/casa', 'Llamadas pre-configuradas', 'Resistente agua y golpes', 'Bateria 3 dias', 'Refiere = 1 mes GRATIS'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-700"><Check className="w-3 h-3 text-pink-500 flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Link to="/sentinel-j" className="block w-full text-center py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-xl text-sm transition-colors" data-testid="cta-sentinel-j">Ver Sentinel J</Link>
                </div>

                {/* Sentinel S */}
                <div className="bg-gradient-to-b from-[#FAFAF8] to-white rounded-2xl p-6 border-2 border-[#B4A7D6]/30 hover:border-[#B4A7D6] transition-all" data-testid="sentinel-s-card">
                  <div className="text-center mb-4">
                    <div className="text-xs text-[#8B7CB8] font-bold mb-2">SENTINEL S</div>
                    <h3 className="text-gray-900 font-bold text-xl mb-1">Senior SOS</h3>
                    <p className="text-gray-400 text-xs">Para personas mayores</p>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-black text-gray-900">103</span>
                    <span className="text-gray-500 text-sm">EUR</span>
                    <span className="text-gray-400 text-xs line-through ml-2">129 EUR</span>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-[#8B7CB8] text-xs font-bold">+ Plan desde 9,99 EUR/mes</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {['Boton SOS grande y claro', 'Deteccion caidas automatica', 'GPS y localizacion 24/7', 'Interfaz simplificada', 'Recordatorios medicacion', 'Sin pantalla = sin confusiones', 'Refiere = 1 mes GRATIS'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-700"><Check className="w-3 h-3 text-[#8B7CB8] flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Link to="/sentinel-s" className="block w-full text-center py-3 bg-[#2D2A33] hover:bg-[#3D3A43] text-white font-bold rounded-xl text-sm transition-colors" data-testid="cta-sentinel-s">Ver Sentinel S</Link>
                </div>
              </div>

              {/* Sentinel subscription plans */}
              <div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 text-center mb-6">Planes de suscripcion Sentinel</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'Basic', price: '9,99', features: ['GPS tiempo real', 'Alertas SOS', 'App basica', 'Hasta 2 contactos'], testId: 'sentinel-basic' },
                    { name: 'Plus', price: '14,99', popular: true, features: ['Todo de Basic', 'GPS 24/7 + historial', 'Alertas familiares', 'Deteccion caidas', 'Hasta 5 contactos'], testId: 'sentinel-plus' },
                    { name: 'Pro', price: '24,99', features: ['Todo de Plus', 'Monitorizacion CRA 24/7', 'Servicio Acuda', 'Geovallas ilimitadas', 'Soporte prioritario'], testId: 'sentinel-pro' },
                  ].map(p => (
                    <div key={p.name} className={`bg-white rounded-xl p-5 ${p.popular ? 'border-2 border-emerald-500 ring-2 ring-emerald-100' : 'border border-gray-200'}`} data-testid={p.testId}>
                      {p.popular && <div className="text-center text-xs font-bold text-emerald-600 mb-2">MAS POPULAR</div>}
                      <h4 className="font-bold text-gray-900 text-center">{p.name}</h4>
                      <div className="text-center my-3">
                        <span className="text-2xl font-black text-gray-900">{p.price}</span>
                        <span className="text-gray-500 text-sm"> EUR/mes</span>
                      </div>
                      <ul className="space-y-1.5">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600"><Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{f}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="text-center text-gray-400 text-xs mt-4">El plan se contrata junto al dispositivo. Paga anual = 10 meses, llevate 12.</p>
              </div>
            </div>
          )}

          {/* VECINAL */}
          {tab === 'vecinal' && (
            <div data-testid="vecinal-plans">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Escudo Vecinal Premium</h2>
                <p className="text-gray-500 text-sm">Proteccion comunitaria contra okupaciones y robos. Plan INDEPENDIENTE.</p>
              </div>
              <div className="max-w-lg mx-auto">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-amber-500/30 relative overflow-hidden" data-testid="plan-vecinal">
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-black px-4 py-1 rounded-bl-xl">SOLO ANUAL</div>
                  <div className="absolute top-0 left-0 bg-emerald-500 text-white text-xs font-black px-4 py-1 rounded-br-xl">INDEPENDIENTE</div>
                  <div className="text-center mt-6 mb-6">
                    <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-1">Escudo Vecinal Premium</h3>
                    <p className="text-gray-400 text-xs">No necesitas ningun otro producto de ManoProtect</p>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-5xl font-black text-white">299,99</span>
                    <span className="text-gray-400 text-lg ml-1">EUR/ano</span>
                    <p className="text-emerald-400 text-sm font-bold mt-1">Solo 25 EUR/mes equivalente</p>
                    <p className="text-amber-400/70 text-xs mt-1">Por unidad familiar - ilimitadas familias en tu barrio</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {['Panel Vecinal 24/7 en tiempo real', 'Alertas okupacion, robos, intrusiones', 'Red de vigilancia vecinal coordinada', 'Mapa de incidencias del barrio', 'Notificaciones push instantaneas', 'Estadisticas de seguridad', 'Sistema de referidos: trae vecino = 1 mes gratis', 'Soporte prioritario 24/7', 'Sin permanencia - cancela cuando quieras'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Link to="/panel-vecinal" className="block w-full text-center py-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white font-black text-base hover:shadow-xl transition-all" data-testid="cta-vecinal">
                    Contratar Escudo Vecinal
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* EXTRAS */}
          {tab === 'extras' && (
            <div data-testid="extras-plans">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Componentes y extras</h2>
                <p className="text-gray-500 text-sm">Amplia tu sistema con dispositivos adicionales. Compatibles con todos los planes.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Camara IP Full HD', price: '89', desc: 'Vision nocturna, audio bidireccional, deteccion movimiento', icon: Camera },
                  { name: 'Camara PTZ 4K exterior', price: '149', desc: '360 grados, zoom 30x, IP67, IA deteccion personas', icon: Camera },
                  { name: 'Sensor PIR anti-mascotas', price: '39', desc: 'Deteccion movimiento, ignora hasta 25kg, 12m alcance', icon: Zap },
                  { name: 'Contacto magnetico', price: '29', desc: 'Puerta/ventana, ultra-fino, adhesivo, bateria 2 anos', icon: Lock },
                  { name: 'Sirena exterior 120dB', price: '79', desc: 'Flash LED, resistente IP65, bateria backup', icon: Zap },
                  { name: 'Detector humo + CO2', price: '59', desc: 'Alerta inmediata, certificado EN 14604', icon: Zap },
                  { name: 'Detector inundacion', price: '45', desc: 'Detecta fugas al instante, cable sensor 2m', icon: Zap },
                  { name: 'Mando premium extra', price: '35', desc: 'Boton panico, arma/desarma, 3 acabados', icon: Zap },
                  { name: 'Teclado RFID + codigo', price: '69', desc: 'Codigo + tarjeta + boton coaccion silencioso', icon: Lock },
                  { name: 'Control biometrico', price: '129', desc: 'Huella dactilar + RFID, gestion empleados', icon: Lock },
                  { name: 'Sentinel X extra', price: '199', desc: 'Smartwatch SOS adicional para otro familiar', icon: Watch },
                  { name: 'Sentinel J extra', price: '79', desc: 'Reloj junior SOS para ninos', icon: Watch },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all" data-testid={`extra-${i}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                          <span className="text-emerald-600 font-black text-lg">{item.price} EUR</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-400 text-xs mt-6">Precios con IVA incluido. Instalacion de componentes extras: GRATIS si se contrata con un plan.</p>
            </div>
          )}
        </div>
      </section>

      {/* Referral Banner */}
      <section className="py-12 bg-emerald-50 border-y border-emerald-100" data-testid="referral-banner">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Gift className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-3">Sistema de referidos: 1 mes GRATIS</h2>
          <p className="text-gray-600 text-sm mb-2">
            Recomienda ManoProtect a un amigo, familiar o vecino. Cuando contrate cualquier plan, 
            <strong className="text-emerald-700"> ambos recibis 1 mes gratis</strong>.
          </p>
          <p className="text-gray-500 text-xs mb-4">Funciona con todos los productos: alarmas, Sentinel y Escudo Vecinal. Sin limite de referidos.</p>
          <div className="inline-flex items-center gap-3 bg-white border border-emerald-200 rounded-xl px-5 py-3 shadow-sm">
            <span className="text-gray-500 text-xs">Tu codigo se genera al contratar</span>
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-emerald-700 text-xs font-bold">Comparte por WhatsApp, email o en persona</span>
          </div>
        </div>
      </section>

      {/* Comparison with competitors */}
      <section className="py-12 bg-gray-50" data-testid="comparison-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">ManoProtect vs la competencia</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left font-bold text-gray-900 border-b">Caracteristica</th>
                  <th className="p-3 text-center font-bold text-emerald-600 border-b">ManoProtect</th>
                  <th className="p-3 text-center font-bold text-gray-500 border-b">Securitas Direct</th>
                  <th className="p-3 text-center font-bold text-gray-500 border-b">Prosegur</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Desde (hogar)', '33,90 EUR/mes', '29,90 EUR/mes', '39,90 EUR/mes'],
                  ['Instalacion', 'GRATIS', 'Gratis (promo)', 'Gratis (promo)'],
                  ['Permanencia', 'SIN permanencia', '24 meses', 'Variable'],
                  ['Sentinel SOS incluido', true, false, false],
                  ['Escudo Vecinal comunitario', true, false, false],
                  ['Panel Vecinal Premium', true, false, false],
                  ['Referidos: 1 mes gratis', true, false, false],
                  ['App multi-dispositivo', true, true, true],
                  ['Anti-inhibicion avanzada', true, true, true],
                  ['Servicio Acuda', true, true, true],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900 border-b border-gray-100">{row[0]}</td>
                    {[1, 2, 3].map(j => (
                      <td key={j} className="p-3 text-center border-b border-gray-100">
                        {row[j] === true ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> :
                         row[j] === false ? <span className="text-gray-300">—</span> :
                         <span className={j === 1 ? 'font-bold text-emerald-600' : 'text-gray-500'}>{row[j]}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-900" data-testid="final-cta">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Protege lo que mas importa</h2>
          <p className="text-gray-400 text-sm mb-8">Instalacion GRATIS. SIN permanencia. Sentinel SOS de regalo. Sistema de referidos: 1 mes gratis.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contacto" className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all" data-testid="final-cta-contact">
              Pedir presupuesto GRATIS <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="tel:+34601510950" className="inline-flex items-center justify-center gap-2 border border-gray-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition-all" data-testid="final-cta-phone">
              <Phone className="w-4 h-4" /> 601 510 950
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

function PlanCard({ name, target, promo, regular, badge, popular, features, cta, onClick, testId }) {
  return (
    <div className={`bg-white rounded-2xl p-8 relative ${popular ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-100' : 'border-2 border-gray-200 hover:shadow-lg'} transition-all`} data-testid={testId}>
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap ${popular ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{badge}</div>
      )}
      <h3 className="font-bold text-gray-900 text-xl mt-2 mb-1">{name}</h3>
      <p className="text-gray-500 text-sm mb-5">{target}</p>
      <div className="mb-1">
        <span className="text-4xl font-extrabold text-gray-900">{promo.toFixed(2).replace('.', ',')} EUR</span>
        <span className="text-gray-400 text-sm">/mes</span>
      </div>
      <p className="text-orange-500 text-xs font-bold mb-1">6 primeros meses (despues {regular.toFixed(2).replace('.', ',')} EUR/mes)</p>
      <p className="text-emerald-600 text-xs font-bold mb-6">Instalacion profesional GRATIS</p>
      <ul className="space-y-2.5 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><Check className={`w-4 h-4 flex-shrink-0 ${f.includes('GRATIS') || f.includes('Refiere') ? 'text-emerald-500' : 'text-emerald-400'}`} />{f.includes('Refiere') ? <span className="text-emerald-700 font-bold">{f}</span> : f}</li>
        ))}
      </ul>
      <button onClick={onClick}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${popular ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}
        data-testid={`${testId}-cta`}>
        {cta} <ArrowRight className="w-4 h-4 inline ml-1" />
      </button>
    </div>
  );
}

export default Pricing;
