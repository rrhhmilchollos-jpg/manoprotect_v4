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
  Clock, Eye, Tag, Search, Download, FileText
} from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ScamAlertSubscription from '@/components/ScamAlertSubscription';

// Noticias reales de estafas en España - Actualizar regularmente
const blogPosts = [
  {
    id: 1,
    slug: 'estafa-sms-correos-2025',
    title: 'Alerta: Nueva oleada de SMS falsos de Correos pide datos bancarios',
    excerpt: 'Miles de españoles reciben SMS fraudulentos haciéndose pasar por Correos. "Tu paquete está retenido, paga 1,99€ para recibirlo". La Policía advierte del aumento de estas estafas.',
    category: 'Smishing',
    categoryColor: 'bg-[#4CAF50]',
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
    categoryColor: 'bg-[#4CAF50]',
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
  },
  {
    id: 7,
    slug: 'secuestro-real-corbera-xativa-2026',
    title: 'CASO REAL: Secuestro en Corbera (Xàtiva) - Una llamada desde el maletero salvó sus vidas',
    excerpt: 'Una pareja secuestrada en Valencia logró ser rescatada porque la mujer llamó a su cuñada desde el maletero del coche y compartió su ubicación GPS. La Policía detuvo a los captores.',
    category: 'Secuestro Real',
    categoryColor: 'bg-[#4CAF50]',
    date: '9 Feb 2026',
    readTime: '6 min',
    views: 45230,
    image: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=800&q=80',
    featured: true,
    tags: ['Secuestro', 'Valencia', 'Xàtiva', 'Caso Real', 'GPS'],
    content: `
## El secuestro de Corbera que estremeció a Valencia

El **6 de febrero de 2026**, una pareja fue secuestrada en una zona rural de Corbera, cerca de Xàtiva (Valencia). Lo que podría haber acabado en tragedia se convirtió en un rescate exitoso gracias a la tecnología.

### Cómo ocurrió:
1. La pareja fue interceptada y metida en el maletero de un vehículo
2. Los captores exigían dinero bajo amenazas
3. La mujer, con su móvil escondido, logró llamar a su cuñada
4. **Compartió su ubicación GPS en tiempo real**
5. La cuñada alertó inmediatamente al 112

### El rescate:
- La Policía Nacional y Local de Xàtiva iniciaron una persecución
- Gracias a la ubicación GPS, localizaron el vehículo
- Las víctimas fueron liberadas
- Un captor fue detenido inmediatamente
- El "autor intelectual" fue arrestado 2 días después en Valencia

### Resultado judicial:
| Detenido | Medida |
|----------|--------|
| Captor principal | Prisión provisional sin fianza |
| Autor intelectual | Detenido y bajo investigación |
| Tercer implicado | Libertad con restricciones (300m) |

### Delitos investigados:
- Detención ilegal / Secuestro
- Extorsión
- Falsedad documental
- Estafa
- Dos delitos de lesiones

### Por qué este caso es clave:
**La ubicación GPS salvó sus vidas.** Si la mujer no hubiera podido compartir su ubicación, el desenlace podría haber sido muy diferente.

### Cómo ManoProtect te protege:
- **Localización familiar en tiempo real** - Sabe siempre dónde están tus seres queridos
- **Botón SOS** - Envía alerta con ubicación exacta a familiares y al 112
- **Audio bidireccional** - Permite escuchar lo que ocurre
- **Detección de movimientos bruscos** - Alerta automática si detecta algo anormal

**No esperes a que ocurra. Protege a tu familia ahora.**
    `
  },
  {
    id: 8,
    slug: 'ciberataques-espana-2025-cifras-record',
    title: 'INCIBE: 122.223 ciberataques en España en 2025 - Récord histórico',
    excerpt: 'España sufrió un 26% más de ciberataques en 2025. El phishing domina con 25.000 casos. La banca online fue el sector más atacado. 1.200 estafas diarias.',
    category: 'Estadísticas',
    categoryColor: 'bg-indigo-600',
    date: '9 Feb 2026',
    readTime: '5 min',
    views: 32100,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    featured: true,
    tags: ['INCIBE', 'Estadísticas', '2025', 'Ciberataques', 'España'],
    content: `
## España bate récord de ciberataques en 2025

El **Instituto Nacional de Ciberseguridad (INCIBE)** ha publicado datos alarmantes: en 2025 se detectaron **122.223 incidentes de ciberseguridad**, un 26% más que en 2024.

### Cifras clave de 2025:

| Métrica | Dato | Variación |
|---------|------|-----------|
| Incidentes totales | 122.223 | +26% |
| Estafas online Q1 | 106.800 | +40% |
| Phishing detectado | 25.133 casos | Líder |
| Estafas diarias | 1.200 | - |
| Dominios fraudulentos cerrados | 4.600 | 100% detección |

### Sectores más atacados:
1. **Banca online** - 34% de incidentes
2. **Transporte** - 14%
3. **Energía** - 8%

### Tipos de estafa más comunes:
- **Phishing** (emails falsos): 70% de intentos recibidos
- **Vishing** (llamadas): 28% de consultas al 017
- **Smishing** (SMS): 340% de aumento
- **Estafa del familiar**: 63 casos esclarecidos (>320.000€ robados)

### El dato más preocupante:
**El 67% de las víctimas son mayores de 50 años**

Las redes sociales han superado al email como vector principal de ataque (34% vs 28%).

### Nuevas amenazas en 2025:
- **Deepfakes** para clonar voces en llamadas
- **Kits de phishing** duplicados globalmente
- **IA** para crear webs falsas más convincentes
- **Web skimming** (+56%) en tiendas online legítimas

### Qué dice INCIBE:
> "El fraude digital ya representa el 18% de los delitos penales en España. Se registraron 414.133 casos en 2024, un 490% más que en 2016."

### Cómo protegerte:
1. Verifica SIEMPRE las URLs antes de hacer clic
2. Usa autenticación de dos factores (2FA)
3. No compartas códigos SMS con nadie
4. Reporta al 017 cualquier intento de estafa

**ManoProtect detecta automáticamente** phishing, vishing y smishing antes de que caigas.
    `
  },
  {
    id: 9,
    slug: 'menores-desaparecidos-espana-2024',
    title: '13.000 menores desaparecieron en España en 2024 - Cómo proteger a tus hijos',
    excerpt: 'La mitad de las desapariciones en España son de menores. 6 de cada 10 son niñas adolescentes. El 57% son fugas del hogar. El teléfono 116 000 atendió 4.383 casos.',
    category: 'Menores',
    categoryColor: 'bg-pink-600',
    date: '7 Feb 2026',
    readTime: '7 min',
    views: 28450,
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    tags: ['Menores', 'Desapariciones', 'Niños', 'Familia', 'Seguridad'],
    content: `
## El drama de los menores desaparecidos en España

Según el **Centro Nacional de Desaparecidos (CNDES)**, el 49,4% de las desapariciones en España en 2024 fueron de menores de edad. Esto significa **más de 13.000 niños y adolescentes**.

### Datos oficiales 2024:

| Métrica | Cifra |
|---------|-------|
| Total desapariciones | 26.345 |
| Menores desaparecidos | 13.000+ (49,4%) |
| Casos activos de menores | 3.068 |
| Atendidos por ANAR | 1.171 casos |

### Perfil de los menores desaparecidos:
- **6 de cada 10 son niñas**
- **66,2%** son adolescentes (13-17 años)
- **18,6%** son preadolescentes
- **13,1%** son menores de 9 años

### Causas principales de desaparición:

| Causa | Porcentaje |
|-------|------------|
| Fugas del hogar | 57,6% |
| Expulsiones del hogar | 23,7% |
| Secuestro parental | 12,4% |
| Pérdida/accidente | 3,8% |
| Secuestro por terceros | 1,9% |

### Factores de riesgo:
- **60% tiene problemas de salud mental**
- 23% sufre algún tipo de violencia
- 18,9% maltrato físico
- 12,2% violencia de género en el entorno
- 11,5% entornos con adicciones

### Comunidades con más casos:
1. Madrid - 324 casos
2. Comunidad Valenciana - 187 casos
3. Andalucía - 103 casos

### Recursos de ayuda:
- **Teléfono 116 000** (24 horas, gratuito)
- Chat de la Fundación ANAR
- 091 (Policía Nacional)
- 112 (Emergencias)

### Cómo ManoProtect ayuda a proteger a tus hijos:
- **Localización GPS en tiempo real** - Sabe siempre dónde están
- **Zonas seguras** - Recibe alerta si salen del colegio o casa
- **Botón SOS** - Tu hijo puede pedir ayuda con un clic
- **Historial de ubicaciones** - Revisa dónde ha estado
- **Alertas de batería baja** - No pierdas el contacto

**La prevención es la mejor protección. Actúa antes de que sea tarde.**
    `
  },
  {
    id: 10,
    slug: 'caidas-ancianos-4000-muertes-espana',
    title: '4.018 ancianos murieron por caídas en España en 2023 - El peligro silencioso',
    excerpt: 'Las caídas son la principal causa de muerte accidental en mayores de 65 años. El 70% ocurre en casa. El baño causa el 66% de accidentes. La teleasistencia salva vidas.',
    category: 'Mayores',
    categoryColor: 'bg-amber-600',
    date: '6 Feb 2026',
    readTime: '6 min',
    views: 19800,
    image: 'https://images.unsplash.com/photo-1447005497901-b3e9ee359928?w=800&q=80',
    tags: ['Ancianos', 'Caídas', 'Mayores', 'Emergencias', 'Teleasistencia'],
    content: `
## Las caídas: el asesino silencioso de nuestros mayores

Según el **INE**, en 2023 murieron **4.018 personas por caídas** en España, un 6,1% más que en 2022. El 80% eran mayores de 65 años.

### Estadísticas alarmantes:

| Dato | Cifra |
|------|-------|
| Muertes por caídas (2023) | 4.018 |
| Mayores de 65 años | +80% |
| Mayores de 75 años | 70% de muertes |
| Caídas en el hogar | 70-80% |
| Accidentes en el baño | 66% |

### ¿Quién está en riesgo?
- **1 de cada 3** mayores de 65 años cae al menos una vez al año
- **1 de cada 2** mayores de 80 años sufre caídas
- **5-6%** de las caídas causan fracturas
- **71,59%** de caídas hospitalarias son en mayores de 80 años

### Consecuencias de una caída:
- Fracturas (especialmente cadera)
- Miedo a volver a caer (limita movilidad)
- Pérdida de autonomía
- Hospitalización prolongada
- Muerte (en casos graves)

### ¿Por qué ocurren?
- Fragilidad física
- Problemas de visión
- Medicamentos que causan mareos
- Suelos resbaladizos
- Mala iluminación
- Alfombras sueltas
- Cables en el suelo

### La teleasistencia salva vidas:
En España, la teleasistencia atiende a cientos de miles de personas:
- **Madrid**: 158.000 beneficiarios, 611.000 llamadas atendidas
- **Andalucía**: 6 millones de llamadas en 2025
- **Navarra**: 11.106 usuarios (+46% en 5 años)

### Cómo funciona la teleasistencia:
1. El mayor lleva un dispositivo (pulsera/colgante)
2. Si cae o necesita ayuda, pulsa el botón
3. Se conecta con una central 24/7
4. Envían ayuda (ambulancia, familiares, bomberos)

### ManoProtect: La evolución de la teleasistencia

Nuestro **Botón SOS** ofrece:
- **Detección automática de caídas** - No necesita pulsar
- **GPS de alta precisión** (2.5m) - Te localizan donde estés
- **Audio bidireccional** - Pueden hablar con tu familiar
- **7 días de batería** - Sin cargas constantes
- **Conexión directa al 112** - Emergencias reales
- **Alertas a familiares** - Todos informados al instante

### El botón SOS es GRATIS - Solo pagas 4,95€ de envío

**No esperes a que tu padre o abuelo sufra una caída. Protégelo ahora.**
    `
  },
  {
    id: 11,
    slug: 'estafa-empresas-ceo-fraud-2025',
    title: 'Estafa del CEO: Cómo los hackers roban millones a empresas españolas',
    excerpt: 'El "fraude del CEO" ha costado millones a empresas españolas. Los estafadores suplantan al director para ordenar transferencias urgentes. Aprende a proteger tu negocio.',
    category: 'Empresas',
    categoryColor: 'bg-slate-700',
    date: '5 Feb 2026',
    readTime: '5 min',
    views: 15600,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
    tags: ['Empresas', 'CEO Fraud', 'B2B', 'Estafa', 'Transferencias'],
    content: `
## La estafa del CEO: El fraude que arruina empresas

El "fraude del CEO" o "Business Email Compromise (BEC)" es una de las estafas más lucrativas contra empresas. En España ha causado pérdidas millonarias.

### Cómo funciona:
1. Los estafadores investigan la empresa (LinkedIn, web, redes)
2. Identifican al CEO/Director y al responsable de pagos
3. Crean un email que imita al del CEO
4. Envían mensaje "urgente" pidiendo una transferencia
5. El empleado, creyendo que es su jefe, transfiere el dinero
6. El dinero desaparece en cuentas extranjeras

### Mensaje típico:
> De: director@empresa.com (falso)
> Para: contabilidad@empresa.com
>
> "Necesito que hagas una transferencia urgente de 45.000€. Es confidencial, no comentes con nadie. Te paso los datos del proveedor. Hazlo hoy sin falta."

### Por qué funciona:
- El email parece legítimo
- Hay urgencia ("hoy sin falta")
- Confidencialidad ("no comentes")
- Autoridad (viene "del jefe")
- Los empleados no quieren cuestionar al CEO

### Casos reales en España:
- Una empresa de Barcelona perdió **230.000€**
- Pyme de Madrid estafada con **85.000€**
- Despacho de abogados: **120.000€**

### Variantes de la estafa:
1. **Proveedor falso**: "Hemos cambiado de cuenta bancaria"
2. **RRHH falso**: Piden nóminas de empleados
3. **Abogado urgente**: "Necesitamos pagar una multa"

### Señales de alerta:
- ⚠️ Urgencia extrema
- ⚠️ Confidencialidad sospechosa
- ⚠️ Cambio de cuenta bancaria
- ⚠️ Presión para no verificar
- ⚠️ Email ligeramente diferente (director@empresa.corn)

### Cómo proteger tu empresa:
1. **Verificar SIEMPRE** por teléfono transferencias grandes
2. Implementar **doble autorización** para pagos
3. **Formar a empleados** sobre estas estafas
4. Revisar emails sospechosos con IT
5. Usar **filtros anti-spoofing** en el correo

### ManoProtect para Empresas:
Ofrecemos protección B2B con:
- **Análisis de emails sospechosos**
- **Alertas de suplantación de identidad**
- **Formación para empleados**
- **Auditoría de seguridad**

**Protege tu empresa antes de que sea tarde.**
    `
  }
];

