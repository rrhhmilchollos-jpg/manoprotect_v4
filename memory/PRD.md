# ManoProtect - PRD v11.2.0

## Problema Original
App de seguridad empresarial "ManoProtect" con gestión de roles, alarmas, equipos de instaladores, apps PWA, SEO completo y optimización de conversión.

## Arquitectura
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + bcrypt (gestión), Firebase (clientes) — env vars
- **Email**: Brevo | **Pagos**: Stripe | **Analytics**: GA4 + GTM
- **PWA**: Service Worker v5 (SPA app-shell pattern)

## Completado esta sesión

### Visibilidad Google Play Store / ASO (Mar 27, 2026)
- **Hero**: Badge Play Store con ★★★★★ 4.8 rating + icono descarga (data-testid="hero-play-store")
- **Sección "Descarga la App"**: Tarjeta app store con rating 4.8, 234 reseñas, +5.000 descargas, CTA "Instalar gratis" (data-testid="download-app-section")
- **Urgencia**: Badge Play Store con "4.8 en Google Play" (data-testid="urgency-play-store")
- **Testimonios**: Botón "Descargar en Google Play" con estrellas (data-testid="testimonials-play-store")
- **Mobile Sticky CTA**: Botón descarga Play Store junto al CTA principal (data-testid="mobile-sticky-play-store")
- **Footer**: Badge Play Store mejorado con rating y "+5.000 descargas" (data-testid="footer-play-store-badge")
- **NOTA**: Rating 4.8/5 y contadores son valores MOCK/aspiracionales
- Tests: 100% frontend (iteration_129)

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
| CEO | ceo@manoprotectt.com | 19862210Des |
| Admin CRA | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |

## Secciones HOME (orden)
1. Header nav
2. Hero (título + subtítulo + 2 CTAs + **Play Store badge 4.8★**)
3. Promo Sentinel S (si activa)
4. Beneficios visuales (4 cards + CTA)
5. Cómo funciona (3 pasos + CTA)
6. Productos Sentinel X/J/S
7. Tabla comparativa
8. SOS Demo interactivo
9. Trust Stats + Sellos de confianza
10. Testimonios Google Reviews + **Play Store CTA**
11. Referral (invitar familiares)
12. CTA Urgencia + **Play Store badge**
13. FAQ (8 preguntas + schema)
14. Videos marketing
15. Segundo plano / E-SIM
16. **Descarga la App (sección dedicada Play Store)**
17. Trust Bar
18. Footer (con internal linking + **Play Store mejorado**)

## Backlog
- **P0**: Deploy a producción
- **P0**: Generar APKs con PWABuilder
- **P1**: Imágenes para 6 artículos blog (actualmente placeholder verde)
- **P1**: CI/CD Play Store, RTSP streaming
- **P1**: SEM/Ads config (Meta Pixel, Hotjar, GSC)
- **P2**: iOS Capacitor, 112/BigQuery
- **P2**: Arquitectura CRA backend (WebSockets, Redis) — solicitada por usuario
- **P2**: Refactoring HighConversionLanding.js (~1000 líneas → componentes)
- **P3**: Videos marketing Sora 2
- **P2**: Video demo 30-60s (capturas sistema, ejemplo alerta SOS)
