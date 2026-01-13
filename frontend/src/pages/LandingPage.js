import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, Mail, MessageSquare, Users, Building2, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold tracking-tight">MANO</span>
          </div>
          <Button
            data-testid="header-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            Acceder al Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="grain absolute inset-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Protección en Tiempo Real</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Tu mano protectora contra
                <span className="block text-indigo-600 mt-2">fraudes digitales</span>
              </h1>
              
              <p className="text-lg text-zinc-600 leading-relaxed max-w-xl">
                MANO detecta y bloquea amenazas antes de que lleguen a ti. Protege a tu familia, tu empresa y tu tranquilidad con inteligencia artificial avanzada.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="hero-cta-btn"
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 h-14 text-lg shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  Probar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  data-testid="hero-learn-more-btn"
                  variant="outline"
                  className="border-2 border-zinc-300 hover:border-indigo-300 rounded-lg px-8 h-14 text-lg active:scale-95 transition-all"
                >
                  Cómo Funciona
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">99.8%</div>
                  <div className="text-sm text-zinc-600">Detección</div>
                </div>
                <div className="w-px h-12 bg-zinc-200" />
                <div>
                  <div className="text-3xl font-bold text-emerald-500">24/7</div>
                  <div className="text-sm text-zinc-600">Protección</div>
                </div>
                <div className="w-px h-12 bg-zinc-200" />
                <div>
                  <div className="text-3xl font-bold text-orange-500">+10K</div>
                  <div className="text-sm text-zinc-600">Amenazas Bloqueadas</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1752652011717-f06f7ed3927a?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Familia protegida usando dispositivos seguros"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-600 rounded-2xl shield-pulse opacity-20" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-500 rounded-full shield-pulse opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Threat Types */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Qué detecta MANO?</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Protección completa contra todas las amenazas digitales modernas
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Phone, label: 'Vishing', desc: 'Llamadas fraudulentas' },
              { icon: MessageSquare, label: 'Smishing', desc: 'SMS maliciosos' },
              { icon: Mail, label: 'Phishing', desc: 'Correos engañosos' },
              { icon: Shield, label: 'Suplantación', desc: 'Identidad falsa' }
            ].map((item, idx) => (
              <div
                key={idx}
                data-testid={`threat-type-${item.label.toLowerCase()}`}
                className="card-hover p-6 rounded-xl bg-zinc-50 border border-zinc-200 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.label}</h3>
                <p className="text-sm text-zinc-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segments - Bento Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Protección para todos</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Desde personas hasta grandes empresas, MANO se adapta a tus necesidades
            </p>
          </div>

          <div className="bento-grid">
            {/* Personal */}
            <div className="bento-large card-hover p-8 rounded-2xl bg-white border border-zinc-200">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <Shield className="w-10 h-10 text-indigo-600 mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Para Personas</h3>
                  <p className="text-zinc-600 mb-6">
                    Detección automática de amenazas en llamadas, SMS, WhatsApp y correos. Bloqueo inteligente y alertas en tiempo real.
                  </p>
                  <ul className="space-y-2">
                    {['Análisis en tiempo real', 'Bloqueo automático', 'Historial de amenazas'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-48 h-48 rounded-xl overflow-hidden hidden lg:block">
                  <img
                    src="https://images.unsplash.com/photo-1758686254056-6cd980b9aaee?crop=entropy&cs=srgb&fm=jpg&q=85"
                    alt="Persona protegida"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Family */}
            <div className="bento-medium card-hover p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
              <Users className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Modo Familiar</h3>
              <p className="text-zinc-600 mb-4">
                Protección especial para personas mayores con botón SOS y notificaciones a familiares.
              </p>
              <Button
                data-testid="family-learn-more-btn"
                variant="outline"
                className="border-emerald-300 hover:bg-emerald-50 rounded-lg active:scale-95 transition-all"
              >
                Saber más
              </Button>
            </div>

            {/* Business */}
            <div className="bento-small card-hover p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200">
              <Building2 className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Empresas</h3>
              <p className="text-sm text-zinc-600">
                Panel empresarial con estadísticas y protección para todos tus empleados.
              </p>
            </div>

            <div className="bento-small card-hover p-8 rounded-2xl bg-zinc-900 text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-zinc-300">
                Monitoreo continuo y actualizaciones de amenazas en tiempo real
              </p>
            </div>

            <div className="bento-small card-hover p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">Freemium</div>
              <p className="text-sm text-zinc-600">
                Protección básica gratis. Premium con funciones avanzadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Protégete ahora. Es gratis.
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya confían en MANO para su seguridad digital
          </p>
          <Button
            data-testid="final-cta-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-white text-indigo-600 hover:bg-zinc-50 rounded-lg px-10 h-14 text-lg font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-zinc-900 text-zinc-400">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-white">MANO</span>
          </div>
          <p className="text-sm">
            Protección integral contra fraudes digitales © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;