const categories = [
  { name: 'Todos', value: 'all', color: 'bg-slate-500' },
  { name: 'Smishing', value: 'Smishing', color: 'bg-[#4CAF50]' },
  { name: 'Vishing', value: 'Vishing', color: 'bg-[#4CAF50]' },
  { name: 'Phishing', value: 'Phishing', color: 'bg-blue-500' },
  { name: 'WhatsApp', value: 'WhatsApp', color: 'bg-green-500' },
  { name: 'Secuestro Virtual', value: 'Secuestro Virtual', color: 'bg-purple-500' },
  { name: 'Secuestro Real', value: 'Secuestro Real', color: 'bg-[#4CAF50]' },
  { name: 'Menores', value: 'Menores', color: 'bg-pink-600' },
  { name: 'Mayores', value: 'Mayores', color: 'bg-amber-600' },
  { name: 'Empresas', value: 'Empresas', color: 'bg-slate-700' }
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
        <meta name="keywords" content="estafas españa, phishing, vishing, smishing, fraudes, seguridad, noticias, estafa correos, estafa banco, secuestro virtual, estafa whatsapp bizum" />
        <meta property="og:title" content="Blog de Seguridad - Estafas en España | ManoProtect" />
        <meta property="og:description" content="Casos reales de estafas que afectan a miles de españoles. Infórmate para proteger a tu familia." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://manoprotect.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Estafas y Fraudes en España - ManoProtect" />
        <link rel="canonical" href="https://manoprotect.com/blog" />
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
          <div className="flex items-center gap-2 text-green-400 mb-4">
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
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm">+340% estafas SMS en 2025</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-green-400" />
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
              <AlertTriangle className="w-6 h-6 text-[#4CAF50]" />
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

      {/* Scam Alert Subscription */}
      <section className="py-12 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScamAlertSubscription />
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default BlogPage;
