/**
 * ManoProtect - Blog Post Detail Page
 * Individual article view with full content
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, Calendar, Clock, Eye, Share2, Shield, 
  AlertTriangle, ArrowRight, Facebook, Twitter, Linkedin,
  Copy, Check
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

// Same blog data - in production would come from API
const blogPosts = [
  {
    id: 1,
    slug: 'estafa-sms-correos-2025',
    title: 'Alerta: Nueva oleada de SMS falsos de Correos pide datos bancarios',
    excerpt: 'Miles de españoles reciben SMS fraudulentos haciéndose pasar por Correos.',
    category: 'Smishing',
    categoryColor: 'bg-[#4CAF50]',
    date: '12 Feb 2025',
    readTime: '3 min',
    views: 12453,
    image: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=1200&q=80',
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
    excerpt: 'Los estafadores llaman haciéndose pasar por tu banco.',
    category: 'Vishing',
    categoryColor: 'bg-[#4CAF50]',
    date: '10 Feb 2025',
    readTime: '5 min',
    views: 8932,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80',
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
    excerpt: 'Reciben un mensaje de un número desconocido haciéndose pasar por un hijo.',
    category: 'WhatsApp',
    categoryColor: 'bg-green-500',
    date: '8 Feb 2025',
    readTime: '4 min',
    views: 15678,
    image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&q=80',
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
    excerpt: 'Llaman diciendo que tienen secuestrado a tu hijo.',
    category: 'Secuestro Virtual',
    categoryColor: 'bg-purple-500',
    date: '5 Feb 2025',
    readTime: '6 min',
    views: 7234,
    image: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=1200&q=80',
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
    title: 'Emails falsos de Hacienda en campaña de la Renta',
    excerpt: 'La Agencia Tributaria advierte: NO envían emails pidiendo datos bancarios.',
    category: 'Phishing',
    categoryColor: 'bg-blue-500',
    date: '1 Feb 2025',
    readTime: '4 min',
    views: 21345,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
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
    excerpt: 'Anuncios falsos en redes sociales prometen hacerte rico.',
    category: 'Criptoestafas',
    categoryColor: 'bg-yellow-500',
    date: '28 Ene 2025',
    readTime: '5 min',
    views: 9876,
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&q=80',
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

const BlogPostPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);
  
  const post = blogPosts.find(p => p.slug === slug);
  
  // Related posts (same category, excluding current)
  const relatedPosts = post 
    ? blogPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 2)
    : [];

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Enlace copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Artículo no encontrado</h1>
          <p className="text-slate-500 mb-6">El artículo que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate('/blog')} className="bg-indigo-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{post.title} | Blog ManoProtect</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Button>
          <Button
            onClick={() => navigate('/register')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
          >
            Proteger mi Familia
          </Button>
        </nav>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <Badge className={`${post.categoryColor} text-white mb-4`}>
            {post.category}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} lectura
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views.toLocaleString()} lecturas
            </span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 sm:h-96 object-cover"
          />
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-slate-100 rounded-xl">
          <span className="text-sm font-medium text-slate-600">Compartir:</span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <button
            onClick={copyLink}
            className="w-9 h-9 bg-slate-600 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none mb-12">
          <ReactMarkdown
            components={{
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="text-slate-700 leading-relaxed mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-4" {...props} />,
              li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-[#4CAF50] pl-4 py-2 bg-red-50 my-4 italic text-slate-700" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white mb-12">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-2">¿Te preocupa caer en estas estafas?</h3>
          <p className="text-indigo-100 mb-6">
            ManoProtect detecta automáticamente SMS, llamadas y emails fraudulentos.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full px-8"
          >
            Probar 7 Días Gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Artículos Relacionados</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedPosts.map(rp => (
                <article
                  key={rp.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/blog/${rp.slug}`)}
                >
                  <img
                    src={rp.image}
                    alt={rp.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 line-clamp-2 hover:text-indigo-600">
                      {rp.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2">{rp.date}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default BlogPostPage;
