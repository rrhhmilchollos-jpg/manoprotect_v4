# ManoProtect - Product Requirements Document

## Última Actualización: 25 Febrero 2026

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de seguridad personal y protección contra fraudes digitales para familias en España. Incluye dispositivos físicos (Sentinel X y Botón SOS), análisis de amenazas con IA, localización familiar, y un portal enterprise.

---

## Arquitectura SEO por Segmento de Edad (COMPLETADO)

### Páginas de Producto por Edad
| Página | Público | Estado |
|--------|---------|--------|
| `/sentinel-x-ninos` | 12-16 años | COMPLETADO |
| `/sentinel-x-adultos` | 17-55 años | COMPLETADO |
| `/boton-sos-senior` | 55+ años | EXISTENTE (no modificado) |
| `/boton-sos-valencia` | Local SEO Valencia | COMPLETADO |

### Artículos de Blog por Edad
| Artículo | Segmento | Estado |
|----------|----------|--------|
| `/blog/seguridad-hijos-boton-sos` | Niños | COMPLETADO |
| `/blog/seguridad-personal-adultos` | Adultos | COMPLETADO |
| `/blog/cuidado-mayores-teleasistencia` | Senior | COMPLETADO |

### SEO Técnico Implementado
- H1 único por página con edad y producto
- 1.000+ palabras por página de producto
- Meta titles y descriptions con keywords principales
- FAQs expandibles con Schema.org por edad
- Product Schema, Review Schema, Breadcrumb Schema
- CTAs destacados y visibles
- Enlaces internos cruzados entre segmentos
- Sitemap actualizado con todas las nuevas páginas

### Artículos Blog Estratégicos Previos (COMPLETADO)
- `/blog/mejores-relojes-sos-2026`
- `/blog/como-funciona-reloj-sos`
- `/blog/reloj-gps-alzheimer`
- `/blog/reloj-gps-sin-cuotas`

### CRO en Sentinel X (COMPLETADO)
- Testimonials, ProductComparison, StickyCTA integrados en `/sentinel-x`

### Landing Pages SEM (COMPLETADO)
- `/reloj-sos-ancianos`, `/reloj-gps-mayores`, `/boton-sos-senior`

---

## Stack Técnico
- **Frontend**: React 18, TailwindCSS, Shadcn/UI, react-helmet-async
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB (Motor async)
- **Payments**: Stripe (checkout + webhooks + Stripe Elements)
- **Email**: SendGrid (pendiente verificación dominio)
- **Auth**: JWT + session cookies

---

## Estado de Integraciones

| Integración | Estado | Notas |
|-------------|--------|-------|
| Stripe | Funcional | Suscripciones con trial 7 días |
| Infobip SMS | Bloqueado | API key inválida |
| Twilio WhatsApp | Sandbox | Producción pendiente |
| SendGrid | Pendiente | Verificación dominio |

---

## Backlog Pendiente

### P0 - Crítico
- [ ] Configurar Price IDs reales de Stripe en .env
- [ ] Implementar webhook de Stripe (invoice.payment_succeeded, etc.)
- [ ] Ajustar manejo de 3D Secure / requires_action

### P1 - Alta
- [ ] Crear app iOS con Capacitor
- [ ] Conectar Google Tag Manager & Search Console
- [ ] Tracking de conversiones GA4, Pixel Meta Ads
- [ ] Landing pages locales para otras ciudades (Madrid, Barcelona, Sevilla)

### P2 - Media
- [ ] Página "Quiénes Somos" con fotos del equipo
- [ ] Setup BigQuery + Looker Studio Dashboards
- [ ] SEO Fase 3: Backlinks y autoridad
- [ ] Integración con servicios emergencia 112
- [ ] Habilitar 2FA cuando SMS funcione
- [ ] Producción Twilio WhatsApp

### P3 - Baja
- [ ] Emails recordatorio trial (cron job existe)
- [ ] Blog automatizado alertas estafas
- [ ] Core Web Vitals optimización < 1.8s
- [ ] Imágenes WebP + lazy loading optimizadas

---

## Credenciales
| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| CEO/Admin | ceo@manoprotect.com | 19862210Des | super_admin |

---

## Testing
- Iteración 49: Blog articles + CRO integration → 13/13 passed
- Iteración 50: Age-segmented pages + blog → 11/11 passed
