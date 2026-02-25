# ManoProtect - Product Requirements Document

## Última Actualización: 25 Febrero 2026 (v2)

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de seguridad personal y protección contra fraudes para familias en España. Producto principal: Sentinel X (reloj con botón SOS) y Botón SOS físico para seniors.

---

## Arquitectura SEO por Segmento de Edad (COMPLETADO)

### Páginas de Producto por Edad
| Página | Público | H1 | Estado |
|--------|---------|-----|--------|
| `/sentinel-x-ninos` | 12-16 años | Sentinel X para Niños y Adolescentes – Botón SOS Físico | COMPLETADO |
| `/sentinel-x-adultos` | 17-55 años | Sentinel X para Adultos – Botón SOS Físico Personal | COMPLETADO |
| `/boton-sos-senior` | 55+ años | Botón SOS Físico para Mayores – Seguridad Senior | COMPLETADO |
| `/boton-sos-valencia` | Local SEO | Botón SOS en Valencia – Entrega y Soporte Local | COMPLETADO |
| `/boton-sos-madrid` | Local SEO | Botón SOS en Madrid – Entrega y Soporte Local | COMPLETADO |
| `/boton-sos-barcelona` | Local SEO | Botón SOS en Barcelona – Entrega y Soporte Local | COMPLETADO |
| `/boton-sos-sevilla` | Local SEO | Botón SOS en Sevilla – Entrega y Soporte Local | COMPLETADO |

Cada página incluye:
- Schema.org (Product, FAQ, Review, Breadcrumb)
- 1000+ palabras SEO optimizadas
- H2 estructurados con párrafos descriptivos
- FAQs expandibles (4 por página)
- CTAs con "Oferta de lanzamiento hasta 30 de Marzo"
- Envío GRATUITO (sin costes de envío)
- Internal linking cruzado entre segmentos
- Testimonios verificados

### Blog Estratégico
| Artículo | Segmento | H1 | Estado |
|----------|----------|-----|--------|
| `/blog/seguridad-hijos-boton-sos` | Niños | Cómo Garantizar la Seguridad de tus Hijos con un Botón SOS | COMPLETADO |
| `/blog/seguridad-personal-adultos` | Adultos | Protección Personal con Sentinel X – Botón SOS para Adultos | COMPLETADO |
| `/blog/cuidado-mayores-teleasistencia` | Senior | Botón SOS Físico para Mayores – Seguridad y Tranquilidad | COMPLETADO |
| `/blog/como-elegir-boton-sos-edad` | Comparativa | Cómo Elegir el Botón SOS Adecuado para Cada Edad | COMPLETADO |
| `/blog/mejores-relojes-sos-2026` | General | Los 5 mejores relojes SOS en 2026 | COMPLETADO |
| `/blog/como-funciona-reloj-sos` | General | Cómo Funciona un Reloj SOS para Mayores | COMPLETADO |
| `/blog/reloj-gps-alzheimer` | General | Reloj GPS para Personas con Alzheimer | COMPLETADO |
| `/blog/reloj-gps-sin-cuotas` | General | Reloj GPS Sin Cuotas: La Verdad | COMPLETADO |

### CRO en Sentinel X (COMPLETADO)
- Testimonials, ProductComparison, StickyCTA integrados en `/sentinel-x`

### Landing Pages SEM (COMPLETADO)
- `/reloj-sos-ancianos`, `/reloj-gps-mayores`, `/boton-sos-senior`

---

## Stack Técnico
- **Frontend**: React 18, TailwindCSS, Shadcn/UI, react-helmet-async
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB (Motor async)
- **Payments**: Stripe (Elements + trial 7 días)
- **Auth**: JWT + session cookies

---

## Backlog Pendiente

### P0 - Crítico
- [ ] Configurar Price IDs reales de Stripe en .env (usuario pendiente)
- [ ] Implementar webhook Stripe (invoice.payment_succeeded, subscription.deleted)
- [ ] Ajustar manejo 3D Secure / requires_action

### P1 - Alta
- [ ] Crear página de producto Sentinel J (reloj juvenil)
- [ ] Crear app iOS con Capacitor
- [ ] Conectar Google Tag Manager & Search Console
- [ ] Tracking conversiones GA4, Pixel Meta Ads
- [x] Landing pages locales: Madrid, Barcelona, Sevilla ✅

### P2 - Media
- [ ] Página "Quiénes Somos" (esperando contenido)
- [ ] BigQuery + Looker Studio
- [ ] SEO Fase 3: Backlinks
- [ ] Integración 112

### P3 - Baja
- [ ] Emails recordatorio trial
- [ ] Core Web Vitals < 1.8s
- [ ] Integraciones bloqueadas (Infobip, SendGrid, Twilio)

---

## Testing
- Iteración 49: Blog + CRO → 13/13 passed
- Iteración 50: Age pages + blog → 11/11 passed
- Iteración 51: Content updates + free shipping + March 30 → 10/10 passed
- Iteración 52: Local pages Madrid/Barcelona/Sevilla + regression → 12/12 passed

## Credenciales
| Email | Password | Rol |
|-------|----------|-----|
| ceo@manoprotect.com | 19862210Des | super_admin |
