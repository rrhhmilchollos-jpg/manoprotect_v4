# ManoProtect - Product Requirements Document

## Última Actualización: 27 Febrero 2026 (v6)

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

---

## Stack Técnico
- **Frontend**: React 18, TailwindCSS, Shadcn/UI, react-helmet-async
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB (Motor async)
- **Payments**: Stripe (Elements + subscriptions + one-time payments)
- **Auth**: JWT + session cookies
- **Mobile**: Capacitor (Android configured, iOS config prepared)

---

## Embudo de Conversión (IMPLEMENTADO v6)

### Flujo para relojes GRATIS (Basic, J, S)
1. Usuario llega a `/sentinel-x` y elige producto
2. Rellena formulario de pedido (nombre, email, teléfono, dirección)
3. Al pulsar "Pedir GRATIS" → aparece modal de suscripción obligatoria
4. Elige plan: Mensual (9,99€/mes) o Anual (99,99€/año)
5. Stripe crea checkout con suscripción recurrente + envío único
6. Primer cobro: envío (9,95€/4,95€) + primera cuota del plan

### Flujo para relojes de pago (Fundadores, Premium)
1. Usuario elige Fundadores (149€) o Premium (199€)
2. Checkout directo con Stripe (pago único, envío GRATIS)
3. Sin suscripción obligatoria (servicio incluido)

### Precios de suscripción
| Plan | Precio | Intervalo | Badge |
|------|--------|-----------|-------|
| Mensual | 9,99€ | /mes | — |
| Anual | 99,99€ | /año | MEJOR PRECIO (8,33€/mes) |

---

## Background Location Tracking (IMPLEMENTADO v6)

### Android
- ACCESS_FINE_LOCATION ✅
- ACCESS_COARSE_LOCATION ✅
- ACCESS_BACKGROUND_LOCATION ✅
- FOREGROUND_SERVICE + FOREGROUND_SERVICE_LOCATION ✅
- REQUEST_IGNORE_BATTERY_OPTIMIZATIONS ✅
- WAKE_LOCK ✅
- RECEIVE_BOOT_COMPLETED ✅

### iOS
- NSLocationWhenInUseUsageDescription ✅
- NSLocationAlwaysAndWhenInUseUsageDescription ✅
- Background Modes: location, fetch, remote-notification ✅

### Runtime Permission Flow
1. Pedir ubicación foreground
2. Android: guiar a Ajustes → "Permitir todo el tiempo"
3. Android: solicitar exclusión optimización batería
4. iOS: solicitar "Siempre" (automático)
5. Iniciar background watcher

### Textos para Stores
- Documento completo: `/app/STORE_JUSTIFICATION_TEXTS.md`

---

## Backlog Pendiente

### P0 - Crítico
- [ ] Configurar Price IDs reales de Stripe en .env (usuario pendiente)
- [ ] Implementar webhook Stripe (invoice.payment_succeeded, subscription.deleted)
- [ ] Ajustar manejo 3D Secure / requires_action

### P1 - Alta
- [x] Crear página de producto Sentinel J ✅
- [x] Crear página de producto Sentinel S ✅
- [x] Sentinel X rediseñado con modelo freemium ✅
- [x] Suscripción obligatoria para relojes gratis (Basic, J, S) ✅
- [x] Landing pages locales: Madrid, Barcelona, Sevilla ✅
- [x] Background Location Tracking completo (Android + iOS) ✅
- [x] Meta Pixel integrado en index.html ✅ (requiere ID real del usuario)
- [x] Google Tag Manager conectado ✅ (requiere verificación del usuario)
- [ ] Tracking conversiones GA4, Pixel Meta Ads (IDs del usuario pendientes)

### P2 - Media
- [ ] Página "Quiénes Somos" (esperando contenido)
- [ ] BigQuery + Looker Studio
- [ ] SEO Fase 3: Backlinks
- [ ] Integración 112

### P3 - Baja
- [ ] Emails recordatorio trial
- [ ] Core Web Vitals < 1.8s
- [ ] Integraciones bloqueadas (Infobip, SendGrid, Twilio)
- [ ] Refactorizar landing pages locales en componente reutilizable

---

## Testing
- Iteración 49: Blog + CRO → 13/13 passed
- Iteración 50: Age pages + blog → 11/11 passed
- Iteración 51: Content updates + free shipping + March 30 → 10/10 passed
- Iteración 52: Local pages Madrid/Barcelona/Sevilla + regression → 12/12 passed
- Iteración 53: Sentinel J product page + regression → 16/16 passed
- Iteración 54: Sentinel S + Sentinel X 2 modelos + promo GRATIS + regression → 14/14 passed
- Iteración 55: Sentinel X freemium model verification → 15/15 passed
- Iteración 56: Subscription modal + checkout flows + regression → 16/16 passed

## Credenciales
| Email | Password | Rol |
|-------|----------|-----|
| ceo@manoprotect.com | 19862210Des | super_admin |
