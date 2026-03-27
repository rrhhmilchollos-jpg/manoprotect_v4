# ManoProtect - PRD v11.1.0

## Problema Original
App de seguridad empresarial "ManoProtect" con gestión de roles, alarmas, equipos de instaladores, apps PWA, SEO completo y optimización de conversión.

## Arquitectura
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + bcrypt (gestión), Firebase (clientes) — env vars
- **Email**: Brevo | **Pagos**: Stripe | **Analytics**: GA4 + GTM
- **PWA**: Service Worker v5 (SPA app-shell pattern)

## Completado esta sesión

### Rediseño HOME completo (Mar 27, 2026)
- **Hero**: "Protege a tu familia frente a emergencias y estafas digitales" + "Activar protección" + "Probar 7 días gratis"
- **4 Beneficios visuales**: Botón SOS, Protección estafas, Localización, Seguridad familiar
- **Cómo funciona**: 3 pasos claros (Activa cuenta → Protege familia → Recibe alertas)
- **SOS Demo interactivo**: Botón animado rojo + 4 pasos de simulación
- **Trust Stats**: +2.400 familias, 24/7, 99.9%, <2s
- **Trust Seals**: SSL, AES-256, RGPD, Europa, Stripe
- **Referral**: "Invita a 3 familiares y obtén 1 mes gratis"
- **FAQ**: 8 preguntas con FAQPage + Organization Schema.org
- **CTAs repetidos** cada 2-3 secciones
- Tests: 100% backend + 100% frontend (iteration_128)

### Auditoría SEO Completa (Mar 6, 2026)
- 6 nuevos artículos blog, 4 páginas problema→solución, 4 páginas keyword SEO
- /opiniones-clientes con 12 testimonios + AggregateRating schema
- Sitemap 42 URLs, robots.txt optimizado, internal linking

### Promo TikTok Sentinel S (Mar 6, 2026)
- Backend + banner + checkout Stripe + formulario envío + admin panel

### Deploy Fix + Service Worker v5 (Mar 6, 2026)
- Firebase JSON eliminado, SW v5 app shell pattern

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO | ceo@manoprotect.com | 19862210Des |
| Admin CRA | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Secciones HOME (orden)
1. Header nav
2. Hero (título + subtítulo + 2 CTAs)
3. Promo Sentinel S (si activa)
4. Beneficios visuales (4 cards + CTA)
5. Cómo funciona (3 pasos + CTA)
6. Productos Sentinel X/J/S
7. Tabla comparativa
8. SOS Demo interactivo
9. Trust Stats + Sellos de confianza
10. Testimonios Google Reviews
11. Referral (invitar familiares)
12. CTA Urgencia
13. FAQ (8 preguntas + schema)
14. Footer (con internal linking)

## Backlog
- **P0**: Deploy a producción
- **P0**: Generar APKs con PWABuilder
- **P1**: Imágenes para 6 artículos blog (actualmente placeholder verde)
- **P1**: CI/CD Play Store, RTSP streaming
- **P1**: SEM/Ads config (Meta Pixel, Hotjar, GSC)
- **P2**: iOS Capacitor, 112/BigQuery
- **P3**: Videos marketing Sora 2
- **P2**: Video demo 30-60s (capturas sistema, ejemplo alerta SOS)
