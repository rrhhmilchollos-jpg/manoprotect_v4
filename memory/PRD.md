# ManoProtect - Product Requirements Document

## Original Problem Statement
Plataforma líder en España de protección digital y física para familias. Optimizar manoprotect.com como líder de mercado en seguridad y ventas con CRO, SEO, y rendimiento elite.

## Core Product
- **Sentinel X**: Reloj GPS/SOS adultos/adolescentes (4G, BT, grabación)
- **Sentinel J**: Reloj GPS/SOS niños 3-12 años (8 correas, sin cámara)
- **Sentinel S**: Reloj GPS/SOS mayores (cerámica, anti-retirada, sirena 120dB)
- **Pricing**: 9,99€/mes o 99,99€/año. Dispositivo GRATIS con suscripción.

## Tech Stack
- Frontend: React + TailwindCSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Payments: Stripe (real products, 3D Secure)
- Email: SendGrid
- Analytics: GTM dataLayer + gtag + fbq + Hotjar (placeholder ready)

## Implemented Pages
- `/` - Landing Principal (Hero, beneficios, productos, comparativa, testimonios, FAQ, **videos marketing**, trust bar, footer)
- `/productos` - Página productos completa con comparativa X vs J vs S
- `/plans` - Precios con **contadores en tiempo real** (stock Sentinel Basic + plazas promo -20%)
- `/testimonios` - 6 testimonios + 3 casos de uso con fotos españolas
- `/faq` - 14 preguntas en 4 categorías, búsqueda, schema SEO
- `/contacto` - Formulario + WhatsApp + teléfono + 24/7 (API funcional)
- `/blog` - Artículos SEO con meta/OG tags, fotos españolas
- `/sentinel-x`, `/sentinel-j`, `/sentinel-s` - Páginas de producto individuales
- `/ceo` - **CEO Dashboard completo** con datos reales de BD
- `/registro` - Registro con Stripe checkout

## CEO Dashboard (Implemented Feb 28, 2026)
- **Ruta**: `/ceo` (requiere login admin)
- **Backend**: `/api/ceo/stats`, `/api/ceo/users`, `/api/ceo/subscriptions`, `/api/ceo/orders`, `/api/ceo/refunds`, `/api/ceo/messages`, `/api/ceo/activity`, `/api/ceo/promo-status`, `/api/ceo/claim-sentinel-basic`
- **Funcionalidades**: Stats en tiempo real, 6 pestañas, búsqueda usuarios, paginación, indicadores Backend/Frontend LIVE, contadores de stock Sentinel Basic y promo -20%

## Promotional Pricing (Implemented Feb 28, 2026)
- Sentinel X Basic GRATIS (50 unidades, requiere suscripción activa)
- 20% descuento para primeros 200 suscriptores en checkout Stripe
- Contadores en tiempo real en `/plans` y CEO Dashboard
- Endpoint público `/api/ceo/promo-status` para contadores

## Health Check System (Implemented Feb 28, 2026)
- Backend: `/api/heartbeat` (respuesta <5ms)
- Backend: `/api/health` (con estado BD)
- Frontend: `HealthCheckMonitor` global polling cada 5s con toast de alerta
- CEO Dashboard: Indicadores "Backend LIVE" / "Frontend LIVE"

## Marketing Videos (Implemented Feb 28, 2026)
- 4 imágenes generadas de familias españolas con Sentinel
- Sección en landing principal con cards estilo video
- Thumbnails: familia García, vuelta al cole, senior, adolescente senderismo

## Analytics Placeholders Ready
- **Meta Pixel**: Placeholder `META_PIXEL_ID` en index.html (usuario debe reemplazar)
- **Hotjar**: Placeholder `HOTJAR_SITE_ID` en index.html (usuario debe reemplazar)
- **Google Search Console**: Pendiente código de verificación del usuario

## Backlog
### P1: Usuario proporcione IDs (Meta Pixel, Hotjar, Google SC), iOS build (requiere Mac)
### P2: Remarketing/A/B testing avanzado, SEO Fase 3
### P3: Activar integraciones mocked (112, BigQuery)
### BLOQUEADOS: SMS Infobip, SendGrid dominio, Twilio WhatsApp producción

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
