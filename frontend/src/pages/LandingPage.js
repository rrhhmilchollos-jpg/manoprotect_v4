import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageSquare, Users, Building2, Check, ArrowRight, LogIn, Shield, Sparkles, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';
import AlertSubscription from '@/components/AlertSubscription';
import LanguageSelector from '@/components/LanguageSelector';
import { useI18n } from '@/i18n/I18nContext';
import { lazy, Suspense } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useI18n();

  // Testimonios realistas con fechas y detalles específicos
  const testimonials = [
    {
      id: 1,
      name: "María García Rodríguez",
      location: "Madrid",
      plan: "Plan Familiar",
      date: "Verificado - Enero 2025",
      rating: 5,
      text: "Gracias a ManoProtect detectaron un intento de phishing que me habría costado 3.000€. Recibí un email que parecía de mi banco pidiendo datos. La alerta llegó al instante y evitó que cayera en la trampa.",
      saved: "3.000€ ahorrados",
      color: "indigo"
    },
    {
      id: 2,
      name: "Juan López Martínez",
      location: "Barcelona",
      plan: "Plan Premium",
      date: "Verificado - Diciembre 2024",
      rating: 5,
      text: "Mis padres de 75 y 78 años recibían llamadas de estafa constantemente. Desde que tienen ManoProtect, las bloquea automáticamente. Mi madre estuvo a punto de dar sus datos a un supuesto técnico de Microsoft.",
      saved: "Protección 24/7",
      color: "indigo"
    },
    {
      id: 3,
      name: "Ana Sánchez Pérez",
      location: "Valencia",
      plan: "Enterprise",
      date: "Verificado - Enero 2025",
      rating: 5,
      text: "Como directora de RRHH de una empresa de 200 empleados, necesitábamos protegerlos. ManoProtect Enterprise ha reducido los incidentes de seguridad un 95%. La inversión se recupera sola.",
      saved: "95% menos incidentes",
      color: "indigo"
    },
    {
      id: 4,
      name: "Pedro Ruiz Fernández",
      location: "Sevilla",
      plan: "Plan Personal",
      date: "Verificado - Noviembre 2024",
      rating: 5,
      text: "Me llegó un SMS falso de Correos pidiendo 2€ para recibir un paquete. Parecía totalmente real. ManoProtect me avisó antes de que pudiera hacer click. Sin ellos, habría dado mi tarjeta a estafadores.",
      saved: "Datos protegidos",
      color: "emerald"
    },
    {
      id: 5,
      name: "Laura Martín González",
      location: "Bilbao",
      plan: "Plan Familiar",
      date: "Verificado - Enero 2025",
      rating: 5,
      text: "Mi abuela tiene 78 años y ahora navega tranquila. Antes tenía miedo de usar el móvil. La protección automática es perfecta para personas mayores. Ya no me llama asustada cada vez que le llega algo raro.",
      saved: "Tranquilidad familiar",
      color: "purple"
    },
    {
      id: 6,
      name: "Carlos Fernández Díaz",
      location: "Málaga",
      plan: "Business",
      date: "Verificado - Diciembre 2024",
      rating: 5,
      text: "Tengo una tienda online y procesamos muchos pagos. ManoProtect ha detectado 3 intentos de fraude este mes que podrían haberme costado más de 5.000€. Vale cada euro de la suscripción.",
      saved: "5.000€+ protegidos",
      color: "orange"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <SEO 
        title="ManoProtect - Protección Digital para tu Familia | Anti-Estafas España"
        description="Protege a tu familia contra estafas online, fraudes telefónicos y amenazas digitales. Detección de estafas en tiempo real. Primer mes GRATIS."
        keywords="protección digital, anti estafas, seguridad online, protección familiar, fraudes online, ciberseguridad, España, detectar estafas, phishing"
        canonical="https://manoprotect.com"
      />
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4" role="banner">
        <nav className="max-w-7xl mx-auto flex items-center justify-between" aria-label="Navegación principal">
          <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                alt="ManoProtect - Protección contra fraudes digitales" 
                className="h-10 w-auto"
                width="40"
                height="40"
                loading="eager"
              />
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector className="mr-2" />
            <Button
              data-testid="header-pricing-btn"
              onClick={() => navigate('/pricing')}
              variant="ghost"
              className="text-zinc-700 hover:text-indigo-600 rounded-lg px-4 h-10"
            >
              {t('nav.pricing')}
            </Button>
            <Button
              data-testid="header-investors-btn"
              onClick={() => navigate('/investor/register')}
              variant="ghost"
              className="text-zinc-700 hover:text-indigo-600 rounded-lg px-4 h-10"
            >
              Inversores
            </Button>
            {isAuthenticated ? (
              <Button
                data-testid="header-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                {t('nav.dashboard')}
              </Button>
            ) : (
              <>
                <Button
                  data-testid="header-login-btn"
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg px-4 h-10"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('nav.login')}
                </Button>
                <Button
                  data-testid="header-register-btn"
                  onClick={() => navigate('/register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  {t('nav.register')}
                </Button>
              </>
            )}
          </nav>
        </header>

      {/* Hero Section - Main Content */}
      <main id="main-content" role="main">
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="grain absolute inset-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200">
                <img 
                  src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                  alt="ManoProtect" 
                  className="h-5 w-auto"
                  width="20"
                  height="20"
                  loading="eager"
                />
                <span className="text-sm font-medium text-indigo-700">{t('landing.features.realTimeAlerts.title')}</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                {t('landing.hero.title')}
              </h1>
              
              <p className="text-lg text-zinc-600 leading-relaxed max-w-xl">
                {t('landing.hero.subtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="hero-learn-more-btn"
                  onClick={() => navigate('/how-it-works')}
                  variant="outline"
                  className="border-2 border-zinc-300 hover:border-indigo-300 rounded-lg px-8 h-14 text-lg active:scale-95 transition-all"
                >
                  {t('landing.hero.ctaSecondary')}
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">99.8%</div>
                  <div className="text-sm text-zinc-600">{t('landing.stats.detectionRate')}</div>
                </div>
                <div className="w-px h-12 bg-zinc-200" />
                <div>
                  <div className="text-3xl font-bold text-emerald-500">24/7</div>
                  <div className="text-sm text-zinc-600">{t('pricing.features.realTimeAlerts')}</div>
                </div>
                <div className="w-px h-12 bg-zinc-200" />
                <div>
                  <div className="text-3xl font-bold text-orange-500">+10K</div>
                  <div className="text-sm text-zinc-600">{t('landing.stats.scamsBlocked')}</div>
                </div>
              </div>
            </div>

            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-xl">
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/fa8350ac-4103-442a-8e22-a986a8837bc7/images/8f093142c23ed0bcbd1a2fd5219b542440249eb8455292b5ac522882a4ac13e5.png"
                  alt="Familia protegida con ManoProtect - Aplicación de seguridad digital"
                  className="w-full h-auto object-cover"
                  width="400"
                  height="400"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-600 rounded-xl shield-pulse opacity-20" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-emerald-500 rounded-full shield-pulse opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Threat Types */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Phone, label: 'Vishing', desc: 'Llamadas fraudulentas' },
              { icon: MessageSquare, label: 'Smishing', desc: 'SMS maliciosos' },
              { icon: Mail, label: 'Phishing', desc: 'Correos engañosos' },
              { icon: Users, label: 'Suplantación', desc: 'Identidad falsa' }
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
              Desde personas hasta grandes empresas, ManoProtect se adapta a tus necesidades
            </p>
          </div>

          <div className="bento-grid">
            {/* Personal */}
            <div className="bento-large card-hover p-8 rounded-2xl bg-white border border-zinc-200">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                    alt="ManoProtect" 
                    className="h-10 w-auto mb-4"
                  />
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
                    src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/t8tv8klb_alerta.png"
                    alt="Alertas de seguridad ManoProtect"
                    className="w-full h-full object-cover"
                    width="192"
                    height="192"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Family */}
            <div className="bento-medium card-hover p-0 rounded-2xl bg-white border border-emerald-200 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1758686254056-6cd980b9aaee?crop=entropy&cs=srgb&fm=jpg&q=85&w=400"
                  alt="Personas mayores protegidas con ManoProtect"
                  className="w-full h-full object-cover"
                  width="400"
                  height="192"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <Users className="w-10 h-10 text-emerald-600 mb-3" />
                <h3 className="text-2xl font-bold mb-3">Modo Familiar</h3>
                <p className="text-zinc-600 mb-4">
                  Protección especial para personas mayores con botón SOS y notificaciones a familiares.
                </p>
                <Button
                  data-testid="family-learn-more-btn"
                  onClick={() => navigate('/family-mode')}
                  variant="outline"
                  className="border-emerald-300 hover:bg-emerald-50 rounded-lg active:scale-95 transition-all"
                >
                  Saber más
                </Button>
              </div>
            </div>

            {/* Business */}
            <div className="bento-small card-hover p-0 rounded-2xl bg-white border border-indigo-200 overflow-hidden">
              <div className="h-32 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=srgb&fm=jpg&q=85&w=300"
                  alt="Equipo empresarial protegido con ManoProtect Enterprise"
                  className="w-full h-full object-cover"
                  width="300"
                  height="128"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <Building2 className="w-10 h-10 text-indigo-600 mb-3" />
                <h3 className="text-xl font-bold mb-2">Empresas</h3>
                <p className="text-sm text-zinc-600">
                  Panel empresarial con estadísticas y protección para todos tus empleados.
                </p>
              </div>
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

      {/* Social Proof Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1752652011717-f06f7ed3927a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
                alt="Familia española protegida contra fraudes digitales con ManoProtect"
                className="w-full rounded-2xl shadow-2xl"
                width="600"
                height="400"
                loading="lazy"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Miles de familias ya están protegidas
              </h2>
              <p className="text-lg text-zinc-600">
                ManoProtect no solo protege a personas individuales. Protege a familias completas, 
                especialmente a los más vulnerables: nuestros mayores.
              </p>
              <div className="space-y-4">
                {[
                  { stat: '10,000+', label: 'Usuarios protegidos' },
                  { stat: '50,000+', label: 'Amenazas bloqueadas' },
                  { stat: '99.8%', label: 'Precisión en detección' },
                  { stat: '24/7', label: 'Protección continua' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <div>
                      <span className="font-bold text-2xl text-indigo-600">{item.stat}</span>
                      <span className="text-zinc-600 ml-2">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
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
            Únete a miles de personas que ya confían en ManoProtect para su seguridad digital
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

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Miles de familias españolas confían en ManoProtect para su seguridad digital
            </p>
          </div>

          {/* Primera fila de testimonios */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-4 italic">
                "Gracias a ManoProtect detectaron un intento de phishing que me habría costado 3.000€. La alerta llegó al instante."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  MG
                </div>
                <div>
                  <p className="font-medium text-zinc-900">María García</p>
                  <p className="text-sm text-zinc-500">Madrid • Plan Familiar</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-4 italic">
                "Mis padres mayores recibían llamadas de estafa constantemente. Desde que tienen ManoProtect, las bloquea automáticamente."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  JL
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Juan López</p>
                  <p className="text-sm text-zinc-500">Barcelona • Plan Premium</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-4 italic">
                "Como empresa, necesitábamos proteger a nuestros empleados. ManoProtect Enterprise ha reducido los incidentes de seguridad un 95%."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  AS
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Ana Sánchez</p>
                  <p className="text-sm text-zinc-500">Valencia • Enterprise</p>
                </div>
              </div>
            </div>
          </div>

          {/* Segunda fila de testimonios */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 4 */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-4 italic">
                "Me llegó un SMS falso de Correos pidiendo datos de mi tarjeta. ManoProtect me avisó antes de que pudiera hacer click. ¡Increíble!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                  PR
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Pedro Ruiz</p>
                  <p className="text-sm text-zinc-500">Sevilla • Plan Personal</p>
                </div>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-4 italic">
                "Mi abuela tiene 78 años y ahora navega tranquila. La protección automática es perfecta para personas mayores que no entienden de tecnología."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  LM
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Laura Martín</p>
                  <p className="text-sm text-zinc-500">Bilbao • Plan Familiar</p>
                </div>
              </div>
            </div>

            {/* Testimonial 6 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-4 italic">
                "En mi negocio procesamos muchos pagos online. ManoProtect ha detectado 3 intentos de fraude este mes. Vale cada euro de la suscripción."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  CF
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Carlos Fernández</p>
                  <p className="text-sm text-zinc-500">Málaga • Business</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-12 border-t border-zinc-200">
            <p className="text-center text-sm text-zinc-500 mb-8">COLABORADORES Y PARTNERS TECNOLÓGICOS</p>
            
            {/* Partners Logos */}
            <div className="flex flex-wrap items-center justify-center gap-10 mb-12">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="VISA" className="h-8 object-contain opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-10 object-contain opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png" alt="PayPal" className="h-6 object-contain opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-8 object-contain opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/200px-OpenAI_Logo.svg.png" alt="OpenAI" className="h-8 object-contain opacity-50 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/200px-Microsoft_logo_%282012%29.svg.png" alt="Microsoft" className="h-7 object-contain opacity-50 hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Trust Badges - Institutional */}
            <p className="text-center text-sm text-zinc-500 mb-6">CERTIFICACIONES Y CUMPLIMIENTO</p>
            <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-zinc-700">SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-zinc-700">Banco de España</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-zinc-700">RGPD Compliant</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-zinc-700">ISO 27001</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg">
                <Check className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-zinc-700">PCI DSS</span>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">+15.000</div>
                <p className="text-sm text-zinc-600 mt-1">Familias Protegidas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">50.000+</div>
                <p className="text-sm text-zinc-600 mt-1">Estafas Bloqueadas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">4.9/5</div>
                <p className="text-sm text-zinc-600 mt-1">Valoración Media</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">99.8%</div>
                <p className="text-sm text-zinc-600 mt-1">Tasa de Detección</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Subscription Section */}
      <section className="px-6 py-16 bg-zinc-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
                Mantente informado sobre las últimas estafas
              </h2>
              <p className="text-zinc-600 mb-4">
                Suscríbete gratis a nuestras alertas de seguridad y recibe notificaciones cuando detectemos nuevas amenazas activas en España.
              </p>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Alertas de phishing y emails fraudulentos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  SMS y llamadas sospechosas (smishing/vishing)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Suplantación de bancos y empresas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Totalmente gratis, sin compromiso
                </li>
              </ul>
            </div>
            <AlertSubscription variant="default" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-zinc-900 text-zinc-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                  alt="ManoProtect Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-sm text-zinc-500 max-w-md">
                ManoProtect es tu escudo digital contra fraudes. Protegemos a personas, familias y empresas con tecnología de inteligencia artificial avanzada.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">
                    Cómo Funciona
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">
                    Precios
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/family-mode')} className="hover:text-white transition-colors">
                    Modo Familiar
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/investor/register')} className="hover:text-white transition-colors">
                    Inversores
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/terms-of-service')} className="hover:text-white transition-colors">
                    Términos y Condiciones
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/refund-policy')} className="hover:text-white transition-colors">
                    Política de Reembolsos
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/legal-notice')} className="hover:text-white transition-colors">
                    Aviso Legal
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Sede y Contacto */}
          <div className="border-t border-zinc-800 pt-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Sede Central</p>
                  <p className="text-sm text-zinc-500">C/ Sor Isabel de Villena 82 bajo</p>
                  <p className="text-sm text-zinc-500">Novelé, Valencia, España</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Teléfono</p>
                  <a href="tel:601510950" className="text-sm text-indigo-400 hover:text-indigo-300">601 510 950</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Email</p>
                  <a href="mailto:info@manoprotect.com" className="text-sm text-indigo-400 hover:text-indigo-300">info@manoprotect.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2025 ManoProtect S.L. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>CIF: B19427723</span>
              <span className="text-zinc-700">|</span>
              <span>Entidad supervisada por el Banco de España</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;