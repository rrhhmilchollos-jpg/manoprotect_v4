/**
 * ManoProtect - Blog / Noticias de Seguridad
 * Casos reales de estafas y amenazas en España
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  AlertTriangle, Calendar, ArrowRight, Shield, Phone, Mail, 
  MessageSquare, Users, TrendingUp, ExternalLink, ChevronRight,
  Clock, Eye, Tag, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Noticias reales de estafas en España - Actualizar regularmente
const blogPosts = [
  {
    id: 1,
    slug: 'estafa-sms-correos-2025',
    title: 'Alerta: Nueva oleada de SMS falsos de Correos pide datos bancarios',
    excerpt: 'Miles de españoles reciben SMS fraudulentos haciéndose pasar por Correos. "Tu paquete está retenido, paga 1,99€ para recibirlo". La Policía advierte del aumento de estas estafas.',
    category: 'Smishing',
    categoryColor: 'bg-orange-500',
    date: '12 Feb 2025',
    readTime: '3 min',
    views: 12453,
    image: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&q=80',
    featured: true,
    tags: ['SMS', 'Correos', 'Phishing', 'España'],
    content: `
## La estafa del SMS de Correos

Desde principios de 2025, la Policía Nacional ha detectado un **aumento del 340%** en denuncias por estafas SMS relacionadas con empresas de paquetería.

### Cómo funciona:
1. Recibes un SMS: "CORREOS: Tu paquete está retenido. Paga 1,99€ de gastos de aduana"
2. El enlace te lleva a una web FALSA que imita a Correos
3. Te piden datos de tarjeta para "pagar"
4. Los estafadores vacían tu cuenta

### Señales de alerta:
- Correos NUNCA pide pagos por SMS
- El enlace no es correos.es (usan dominios extraños)
- Urgencia artificial ("tienes 24h")
- Errores ortográficos

### Qué hacer:
- NO hagas clic en el enlace
- Reporta el SMS al 017 (INCIBE)
- Si ya diste tus datos, llama a tu banco INMEDIATAMENTE

**ManoProtect detecta estos SMS automáticamente** y te avisa antes de que caigas.
    `
  },
  {
    id: 2,
    slug: 'vishing-banco-santander-bbva',
    title: 'Llamadas falsas del Banco Santander y BBVA: así roban miles de euros',
    excerpt: 'Los estafadores llaman haciéndose pasar por tu banco. Dicen que hay "movimientos sospechosos" y te piden las claves. Víctimas pierden hasta 50.000€.',
    category: 'Vishing',
    categoryColor: 'bg-red-500',
    date: '10 Feb 2025',
    readTime: '5 min',
    views: 8932,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    featured: true,
    tags: ['Llamadas', 'Bancos', 'Vishing', 'Santander', 'BBVA'],
    content: `
## El timo de la llamada del banco

Una mujer de Valencia perdió **47.000€** en 20 minutos. Recibió una llamada de "su banco" advirtiendo de movimientos fraudulentos. Le pidieron las claves para "bloquear la cuenta". Era mentira.

### El modus operandi:
1. Te llaman desde un número que PARECE del banco (spoofing)
2. Saben tu nombre y los últimos dígitos de tu cuenta
3. Te dicen que hay "actividad sospechosa"
4. Te piden claves o códigos SMS "para protegerte"
5. Con esos datos, vacían tu cuenta

### Por qué funciona:
- El número parece real (falsifican el identificador)
- Tienen información personal (filtrada de otras brechas)
- Generan PÁNICO para que no pienses

### Regla de oro:
**Tu banco NUNCA te pedirá claves por teléfono**

Si recibes esta llamada:
1. CUELGA inmediatamente
2. Llama TÚ al número oficial del banco
3. Verifica si hay algún problema real

**AI Voice Shield de ManoProtect** detecta estas llamadas fraudulentas en tiempo real.
    `
  },
  {
    id: 3,
    slug: 'estafa-whatsapp-hijo-en-apuros',
    title: '"Mamá, se me ha roto el móvil": La estafa de WhatsApp que vacía cuentas',
    excerpt: 'Reciben un mensaje de un número desconocido: "Hola mamá, este es mi nuevo número, el otro se rompió. Necesito que me hagas un Bizum urgente". Miles de padres han caído.',
    category: 'WhatsApp',
    categoryColor: 'bg-green-500',
    date: '8 Feb 2025',
    readTime: '4 min',
    views: 15678,
    image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80',
    tags: ['WhatsApp', 'Bizum', 'Familia', 'Estafa'],
    content: `
## "Mamá, necesito dinero urgente"

Es la estafa que más está creciendo en España en 2025. Los delincuentes se hacen pasar por hijos para pedir dinero a sus padres.

### El mensaje típico:
> "Hola mamá, soy [nombre]. Se me ha roto el móvil y este es mi nuevo número. ¿Me puedes hacer un Bizum de 500€? Es urgente, luego te lo devuelvo"

### Por qué es tan efectiva:
- Usan el MIEDO de los padres
- Piden URGENCIA ("es para ya")
- Cantidades "pequeñas" (200-1000€)
- Los padres mayores no verifican

### Casos reales:
- María, 67 años (Barcelona): Perdió 2.400€ en 3 Bizums
- Antonio, 72 años (Madrid): Transfirió 1.800€
- Carmen, 65 años (Sevilla): 3.200€ en una tarde

### Cómo protegerte:
1. SIEMPRE llama al número antiguo de tu hijo
2. Haz una pregunta que solo él sepa responder
3. NUNCA envíes dinero sin verificar por voz

**ManoProtect alerta a las familias** cuando detecta estos patrones de estafa.
    `
  },
  {
    id: 4,
    slug: 'secuestro-virtual-espana',
    title: 'Secuestros virtuales en España: piden rescate por familiares que están bien',
    excerpt: 'Llaman diciendo que tienen secuestrado a tu hijo. Se oyen gritos de fondo. Piden rescate inmediato. Tu hijo está en clase, pero el pánico te hace pagar.',
    category: 'Secuestro Virtual',
    categoryColor: 'bg-purple-500',
    date: '5 Feb 2025',
    readTime: '6 min',
    views: 7234,
    image: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=800&q=80',
    featured: true,
    tags: ['Secuestro', 'Extorsión', 'Familia', 'Urgente'],
    content: `
## El terror del secuestro virtual

Un padre de Málaga recibió una llamada: "Tenemos a tu hija. Si cuelgas o llamas a la policía, la matamos. Necesitamos 10.000€ AHORA". Su hija estaba en el colegio.

### Cómo lo hacen:
1. Llaman a padres durante horario escolar/laboral
2. Usan IA para imitar voces de familiares
3. Ponen gritos y llantos de fondo
4. EXIGEN que no cuelgues mientras pagas
5. Te mantienen en pánico para que no pienses

### Señales de alerta:
- No te dejan colgar para verificar
- Piden criptomonedas o transferencias anónimas
- Urgencia EXTREMA ("tienes 5 minutos")
- No saben datos específicos de la "víctima"

### Qué hacer si te llaman:
1. CUELGA inmediatamente (aunque digan que no lo hagas)
2. Llama a tu familiar al número que conoces
3. Si no contesta, llama al 091

### Estadísticas en España:
- 847 denuncias en 2024
- Pérdidas medias: 8.500€
- 73% de víctimas: mayores de 50 años

**ManoProtect con localización familiar** te permite verificar dónde están tus seres queridos en segundos.
    `
  },
  {
    id: 5,
    slug: 'phishing-hacienda-renta-2025',
    title: 'Emails falsos de Hacienda en campaña de la Renta: "Tienes una devolución pendiente"',
    excerpt: 'La Agencia Tributaria advierte: NO envían emails pidiendo datos bancarios. Miles de españoles caen cada año en esta estafa durante la declaración de la Renta.',
    category: 'Phishing',
    categoryColor: 'bg-blue-500',
    date: '1 Feb 2025',
    readTime: '4 min',
    views: 21345,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    tags: ['Hacienda', 'Renta', 'Email', 'Phishing'],
    content: `
## La estafa de la "devolución de Hacienda"

Cada año, durante la campaña de la Renta, MILES de españoles reciben emails falsos de "Hacienda" prometiendo devoluciones.

### El email típico:
> Asunto: Notificación de devolución - Agencia Tributaria
> 
> Estimado contribuyente, le informamos que tiene una devolución pendiente de 847,32€. Para recibirla, verifique sus datos bancarios.

### Por qué funciona:
- Coincide con la época de declaraciones
- La cantidad es "creíble"
- El diseño imita a Hacienda
- Promete DINERO (todos lo queremos)

### La realidad:
**La Agencia Tributaria NUNCA:**
- Envía emails pidiendo datos bancarios
- Pide números de tarjeta
- Solicita contraseñas

### Cómo verificar:
1. Accede a la web oficial: sede.agenciatributaria.gob.es
2. Entra con tu certificado digital
3. Comprueba tu estado real

**ManoProtect analiza tus emails** y te avisa si detecta phishing de Hacienda u otras entidades.
    `
  },
  {
    id: 6,
    slug: 'estafa-criptomonedas-famosos',
    title: 'Usan a Risto Mejide y Pablo Motos para estafas de criptomonedas',
    excerpt: 'Anuncios falsos en redes sociales prometen "hacerte rico" con Bitcoin usando la imagen de famosos españoles. Es TODO mentira.',
    category: 'Criptoestafas',
    categoryColor: 'bg-yellow-500',
    date: '28 Ene 2025',
    readTime: '5 min',
    views: 9876,
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
    tags: ['Criptomonedas', 'Bitcoin', 'Famosos', 'Inversión'],
    content: `
## "Risto Mejide revela cómo ganar 5.000€ al día"

Los estafadores usan imágenes de famosos españoles para promocionar plataformas de inversión FALSAS.

### Famosos utilizados (sin su consentimiento):
- Risto Mejide
- Pablo Motos
- Jordi Cruz
- Ana Rosa Quintana
- Carlos Sobera

### Cómo funciona:
1. Ves un anuncio en Facebook/Instagram
2. Un "famoso" dice que se hizo rico con X plataforma
3. Te registras y depositas 250€
4. Al principio "ganas" (números falsos)
5. Cuando intentas retirar, BLOQUEAN tu cuenta
6. Pierdes todo

### Señales de alerta:
- Promesas de ganancias garantizadas
- "Funciona para cualquiera"
- Urgencia ("solo hoy")
- Famosos promocionando (siempre es falso)

### Pérdidas documentadas:
- Media en España: 12.000€ por víctima
- Casos extremos: hasta 200.000€
- Mayores de 50 años: 67% de víctimas

**ManoProtect detecta webs de inversión fraudulentas** y te advierte antes de que deposites dinero.
    `
  }
];

const categories = [
  { name: 'Todos', value: 'all', color: 'bg-slate-500' },
  { name: 'Smishing', value: 'Smishing', color: 'bg-orange-500' },
  { name: 'Vishing', value: 'Vishing', color: 'bg-red-500' },
  { name: 'Phishing', value: 'Phishing', color: 'bg-blue-500' },
  { name: 'WhatsApp', value: 'WhatsApp', color: 'bg-green-500' },
  { name: 'Secuestro Virtual', value: 'Secuestro Virtual', color: 'bg-purple-500' }
];

const BlogPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(p => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Blog de Seguridad - Estafas y Fraudes en España | ManoProtect</title>
        <meta name="description" content="Noticias sobre estafas, phishing, vishing y fraudes en España. Casos reales y cómo protegerte. Actualizado diariamente." />
        <meta name="keywords" content="estafas españa, phishing, vishing, smishing, fraudes, seguridad, noticias" />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/manoprotect_logo.webp" alt="ManoProtect" className="h-9 w-auto" />
            <span className="font-bold text-slate-900 text-lg hidden sm:block">ManoProtect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-600"
            >
              Inicio
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
            >
              Proteger mi Familia
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-red-400 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Alertas de Seguridad</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Estafas y Fraudes en España
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mb-8">
            Casos reales de estafas que están afectando a miles de españoles. 
            Infórmate para proteger a tu familia.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-sm">+340% estafas SMS en 2025</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-sm">67% víctimas mayores de 50</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">ManoProtect te protege</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="bg-white border-b border-slate-200 py-6 px-6 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar estafas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="blog-search"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? `${cat.color} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  data-testid={`category-${cat.value}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === 'all' && searchTerm === '' && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Alertas Destacadas
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  data-testid={`featured-post-${post.id}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${post.categoryColor} text-white`}>
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            {selectedCategory === 'all' ? 'Todas las Alertas' : `Alertas de ${selectedCategory}`}
            <span className="text-slate-400 font-normal text-lg ml-2">({filteredPosts.length})</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
                data-testid={`post-${post.id}`}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${post.categoryColor} text-white text-xs`}>
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No se encontraron alertas con esos criterios</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            No seas la próxima víctima
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            ManoProtect detecta estas estafas ANTES de que caigas. Protege a tu familia hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full px-8 h-14 text-lg font-semibold"
              data-testid="blog-cta-register"
            >
              Probar 7 Días Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/servicios-sos')}
              className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg font-semibold"
            >
              Ver Botón SOS
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} ManoProtect - STARTBOOKING SL (CIF: B19427723)
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/privacy-policy" className="hover:text-white">Privacidad</Link>
            <Link to="/terms-of-service" className="hover:text-white">Términos</Link>
            <Link to="/" className="hover:text-white">Inicio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
