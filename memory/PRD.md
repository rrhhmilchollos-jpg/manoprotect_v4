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

## Implemented Pages (Feb 28, 2026)
- `/` - Landing Principal (Hero familia española, beneficios, cómo funciona con fotos, productos Sentinel, comparativa, testimonios, urgencia, FAQ, trust bar, footer)
- `/productos` - Página productos completa con comparativa X vs J vs S
- `/plans` - Precios (mensual/anual), prueba 7 días, tabla beneficios
- `/testimonios` - 6 testimonios + 3 casos de uso con fotos españolas
- `/faq` - 14 preguntas en 4 categorías, búsqueda, schema SEO
- `/contacto` - Formulario + WhatsApp + teléfono + 24/7 (API funcional)
- `/blog` - 3 artículos SEO con meta/OG tags, fotos españolas
- `/sentinel-x`, `/sentinel-j`, `/sentinel-s` - Páginas de producto individuales
- `/registro` - Registro con Stripe checkout
- Header: Home | Productos | Precios | Testimonios | Blog | Contacto | CTA
- Footer: Sellos SSL/Cloudflare, pago seguro Visa/MC/PayPal, "Compra segura – Garantía de devolución"

## Imágenes (Familias Españolas Generadas)
- Hero: familia española con abuelo, padres e hijos con smartwatches
- Niño en colegio: niño español despidiéndose de su madre
- Adolescente: adolescente española haciendo senderismo
- Persona mayor: señora española caminando en plaza mediterránea

## Analytics Placeholders Ready
- **Meta Pixel**: Placeholder `META_PIXEL_ID` en index.html (usuario debe reemplazar)
- **Hotjar**: Placeholder `HOTJAR_SITE_ID` en index.html (usuario debe reemplazar)
- **Google Search Console**: Pendiente código de verificación del usuario
- **gtag + fbq**: Tracking integrado en landing CTAs

## Backlog
### P1: Usuario proporcione IDs (Meta Pixel, Hotjar, Google SC), iOS build (requiere Mac)
### P2: Remarketing/A/B testing avanzado, Multimedia (microvideos reales), SEO Fase 3
### P3: Activar integraciones mocked (112, BigQuery)
### BLOQUEADOS: SMS Infobip, SendGrid dominio, Twilio WhatsApp producción

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | super_admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
